import React, { useState, useEffect } from 'react';
import MUIDataTable, { MUIDataTableColumn } from "mui-datatables";
import FormatISODate from "../../util/FormatISODate";
import castMemberHttp from '../../util/http/cast-member-http';

const CastMemberTypeMap = {
    1: 'Diretor',
    2: 'Ator'
}

const columnsDefinition: MUIDataTableColumn[] = [
    {
        name: "name",
        label: "Nome"
    },
    {
        name: "type",
        label: "Tipo",
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return CastMemberTypeMap[value];
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

interface CastMember {
    id: string;
    name: string;
};

type Props = {};
const Table = (props: Props) => {

    const [data, setData] = useState<CastMember[]>([]);

    //componentDidMount
    useEffect(() => {
        (async () => {    //iife
            const { data } = await castMemberHttp.list<{ data: CastMember[] }>();
            setData(data.data);
        })();
    }, []);

    return (
        <MUIDataTable
            title="Listagem membros de elencos"
            columns={columnsDefinition}
            data={data}
        />
    );
}

export default Table;