import React, { Dispatch, Reducer, useEffect, useMemo, useReducer, useState } from "react";
import reducer, { Creators } from "../store/filter";
import { Actions as FilterActions, State as FilterState } from "../store/filter/types";
import { MUIDataTableColumn } from "mui-datatables";
import { useDebounce } from "use-debounce/lib";
import { useHistory } from "react-router";
import { History } from 'history';
import { isEqual } from 'lodash';
import * as yup from '../util/vendor/yup';
import { ObjectSchema } from '../util/vendor/yup';
import { MuiDataTableRefComponent } from "../components/Table";
import { ObjectShape } from "yup/lib/object";

interface FilterManagerOptions {
  schema: ObjectSchema<ObjectShape>;
  columns: MUIDataTableColumn[];
  rowsPerPage: number;
  rowsPerPageOptions: number[];
  debounceTime: number;
  history: History;
  tableRef: React.MutableRefObject<MuiDataTableRefComponent>
  extraFilter?: ExtraFilter
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
export default function useFilter(options: UseFilterOptions) {
  console.log("useFilter ", ++count);
  const history = useHistory();
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

  const filterManager = new FilterManager({ ...options, history, schema });

  // get state from url
  const INITIAL_STATE = filterManager.getStateFromURL();

  const [filterState, dispatch] = useReducer<Reducer<FilterState, FilterActions>>(reducer, INITIAL_STATE);
  const [debouncedFilterState] = useDebounce(filterState, options.debounceTime);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  filterManager.state = filterState;
  filterManager.debouncedState = debouncedFilterState;
  filterManager.dispatch = dispatch;

  filterManager.applyOrderInColumns();

  useEffect(() => {
    filterManager.replaceHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    columns: filterManager.columns,
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
  state: FilterState = null as any;
  debouncedState: FilterState = null as any;
  dispatch: Dispatch<FilterActions> = null as any;
  columns: MUIDataTableColumn[];
  rowsPerPage: number;
  rowsPerPageOptions: number[];
  history: History;
  tableRef: React.MutableRefObject<MuiDataTableRefComponent>
  extraFilter?: ExtraFilter

  constructor(options: FilterManagerOptions) {
    const {
      schema,
      columns,
      rowsPerPage,
      rowsPerPageOptions,
      history,
      tableRef,
      extraFilter
    } = options;
    this.schema = schema;
    this.columns = columns;
    this.rowsPerPage = rowsPerPage;
    this.rowsPerPageOptions = rowsPerPageOptions;
    this.history = history;
    this.tableRef = tableRef;
    this.extraFilter = extraFilter;
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

  cleanSearchText(text) {
    let newText = text;
    if (text && text.value !== undefined) {
      newText = text.value;
    }
    return newText;
  }

  replaceHistory() {
    this.history.replace({
      pathname: this.history.location.pathname,
      search: "?" + new URLSearchParams(this.formatSearchParams()),
      state: this.debouncedState
    })
  }

  pushHistory() {
    const oldState = this.history.location.state;
    if (isEqual(oldState, this.debouncedState)) { // avoid duplicates at history
      //console.log('pushHistory skipped, it is equal')
      return
    };
    //console.log('pushHistory a new location');    
    const newLocation = {
      pathname: this.history.location.pathname,
      search: "?" + new URLSearchParams(this.formatSearchParams()),
      state: {
        ...this.debouncedState,
        search: this.cleanSearchText(this.debouncedState.search)
      }
    };
    this.history.push(newLocation);
  }

  private formatSearchParams() {
    const search = this.cleanSearchText(this.debouncedState.search);
    return {  // saving if's, return null | obj
      ...(search && search !== '' && { search: search }),
      ...(this.debouncedState.pagination.page !== 1 && { page: this.debouncedState.pagination.page }),
      ...(this.debouncedState.pagination.per_page !== 15 && { per_page: this.debouncedState.pagination.per_page }),
      ...(
        this.debouncedState.order.sort && {
          sort: this.debouncedState.order.sort,
          dir: this.debouncedState.order.dir
        }
      ),
      ...( // extraFilter = {key1: val1, key2: val2} --> URL: ?key1=val1&key2=val2
        this.extraFilter && this.extraFilter.formatSearchParams(this.debouncedState)
      )
    }
  }

  getStateFromURL() {
    const queryParams = new URLSearchParams(this.history.location.search.substr(1));
    return this.schema.cast({
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
        this.extraFilter && {
          extraFilter: this.extraFilter.getStateFromURL(queryParams)
        }
      )
    })
  }
}
