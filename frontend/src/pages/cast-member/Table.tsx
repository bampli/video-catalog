import React, { useState, useEffect } from 'react';
import MUIDataTable, { MUIDataTableColumn } from "mui-datatables";
import FormatISODate from "../../util/FormatISODate";
import castMemberHttp from '../../util/http/cast-member-http';
import { CastMember, CastMemberTypeMap, ListResponse } from "../../util/models";

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

type Props = {};
const Table = (props: Props) => {

    const [data, setData] = useState<CastMember[]>([]);

    //componentDidMount
    useEffect(() => {
        let isSubscribed = true;
        (async () => {
            const { data } = await castMemberHttp.list<ListResponse<CastMember>>();
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
            title="Listagem membros de elencos"
            columns={columnsDefinition}
            data={data}
        />
    );
}

export default Table;