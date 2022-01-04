import { Dispatch, Reducer, useReducer, useState } from 'react';
import reducer, { INITIAL_STATE } from "../store/filter";
import {Actions as FilterActions, State as FilterState} from "../store/filter/types";
import {MUIDataTableColumn} from "mui-datatables";

interface FilterManagerOptions {
    columns: MUIDataTableColumn[];
    rowsPerPage: number;
    rowsPerPageOptions: number[];
    debounceTime: number;
}

export default function useFilter(options: FilterManagerOptions) {
    //console.log("useFilter");

    const filterManager = new FilterManager(options);

    // get state from url

    const [filterState, dispatch] = useReducer<Reducer<FilterState, FilterActions>>(reducer, INITIAL_STATE);
    const [totalRecords, setTotalRecords] = useState<number>(0);

    filterManager.state = filterState;
    filterManager.dispatch = dispatch;

    return {
        filterManager,
        filterState,
        dispatch,
        totalRecords,
        setTotalRecords
    }
}

export class FilterManager {

    state: FilterState = null as any;
    dispatch: Dispatch<FilterActions> = null as any;
    columns: MUIDataTableColumn[];
    rowsPerPage: number;
    rowsPerPageOptions: number[];
    debounceTime: number;

    constructor(options: FilterManagerOptions) {
        const {columns, rowsPerPage, rowsPerPageOptions, debounceTime} = options;
        this.columns = columns;
        this.rowsPerPage = rowsPerPage;
        this.rowsPerPageOptions = rowsPerPageOptions;
        this.debounceTime = debounceTime;
    }
}