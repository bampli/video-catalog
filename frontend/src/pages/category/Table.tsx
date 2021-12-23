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

interface SearchState {
    search: string;
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
    const [searchState, setSearchState] = useState<SearchState>({ search: '' });

    useEffect(() => {
        getData();
        return () => {
            subscribed.current = false;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchState]);

    async function getData() {
        setLoading(true);
        try {
            const { data } = await categoryHttp.list<ListResponse<Category>>({
                queryParams: {
                    search: searchState.search
                }
            });
            if (subscribed.current) {
                setData(data.data); // do not change when dismounting
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
                    responsive: "standard",
                    searchText: searchState.search,
                    onSearchChange:
                        (value) => value !== null
                            ? setSearchState({ search: value })
                            : setSearchState({ search: '' })
                    // onSearchChange: (value) => console.log(value)
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