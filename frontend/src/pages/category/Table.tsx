import React, { useState, useEffect } from 'react';
import MUIDataTable, { MUIDataTableColumn } from "mui-datatables";
import { httpVideo } from '../../util/http';

const columnsDefinition: MUIDataTableColumn[] = [
    {
        name: "name",
        label: "Nome"
    },
    {
        name: "is_active",
        label: "Ativo?"
    },
    {
        name: "created_at",
        label: "Criado em"
    },
];
const data = [
    { name: "teste1", is_active: true, created_at: "2021-11-10" },
    { name: "teste2", is_active: false, created_at: "2021-11-11" },
    { name: "teste3", is_active: true, created_at: "2021-11-12" },
    { name: "teste4", is_active: false, created_at: "2021-11-13" },
    { name: "teste5", is_active: true, created_at: "2021-11-16" },
];

type Props = {};

const Table = (props: Props) => {

    const [data, setData] = useState([]);

    //componentDidMount
    useEffect(() => {
        httpVideo.get('categories').then(
            response => setData(response.data.data)
        )
    }, []);

    return (
        <MUIDataTable
            title="Listagem de categorias"
            columns={columnsDefinition}
            data={data}
        />
    );
}

export default Table;