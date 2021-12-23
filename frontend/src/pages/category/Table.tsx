import React, { useEffect, useRef, useState } from 'react';
import FormatISODate from "../../util/FormatISODate";
import categoryHttp from '../../util/http/category-http';
import { BadgeNo, BadgeYes } from '../../components/Badge';
import { Category, ListResponse } from "../../util/models";
import DefaultTable, { makeActionStyles, TableColumn } from "../../components/Table";
import { useSnackbar } from 'notistack';
//import { cloneDeep } from 'lodash';
import { IconButton, MuiThemeProvider } from "@material-ui/core";
import { Link } from "react-router-dom";
import EditIcon from '@material-ui/icons/Edit';

interface Pagination {
    page: number;
    total: number;
    per_page: number;
}

interface SearchState {
    search: string;
    pagination: Pagination;
}

const columnsDefinition: TableColumn[] = [
    {
        name: "id",
        label: "ID",
        width: "30%",
        options: {
            sort: false
        }
    },
    {
        name: "name",
        label: "Nome",
        width: "43%",
    },
    {
        name: "is_active",
        label: "Ativo?",
        options: {
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

type Props = {};
const Table = (props: Props) => {

    const snackbar = useSnackbar();
    const subscribed = useRef(true);
    const [data, setData] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchState, setSearchState] = useState<SearchState>({
        search: '',
        pagination: {
            page: 1,
            total: 0,
            per_page: 10
        }
    });

    useEffect(() => {
        subscribed.current = true;
        getData();
        return () => {
            subscribed.current = false;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        searchState.search,
        searchState.pagination.page,
        searchState.pagination.per_page
    ]);

    async function getData() {
        setLoading(true);
        try {
            const { data } = await categoryHttp.list<ListResponse<Category>>({
                queryParams: {
                    search: searchState.search,
                    page: searchState.pagination.page,
                    per_page: searchState.pagination.per_page
                }
            });
            if (subscribed.current) {
                setData(data.data); // do not change when dismounting
                setSearchState((prevState => ({
                    ...prevState,
                    pagination: {
                        ...prevState.pagination,
                        total: data.meta.total
                    }
                })))
            }
        } catch (error) {
            console.error(error);
            snackbar.enqueueSnackbar(
                'Não foi possível carregar as informações',
                { variant: 'error' }
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length - 1)}>
            <DefaultTable
                title="Lista categorias"
                columns={columnsDefinition}
                data={data}
                loading={loading}
                options={{
                    serverSide: true,
                    responsive: "standard",
                    searchText: searchState.search,
                    page: searchState.pagination.page - 1,
                    rowsPerPage: searchState.pagination.per_page,
                    count: searchState.pagination.total,
                    onSearchChange:
                        (value) => value !== null
                            ? setSearchState((prevState) => ({ ...prevState, search: value }))
                            : setSearchState((prevState) => ({ ...prevState, search: '' })),
                    // onSearchChange: (value) => console.log(value),
                    onChangePage: (page) => setSearchState((prevState => ({
                        ...prevState,
                        pagination: {
                            ...prevState.pagination,
                            page: page + 1
                        }
                    }))),
                    onChangeRowsPerPage: (perPage) => setSearchState((prevState => ({
                        ...prevState,
                        pagination: {
                            ...prevState.pagination,
                            per_page: perPage
                        }
                    })))
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