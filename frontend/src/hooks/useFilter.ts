import React, { Dispatch, Reducer, useCallback, useEffect, useMemo, useReducer, useState } from "react";
import reducer, { Creators } from "../store/filter";
import { Actions as FilterActions, State as FilterState } from "../store/filter/types";
import { MUIDataTableColumn } from "mui-datatables";
import { useDebounce } from "use-debounce/lib";
import { useHistory, useLocation } from "react-router";
//import { History } from 'history';
import { isEqual } from 'lodash';
import * as yup from '../util/vendor/yup';
import { ObjectSchema } from '../util/vendor/yup';
import { MuiDataTableRefComponent } from "../components/Table";
import { ObjectShape } from "yup/lib/object";

interface FilterManagerOptions {
  schema: ObjectSchema<ObjectShape>;
  columns: MUIDataTableColumn[];
  rowsPerPage: number;
  tableRef: React.MutableRefObject<MuiDataTableRefComponent>
  dispatch: Dispatch<FilterActions>;
  state: FilterState;
}

interface ExtraFilter {
  getStateFromURL: (queryParams: URLSearchParams) => any,
  formatSearchParams: (debouncedState: FilterState) => any,
  createValidationSchema: () => any,
}

interface UseFilterOptions {
  columns: MUIDataTableColumn[];
  rowsPerPage: number;
  rowsPerPageOptions: number[];
  debounceTime: number;
  tableRef: React.MutableRefObject<MuiDataTableRefComponent>
  extraFilter?: ExtraFilter
}

let count = 0;

//
// u s e F i l t e r
//
export default function useFilter(options: UseFilterOptions) {
  console.log("useFilter ", ++count);
  const history = useHistory();
  const location = useLocation();
  const {search: locationSearch, pathname: locationPathname, state: locationState} = location;
  const { rowsPerPageOptions, rowsPerPage, columns, extraFilter } = options;

  // this schema was moved from FilterManager to be processed just once here
  // otherwise it would be recalculated at every page rendering
  const schema = useMemo(() => {
    return yup.object().shape({
      search: yup
        .string()
        .transform((value) => (!value ? undefined : value))
        .default(""),
      pagination: yup.object().shape({
        page: yup
          .number()
          .transform((value) =>
            isNaN(value) || parseInt(value) < 1 ? undefined : value
          )
          .default(1),
        per_page: yup
          .number()
          .transform(value =>
            isNaN(value) || !rowsPerPageOptions.includes(parseInt(value)) ? undefined : value
          )
          .default(rowsPerPage)
      }),
      order: yup.object().shape({
        sort: yup.string()
          .nullable()
          .transform((value) => {
            const columnsName = columns
              .filter((column) => !column.options || column.options.sort !== false)
              .map((column) => column.name);
            return columnsName.includes(value) ? value : undefined;
          })
          .default(null),
        dir: yup.string()
          .nullable()
          .transform(value => !value || !['asc', 'desc'].includes(value.toLowerCase()) ? undefined : value)
          .default(null)
      }),
      ...(
        extraFilter && {
          extraFilter: extraFilter.createValidationSchema()
        }
      )
    })
  }, [rowsPerPageOptions, rowsPerPage, columns, extraFilter]);

  const cleanSearchText = useCallback((text) => {
    let newText = text;
    if (text && text.value !== undefined) {
      newText = text.value;
    }
    return newText;
  }, []);

  const formatSearchParams = useCallback((state, extraFilter) => {
    const search = cleanSearchText(state.search);
    return {  // saving if's, return null | obj
      ...(search && search !== '' && { search: search }),
      ...(state.pagination.page !== 1 && { page: state.pagination.page }),
      ...(state.pagination.per_page !== 15 && { per_page: state.pagination.per_page }),
      ...(
        state.order.sort && {
          sort: state.order.sort,
          dir: state.order.dir
        }
      ),
      ...( // extraFilter = {key1: val1, key2: val2} --> URL: ?key1=val1&key2=val2
        extraFilter && extraFilter.formatSearchParams(state)
      )
    }
  }, [cleanSearchText]);

  // react-router: history is mutable & location is immutable
  const stateFromURL = useMemo(() => {
    const queryParams = new URLSearchParams(locationSearch.substr(1));
    return schema.cast({
      search: queryParams.get('search'),
      pagination: {
        page: queryParams.get('page'),
        per_page: queryParams.get('per_page')
      },
      order: {
        sort: queryParams.get('sort'),
        dir: queryParams.get('dir')
      },
      ...(
        extraFilter && {
          extraFilter: extraFilter.getStateFromURL(queryParams)
        }
      )
    })
  }, [locationSearch, schema, extraFilter]);

  //
  // f i l t e r M a n a g e r
  //
  const INITIAL_STATE = stateFromURL;
  const [filterState, dispatch] = useReducer<Reducer<FilterState, FilterActions>>(reducer, INITIAL_STATE);
  const filterManager = new FilterManager({ ...options, state: filterState, dispatch, schema });
  const [debouncedFilterState] = useDebounce(filterState, options.debounceTime);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  useEffect(() => {
    history.replace({
      pathname: locationPathname,
      search: "?" + new URLSearchParams(formatSearchParams(stateFromURL, extraFilter)),
      state: stateFromURL
    })
  }, [history, locationPathname, stateFromURL, extraFilter, formatSearchParams]);

  useEffect(() => {
    const oldState = locationState;
    const nextState = debouncedFilterState;
    if (isEqual(oldState, nextState)) {
      //console.log('isEqual');
      return;
    }
    //console.log('push history a new location');    
    const newLocation = {
      pathname: locationPathname,
      search: "?" + new URLSearchParams(formatSearchParams(debouncedFilterState, extraFilter)),
      state: {
        ...debouncedFilterState,
        search: cleanSearchText(debouncedFilterState.search)
      }
    };
    history.push(newLocation);
  }, [
    cleanSearchText, locationState, locationPathname,
    debouncedFilterState, extraFilter, formatSearchParams, history
  ]);
  
  filterManager.state = filterState;

  filterManager.applyOrderInColumns();

  return {
    columns: filterManager.columns,
    cleanSearchText,
    filterManager,
    filterState,
    debouncedFilterState,
    dispatch,
    totalRecords,
    setTotalRecords,
  };
}

export class FilterManager {
  schema;
  state: FilterState;
  dispatch: Dispatch<FilterActions>;
  columns: MUIDataTableColumn[];
  rowsPerPage: number;
  tableRef: React.MutableRefObject<MuiDataTableRefComponent>

  constructor(options: FilterManagerOptions) {
    const {
      schema,
      columns,
      rowsPerPage,
      tableRef,
      dispatch,
      state,
    } = options;
    this.schema = schema;
    this.columns = columns;
    this.rowsPerPage = rowsPerPage;
    this.tableRef = tableRef;
    this.dispatch = dispatch;
    this.state = state;
  }

  private resetTablePagination() {
    this.tableRef.current.changeRowsPerPage(this.rowsPerPage);
    this.tableRef.current.changePage(0);
  }

  changeSearch(value) {
    this.dispatch(Creators.setSearch({ search: value }));
  }

  changePage(page) {
    this.dispatch(Creators.setPage({ page: page + 1 }));
  }

  changeRowsPerPage(perPage) {
    this.dispatch(Creators.setPerPage({ per_page: perPage }));
  }

  changeColumnSort(changedColumn: string, direction: string) {
    this.dispatch(
      Creators.setOrder({
        sort: changedColumn,
        dir: direction.includes("desc") ? "desc" : "asc",
      })
    );
    this.resetTablePagination();
  }

  changeExtraFilter(data) { //{type: 'Director'}
    this.dispatch(Creators.updateExtraFilter(data));
  }

  resetFilter() {
    const INITIAL_STATE = {
      ...this.schema.cast({}),
      search: { value: null, update: true }
    };
    this.dispatch(Creators.setReset({ state: INITIAL_STATE }));
    this.resetTablePagination();
  }

  applyOrderInColumns() {
    this.columns = this.columns.map((column) => {
      return column.name === this.state.order.sort
        ? {
          ...column,
          options: {
            ...column.options,
            sortOrder: this.state.order,
          },
        }
        : column;
    });
  }
}
