import React, { useCallback, useContext, useMemo, useRef, useState, useEffect } from 'react';
import FormatISODate from "../../util/FormatISODate";
import categoryHttp from '../../util/http/category-http';
import genreHttp from '../../util/http/genre-http';
import { BadgeNo, BadgeYes } from '../../components/Badge';
import { Category, Genre, ListResponse } from "../../util/models";
import DefaultTable, { makeActionStyles, MuiDataTableRefComponent, TableColumn } from "../../components/Table";
import { useSnackbar } from 'notistack';
import { IconButton, MuiThemeProvider } from "@material-ui/core";
import { Link } from "react-router-dom";
import EditIcon from '@material-ui/icons/Edit';
import * as yup from '../../util/vendor/yup';
import { FilterResetButton } from '../../components/Table/FilterResetButton';
import { Creators } from "../../store/filter";
import useFilter from "../../hooks/useFilter";
import LoadingContext from '../../components/loading/LoadingContext';

const columnsDefinition: TableColumn[] = [
    {
        name: "id",
        label: "ID",
        width: "30%",
        options: {
            sort: false,
            filter: false,
        }
    },
    {
        name: "name",
        label: "Nome",
        width: "30%",
        options: {
            filter: false
        }
    },
    {
        name: "categories",
        label: "Categorias",
        width: "30%",
        options: {
            filterType: 'multiselect',
            filterOptions: {
                names: []
            },
            customBodyRender: (value, tableMeta, updateValue) => {
                return value.map(value => value.name).join(", ");
            },
        }
    },
    {
        name: "is_active",
        label: "Ativo?",
        options: {
            filter: false,
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
            },
        }
    },
    {
        name: "actions",
        label: "A????es",
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
                        to={`/genres/${tableMeta.rowData[0]}/edit`}
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

const Table = () => {

    const { enqueueSnackbar } = useSnackbar();
    const subscribed = useRef(true);
    const [data, setData] = useState<Genre[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [categories, setCategories] = useState<Category[]>([]);
    const loading = useContext(LoadingContext);
    const tableRef = useRef() as React.MutableRefObject<MuiDataTableRefComponent>;
    const extraFilter = useMemo(() => ({
        createValidationSchema: () => {
            return yup.object().shape({
                type: yup.mixed()
                    .nullable()
                    .transform(value => {
                        return !value || value === '' ? undefined : value.split(',');
                    })
                    .default(null)
            })
        },
        formatSearchParams: (debouncedState) => {
            return debouncedState.extraFilter
                ? {
                    ...(
                        debouncedState.extraFilter.categories &&
                        { categories: debouncedState.extraFilter.categories.join(',') }
                    ),
                }
                : undefined
        },
        getStateFromURL: (queryParams) => {
            return {
                categories: queryParams.get('categories')
            }
        }
    }), []);

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

    const searchTest = cleanSearchText(debouncedFilterState.search);
    const indexColumnCategories = columns.findIndex(c => c.name === 'categories');
    const columnCategories = columns[indexColumnCategories];
    const categoriesFilterValue = filterState.extraFilter && filterState.extraFilter.categories;
    (columnCategories.options as any).filterList = categoriesFilterValue ? categoriesFilterValue : [];
    // console.log(
    //     "Table: categoriesFilterValue ", categoriesFilterValue,
    //     "filterList", (columnCategories.options as any).filterList
    // );

    const getData = useCallback(async ({ search, page, per_page, sort, dir, categories }) => {
        try {
            //console.log("debouncedFilterState", debouncedFilterState);
            const { data } = await genreHttp.list<ListResponse<Genre>>({
                queryParams: {
                    search,
                    page,
                    per_page,
                    sort,
                    dir,
                    ...(
                        categories &&
                        { categories: categories.join(',') }
                    )
                }
            });

            if (subscribed.current) {   // do not change when dismounting
                setData(data.data);
                setTotalRecords(data.meta.total);
            }
        } catch (error) {
            console.error(error);
            if (genreHttp.isCancelledRequest(error)) {
                return;
            }
            enqueueSnackbar(
                'N??o foi poss??vel carregar g??neros',
                { variant: 'error' }
            );
        }
    }, [enqueueSnackbar, setTotalRecords]);

    useEffect(() => {
        let isSubscribed = true;
        (async () => {
            try {
                const { data } = await categoryHttp.list({ queryParams: { all: '' } });
                if (isSubscribed) {
                    setCategories(data.data);
                    (columnCategories.options as any)
                        .filterOptions.names = data.data.map(category => category.name)
                }
            } catch (error) {
                console.error(error);
                enqueueSnackbar(
                    'N??o foi poss??vel carregar categorias',
                    { variant: 'error' }
                );
            }
        })();

        return () => {
            isSubscribed = false;
        }
    }, [columnCategories.options, enqueueSnackbar]);

    useEffect(() => {
        subscribed.current = true;
        getData({
            search: searchTest,
            page: debouncedFilterState.pagination.page,
            per_page: debouncedFilterState.pagination.per_page,
            sort: debouncedFilterState.order.sort,
            dir: debouncedFilterState.order.dir,
            ...(
                debouncedFilterState?.extraFilter?.categories &&
                {categories: debouncedFilterState.extraFilter.categories}
            )
        });
        return () => {
            subscribed.current = false;
        }
    }, [
        getData,
        searchTest,
        debouncedFilterState.pagination.page,
        debouncedFilterState.pagination.per_page,
        debouncedFilterState.order,
        debouncedFilterState.extraFilter
    ]);

    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length - 1)}>
            <DefaultTable
                title="Lista g??neros"
                columns={columns}
                data={data}
                loading={loading}
                debouncedSearchTime={debounceSearchTime}
                ref={tableRef}
                options={{
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