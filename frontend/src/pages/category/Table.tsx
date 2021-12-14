import React, { useState, useEffect } from 'react';
import FormatISODate from "../../util/FormatISODate";
import categoryHttp from '../../util/http/category-http';
import { BadgeNo, BadgeYes } from '../../components/Badge';
import { Category, ListResponse } from "../../util/models";
import DefaultTable, { TableColumn } from "../../components/Table";
import { useSnackbar } from 'notistack';

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
        width: "13%"
    },
];

type Props = {};
const Table = (props: Props) => {

    const snackbar = useSnackbar();
    const [data, setData] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    //componentDidMount
    useEffect(() => {
        let isSubscribed = true;    // flag for critical region required by async
        (async () => {
            setLoading(true);
            try {
                const { data } = await categoryHttp.list<ListResponse<Category>>();
                if (isSubscribed) {
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
        })();

        return () => {              // flag that component already dismounted
            isSubscribed = false;
        }
        //3 (async function () {
        //3     const { data } = await categoryHttp.list<{ data: Category[] }>();
        //3     setData(data.data);
        //3 })();
        //2 categoryHttp
        //2     .list<{ data: Category[] }>()     // {data: [], meta}
        //2     .then(({ data }) => setData(data.data));
        //1 httpVideo.get('categories').then(
        //1     response => setData(response.data.data)
        //1 )
    }, []);

    return (
        <DefaultTable
            title="Listagem categorias"
            columns={columnsDefinition}
            data={data}
            loading={loading}
        />
    );
}

export default Table;