import React, { useState, useEffect } from 'react';
import MUIDataTable, { MUIDataTableColumn } from "mui-datatables";
import FormatISODate from "../../util/FormatISODate";
import categoryHttp from '../../util/http/category-http';
import { BadgeNo, BadgeYes } from '../../components/Badge';

const columnsDefinition: MUIDataTableColumn[] = [
    {
        name: "name",
        label: "Nome"
    },
    {
        name: "is_active",
        label: "Ativo?",
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return value ? <BadgeYes /> : <BadgeNo />;
            }
        }
    },
    {
        name: "created_at",
        label: "Criado em",
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return <span>{FormatISODate(value)}</span>;
            }
        }
    },
];

interface Category {
    id: string;
    name: string;
};

type Props = {};
const Table = (props: Props) => {

    const [data, setData] = useState<Category[]>([]);

    //componentDidMount
    useEffect(() => {
        let isSubscribed = true;    // flag for critical region required by async
        (async () => {
            const { data } = await categoryHttp.list<{ data: Category[] }>();
            if (isSubscribed) {
                setData(data.data); // do not change when dismounting
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
        <MUIDataTable
            title="Listagem categorias"
            columns={columnsDefinition}
            data={data}
        />
    );
}

export default Table;