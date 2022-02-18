import React, { useContext, useEffect, useRef, useState } from 'react';
import FormatISODate from "../../util/FormatISODate";
import categoryHttp from '../../util/http/category-http';
import { BadgeNo, BadgeYes } from '../../components/Badge';
import { Category, ListResponse } from "../../util/models";
import DefaultTable, { makeActionStyles, MuiDataTableRefComponent, TableColumn } from "../../components/Table";
import { useSnackbar } from 'notistack';
//import { cloneDeep } from 'lodash';
import { IconButton, MuiThemeProvider } from "@material-ui/core";
import { Link } from "react-router-dom";
import EditIcon from '@material-ui/icons/Edit';
import * as yup from '../../util/vendor/yup';
import { FilterResetButton } from '../../components/Table/FilterResetButton';
import { Creators } from "../../store/filter";
import useFilter from "../../hooks/useFilter";
import { invert } from 'lodash';
import LoadingContext from '../../components/loading/LoadingContext';

// NOTE: "is_active" filter uses an extraFilter, since mui-datatables version 3 deprecated
// the "serverSideFilterList" in favor of the "confirmFilters" option. More details below.
// https://github.com/gregnb/mui-datatables/blob/master/docs/v2_to_v3_guide.md#serversidefilterlist-is-deprecated-in-favor-of-the-confirmfilters-option

const YesNoMap = {
    1: 'Sim',
    0: 'Não'
};
const yesNo = Object.values(YesNoMap);

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
        width: "43%",
        options: {
            filter: false
        }
    },
    {
        name: "is_active",
        label: "Ativo?",
        options: {
            filterOptions: {
                names: yesNo
            },
            customBodyRender(value, tableMeta, updateValue) {
                return value ? <BadgeYes /> : <BadgeNo />;
            }
        },
        width: "4%",
    },
    {
        name: "created_at",
        label: "Criado em",
        width: "10%",
        options: {
            filter: false,
            customBodyRender(value, tableMeta, updateValue) {
                return <span>{FormatISODate(value)}</span>;
            }
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
                        to={`/categories/${tableMeta.rowData[0]}/edit`}
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
            is_active: yup.string()  // na URL: ?is_active=Sim
                .nullable()
                .transform(value => {
                    return !value || !yesNo.includes(value) ? undefined : value;
                })
                .default(null)
        })
    },
    formatSearchParams: (debouncedState) => {
        return debouncedState.extraFilter
            ? {
                ...(
                    debouncedState.extraFilter.is_active &&
                    { is_active: debouncedState.extraFilter.is_active }
                ),
            }
            : undefined
    },
    getStateFromURL: (queryParams) => {
        return {
            is_active: queryParams.get('is_active')
        }
    }
};

const Table = () => {

    const snackbar = useSnackbar();
    const subscribed = useRef(true);
    const [data, setData] = useState<Category[]>([]);
    const loading = useContext(LoadingContext);
    const tableRef = useRef() as React.MutableRefObject<MuiDataTableRefComponent>;

    const {
        columns,
        filterManager,
        cleanSearchText,
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

    const indexColumnIsActive = columns.findIndex(c => c.name === 'is_active');
    const columnIsActive = columns[indexColumnIsActive];
    const isActiveFilterValue = filterState.extraFilter && filterState.extraFilter.is_active; //as never;
    (columnIsActive.options as any).filterList = isActiveFilterValue ? [isActiveFilterValue] : [];
    // console.log(
    //     "Table: isActiveFilterValue ", isActiveFilterValue,
    //     "filterList", (columnIsActive.options as any).filterList
    // );

    useEffect(() => {
        subscribed.current = true;
        getData();
        return () => {
            subscribed.current = false;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        // eslint-disable-next-line react-hooks/exhaustive-deps
        cleanSearchText(debouncedFilterState.search),
        debouncedFilterState.pagination.page,
        debouncedFilterState.pagination.per_page,
        debouncedFilterState.order,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        JSON.stringify(debouncedFilterState.extraFilter),
    ]);

    async function getData() {
        try {
            //console.log("debouncedFilterState", debouncedFilterState);
            const { data } = await categoryHttp.list<ListResponse<Category>>({
                queryParams: {
                    search: cleanSearchText(debouncedFilterState.search),
                    page: debouncedFilterState.pagination.page,
                    per_page: debouncedFilterState.pagination.per_page,
                    sort: debouncedFilterState.order.sort,
                    dir: debouncedFilterState.order.dir,
                    ...(debouncedFilterState.extraFilter &&
                        debouncedFilterState.extraFilter.is_active && {
                        is_active: invert(YesNoMap)[debouncedFilterState.extraFilter.is_active]
                    })
                }
            });
            // console.log("getData: queryParams", {
            //     queryParams: {
            //         search: cleanSearchText(debouncedFilterState.search),
            //         page: debouncedFilterState.pagination.page,
            //         per_page: debouncedFilterState.pagination.per_page,
            //         sort: debouncedFilterState.order.sort,
            //         dir: debouncedFilterState.order.dir,
            //         ...(debouncedFilterState.extraFilter &&
            //             debouncedFilterState.extraFilter.is_active && {
            //             is_active: invert(YesNoMap)[debouncedFilterState.extraFilter.is_active]
            //         })
            //     }
            // });

            if (subscribed.current) {   // do not change when dismounting
                setData(data.data);
                setTotalRecords(data.meta.total);
            }
        } catch (error) {
            console.error(error);
            if (categoryHttp.isCancelledRequest(error)) {
                return;
            }
            snackbar.enqueueSnackbar(
                'Não foi possível carregar categorias',
                { variant: 'error' }
            );
        }
    }

    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length - 1)}>
            {/* {loading ? "true" : "false"} */}
            <DefaultTable
                title="Lista categorias"
                columns={columns}
                data={data}
                loading={loading}
                debouncedSearchTime={debounceSearchTime}
                ref={tableRef}
                options={{
                    //serverSideFilterList: [], // see note at the top
                    serverSide: true,
                    responsive: "standard",
                    searchText: filterState.search as any,
                    page: filterState.pagination.page - 1,
                    rowsPerPage: filterState.pagination.per_page,
                    rowsPerPageOptions,
                    count: totalRecords,
                    onFilterChange: (column, filterList, type) => {
                        const columnIndex = columns.findIndex(c => c.name === column);
                        //console.log("onFilterChange:", "column", column, "filterList", filterList);
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
                        filterManager.changeColumnSort(changedColumn, direction)
                }}
            />
        </MuiThemeProvider>
    );
}

export default Table;

    // //componentDidMount
    // useEffect(() => {
    //     getData();
    //     return () => {              // flag that component already dismounted
    //         subscribed.current = false;
    //     }
    //     //3 (async function () {
    //     //3     const { data } = await categoryHttp.list<{ data: Category[] }>();
    //     //3     setData(data.data);
    //     //3 })();
    //     //2 categoryHttp
    //     //2     .list<{ data: Category[] }>()     // {data: [], meta}
    //     //2     .then(({ data }) => setData(data.data));
    //     //1 httpVideo.get('categories').then(
    //     //1     response => setData(response.data.data)
    //     //1 )
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, []);