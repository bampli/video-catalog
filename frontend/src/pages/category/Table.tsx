import React, { useState, useEffect } from 'react';
import MUIDataTable, { MUIDataTableColumn } from "mui-datatables";
import { httpVideo } from '../../util/http';
import { Chip } from "@material-ui/core";
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";

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
                return value ? <Chip label="Sim" color="primary" /> : <Chip label="Não" color="secondary" />;
            }
        }
    },
    {
        name: "created_at",
        label: "Criado em",
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return <span>{format(parseISO(value), 'dd/MM/yyyy')}</span>;
            }
        }
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