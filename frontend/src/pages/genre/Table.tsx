import React, { useState, useEffect } from 'react';
import MUIDataTable, { MUIDataTableColumn } from "mui-datatables";
import FormatISODate from "../../util/FormatISODate";
import genreHttp from '../../util/http/genre-http';
import { BadgeNo, BadgeYes } from '../../components/Badge';
import { Genre, ListResponse } from "../../util/models";

const columnsDefinition: MUIDataTableColumn[] = [
    {
        name: "name",
        label: "Nome"
    },
    {
        name: "categories",
        label: "Categorias",
        options: {
            customBodyRender: (value, tableMeta, updateValue) => {
                return value.map(value => value.name).join(", ");
            }
        }
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

type Props = {};
const Table = (props: Props) => {

    const [data, setData] = useState<Genre[]>([]);

    //componentDidMount
    useEffect(() => {
        let isSubscribed = true;
        (async () => {
            const {data} = await genreHttp.list<ListResponse<Genre>>();
            if (isSubscribed) {
                setData(data.data);
            }
        })();

        return () => {
            isSubscribed = false;
        }
    }, []);

    return (
        <MUIDataTable
            title="Listagem gêneros"
            columns={columnsDefinition}
            data={data}
        />
    );
}

export default Table;