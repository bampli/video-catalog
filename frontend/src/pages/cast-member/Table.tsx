import React, { useState, useEffect } from 'react';
import DefaultTable, { makeActionStyles, TableColumn } from "../../components/Table";
import FormatISODate from "../../util/FormatISODate";
import castMemberHttp from '../../util/http/cast-member-http';
import { CastMember, CastMemberTypeMap, ListResponse } from "../../util/models";
import { IconButton, MuiThemeProvider, Theme } from "@material-ui/core";
import { Link } from "react-router-dom";
import EditIcon from '@material-ui/icons/Edit';

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
        width: "37%",
    },
    {
        name: "type",
        label: "Tipo",
        width: "20%",
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return CastMemberTypeMap[value];
            }
        }
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
                console.log(tableMeta);
                return (
                    <IconButton
                        color={'secondary'}
                        component={Link}
                        to={`/cast-members/${tableMeta.rowData[0]}/edit`}
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
        <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length - 1)}>
            <DefaultTable
                title="Lista membros de elencos"
                columns={columnsDefinition}
                data={data}
            />
        </MuiThemeProvider>
    );
}

export default Table;