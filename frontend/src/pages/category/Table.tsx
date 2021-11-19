import React, { useState, useEffect } from 'react';
import MUIDataTable, { MUIDataTableColumn } from "mui-datatables";
import { httpVideo } from '../../util/http';
import { Chip } from "@material-ui/core";
import FormatISODate from "../../util/FormatISODate";

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
                return <span>{FormatISODate(value)}</span>;
            }
        }
    },
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