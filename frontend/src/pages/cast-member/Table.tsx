import React, { useRef, useState, useEffect } from 'react';
import DefaultTable, { makeActionStyles, MuiDataTableRefComponent, TableColumn } from "../../components/Table";
import { useSnackbar } from 'notistack';
import FormatISODate from "../../util/FormatISODate";
import castMemberHttp from '../../util/http/cast-member-http';
import { CastMember, CastMemberTypeMap, ListResponse } from "../../util/models";
import { Button, IconButton, MuiThemeProvider } from "@material-ui/core";
import { Link } from "react-router-dom";
import EditIcon from '@material-ui/icons/Edit';
import * as yup from '../../util/vendor/yup';
import { FilterResetButton } from '../../components/Table/FilterResetButton';
import { Creators } from "../../store/filter";
import useFilter from "../../hooks/useFilter";
import { invert } from 'lodash';

const castMemberNames = Object.values(CastMemberTypeMap);

const columnsDefinition: TableColumn[] = [
    {
        name: "id",
        label: "ID",
        width: "30%",
        options: {
            sort: false,
            filter: false
        }
    },
    {
        name: "name",
        label: "Nome",
        width: "37%",
        options: {
            filter: false
        }
    },
    {
        name: "type",
        label: "Tipo",
        width: "20%",
        options: {
            filterOptions: {
                names: castMemberNames
            },
            customBodyRender(value, tableMeta, updateValue) {
                return CastMemberTypeMap[value];
            }
        }
    },
    {
        name: "created_at",
        label: "Criado em",
        width: "10%",
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return <span>{FormatISODate(value)}</span>;
            },
            filter: false
        }
    },
    {
        name: "actions",
        label: "Ações",
        width: "13%",
        options: {
            sort: false,
            filter: false,
            customBodyRender: (value, tableMeta) => {
                //console.log(tableMeta);
                return (
                    <IconButton
                        color={'secondary'}
                        component={Link}
                        to={`/cast-members/${tableMeta.rowData[0]}/edit`}
                    >
                        <EditIcon />
                    </IconButton>
                )
            }
        }
    },
];

const debounceTime = 300;
const debounceSearchTime = 300;
const rowsPerPage = 15;
const rowsPerPageOptions = [15, 25, 50];

const extraFilter = {
    createValidationSchema: () => {
        return yup.object().shape({
            type: yup.string()  // na URL: ?type=Director
                .nullable()
                .transform(value => {
                    return !value || !castMemberNames.includes(value) ? undefined : value;
                })
                .default(null)
        })
    },
    formatSearchParams: (debouncedState) => {
        return debouncedState.extraFilter
            ? {
                ...(
                    debouncedState.extraFilter.type &&
                    { type: debouncedState.extraFilter.type }
                ),
            }
            : undefined
    },
    getStateFromURL: (queryParams) => {
        return {
            type: queryParams.get('type')
        }
    }
};

const Table = () => {

    const snackbar = useSnackbar();
    const subscribed = useRef(true);
    const [data, setData] = useState<CastMember[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const tableRef = useRef() as React.MutableRefObject<MuiDataTableRefComponent>;

    const {
        columns,
        filterManager,
        filterState,
        debouncedFilterState,
        dispatch,
        totalRecords,
        setTotalRecords,
    } = useFilter({
        columns: columnsDefinition,
        debounceTime: debounceTime,
        rowsPerPage,
        rowsPerPageOptions,
        tableRef,
        extraFilter
    });

    const indexColumnType = columns.findIndex(c => c.name === 'type');
    const columnType = columns[indexColumnType];
    const typeFilterValue = filterState.extraFilter && filterState.extraFilter.type; //as never;
    (columnType.options as any).filterList = typeFilterValue ? [typeFilterValue] : [];

    // const serverSideFilterList = columns.map(column => []);
    // if (typeFilterValue) serverSideFilterList[indexColumnType] = typeFilterValue;
    // console.log(
    //     "typeFilterValue", typeFilterValue,
    //     "serverSideFilterList", serverSideFilterList,
    //     "filterList", (columnType.options as any).filterList
    // );
    // typeFilterValue Diretor
    // serverSideFilterList 
    // (5) [Array(0), Array(0), 'Diretor', Array(0), Array(0)]
    //  filterList 
    // ['Diretor']

    useEffect(() => {
        subscribed.current = true;
        filterManager.pushHistory();
        getData();
        return () => {
            subscribed.current = false;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        // eslint-disable-next-line react-hooks/exhaustive-deps
        filterManager.cleanSearchText(debouncedFilterState.search),
        debouncedFilterState.pagination.page,
        debouncedFilterState.pagination.per_page,
        debouncedFilterState.order,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        JSON.stringify(debouncedFilterState.extraFilter), //"{"type": "Diretor"}"
    ]);

    async function getData() {
        setLoading(true);
        try {
            const { data } = await castMemberHttp.list<ListResponse<CastMember>>({
                queryParams: {
                    search: filterManager.cleanSearchText(debouncedFilterState.search),
                    page: debouncedFilterState.pagination.page,
                    per_page: debouncedFilterState.pagination.per_page,
                    sort: debouncedFilterState.order.sort,
                    dir: debouncedFilterState.order.dir,
                    ...(debouncedFilterState.extraFilter &&
                        debouncedFilterState.extraFilter.type && {
                        type: invert(CastMemberTypeMap)[debouncedFilterState.extraFilter.type],
                    })
                }
            });
            if (subscribed.current) {   // do not change when dismounting
                setData(data.data);
                setTotalRecords(data.meta.total);
            }
        } catch (error) {
            console.error(error);
            if (castMemberHttp.isCancelledRequest(error)) {
                return;
            }
            snackbar.enqueueSnackbar(
                'Não foi possível carregar membros do elenco',
                { variant: 'error' }
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length - 1)}>
            <DefaultTable
                title="Lista membros de elencos"
                columns={columns}
                data={data}
                loading={loading}
                debouncedSearchTime={debounceSearchTime}
                ref={tableRef}
                options={{
                    //serverSideFilterList: serverSideFilterList,
                    serverSide: true,
                    responsive: "standard",
                    searchText: filterState.search as any,
                    page: filterState.pagination.page - 1,
                    rowsPerPage: filterState.pagination.per_page,
                    rowsPerPageOptions,
                    count: totalRecords,
                    onFilterChange: (column, filterList) => {
                        const columnIndex = columns.findIndex(c => c.name === column);
                        console.dir("onFilterChange filterList", filterList);
                        filterManager.changeExtraFilter({
                            [column as string]: filterList[columnIndex].length ? filterList[columnIndex] : null
                        })
                    },
                    customToolbar: () => (
                        <FilterResetButton
                            handleClick={() => {
                                dispatch(Creators.setReset({ state: filterState }));
                            }}
                        />
                    ),
                    onSearchChange: (value) => filterManager.changeSearch(value),
                    onChangePage: (page) => filterManager.changePage(page),
                    onChangeRowsPerPage: (perPage) => filterManager.changeRowsPerPage(perPage),
                    onColumnSortChange: (changedColumn: string, direction: string) =>
                        filterManager.changeColumnSort(changedColumn, direction),
                }}
            />
        </MuiThemeProvider>
    );
}

export default Table;