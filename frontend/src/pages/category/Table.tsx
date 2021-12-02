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
        categoryHttp
            .list<{ data: Category[] }>()     // {data: [], meta}
            .then(({ data }) => setData(data.data));
        // httpVideo.get('categories').then(
        //     response => setData(response.data.data)
        // )
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