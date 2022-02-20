import React, { useCallback, useContext, useRef, useState, useEffect } from 'react';
import FormatISODate from "../../util/FormatISODate";
import videoHttp from '../../util/http/video-http';
import { ListResponse, Video } from "../../util/models";
import DefaultTable, { makeActionStyles, MuiDataTableRefComponent, TableColumn } from "../../components/Table";
import { useSnackbar } from 'notistack';
import { IconButton, MuiThemeProvider } from "@material-ui/core";
import { Link } from "react-router-dom";
import EditIcon from '@material-ui/icons/Edit';
import { FilterResetButton } from '../../components/Table/FilterResetButton';
import useFilter from "../../hooks/useFilter";
import useDeleteCollection from "../../hooks/useDeleteCollection";
import DeleteDialog from '../../components/DeleteDialog';
import LoadingContext from '../../components/loading/LoadingContext';

const columnsDefinition: TableColumn[] = [
    {
        name: "id",
        label: "ID",
        width: "30%",
        options: {
            sort: false,
            filter: false,
        }
    },
    {
        name: "title",
        label: "Título",
        width: "20%",
        options: {
            filter: false
        }
    },
    {
        name: "genres",
        label: "Gêneros",
        width: "13%",
        options: {
            sort: false,
            filter: false,
            customBodyRender: (value, tableMeta, updateValue) => {
                return value.map(value => value.name).join(", ");
            },
        }
    },
    {
        name: "categories",
        label: "Categorias",
        width: "12%",
        options: {
            sort: false,
            filter: false,
            customBodyRender: (value, tableMeta, updateValue) => {
                return value.map(value => value.name).join(", ");
            },
        }
    },
    {
        name: "created_at",
        label: "Criado em",
        width: "10%",
        options: {
            filter: false,
            customBodyRender(value, tableMeta, updateValue) {
                return <span>{FormatISODate(value)}</span>;
            },
        }
    },
    {
        name: "actions",
        label: "Ações",
        width: "13%",
        options: {
            sort: false,
            filter: false,
            customBodyRender: (value, tableMeta) => {
                //console.log(tableMeta);
                return (
                    <IconButton
                        color={'secondary'}
                        component={Link}
                        to={`/videos/${tableMeta.rowData[0]}/edit`}
                    >
                        <EditIcon />
                    </IconButton>
                )
            }
        }
    },
];

const debounceTime = 300;
const debounceSearchTime = 300;
const rowsPerPage = 15;
const rowsPerPageOptions = [15, 25, 50];

const Table = () => {

    const { enqueueSnackbar } = useSnackbar();
    const subscribed = useRef(true);
    const [data, setData] = useState<Video[]>([]);
    const loading = useContext(LoadingContext);
    const { openDeleteDialog, setOpenDeleteDialog, rowsToDelete, setRowsToDelete } = useDeleteCollection();
    const tableRef = useRef() as React.MutableRefObject<MuiDataTableRefComponent>;

    const {
        columns,
        filterManager,
        cleanSearchText,
        filterState,
        debouncedFilterState,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        dispatch,
        totalRecords,
        setTotalRecords,
    } = useFilter({
        columns: columnsDefinition,
        debounceTime: debounceTime,
        rowsPerPage,
        rowsPerPageOptions,
        tableRef,
    });

    const searchTest = cleanSearchText(debouncedFilterState.search);

    const onSuccessfulGetData = useCallback(() => {
        if (openDeleteDialog) {
            setOpenDeleteDialog(false)
        }
    }, [openDeleteDialog, setOpenDeleteDialog]);

    const getData = useCallback(async ({ search, page, per_page, sort, dir }) => {
        try {
            //console.log("debouncedFilterState", debouncedFilterState);
            const { data } = await videoHttp.list<ListResponse<Video>>({
                queryParams: {
                    search,
                    page,
                    per_page,
                    sort,
                    dir
                }
            });
            if (subscribed.current) {   // do not change when dismounting
                setData(data.data);
                setTotalRecords(data.meta.total);
                onSuccessfulGetData();
            }
        } catch (error) {
            console.error(error);
            if (videoHttp.isCancelledRequest(error)) {
                return;
            }
            enqueueSnackbar(
                'Não foi possível carregar vídeos',
                { variant: 'error' }
            );
        }
    }, [enqueueSnackbar, onSuccessfulGetData, setTotalRecords]);

    useEffect(() => {
        subscribed.current = true;
        getData({
            search: searchTest,
            page: debouncedFilterState.pagination.page,
            per_page: debouncedFilterState.pagination.per_page,
            sort: debouncedFilterState.order.sort,
            dir: debouncedFilterState.order.dir,
        });
        return () => {
            subscribed.current = false;
        }
    }, [
        getData,
        searchTest,
        debouncedFilterState.pagination.page,
        debouncedFilterState.pagination.per_page,
        debouncedFilterState.order,
    ]);

    function deleteRows(confirmed: boolean) {
        if (!confirmed) {
            setOpenDeleteDialog(false);
            return;
        }
        const ids = rowsToDelete
            .data
            .map(value => data[value.index].id)
            .join(',');
        videoHttp
            .deleteCollection({ ids })
            .then(response => {
                enqueueSnackbar(
                    'Registro(s) excluído(s) com sucesso',
                    { variant: 'success' }
                );
                // avoid 'no content' when all rows from last page are deleted ...
                const remainingRecords = totalRecords - rowsToDelete.data.length;
                const firstIndexOnPage = (filterState.pagination.page - 1) * filterState.pagination.per_page;
                if (
                    firstIndexOnPage === remainingRecords && filterState.pagination.page > 1
                ) {
                    const page = filterState.pagination.page - 2;
                    filterManager.changePage(page);
                } else {  // ... otherwise just reload data
                    getData({
                        search: searchTest,
                        page: debouncedFilterState.pagination.page,
                        per_page: debouncedFilterState.pagination.per_page,
                        sort: debouncedFilterState.order.sort,
                        dir: debouncedFilterState.order.dir,
                    });
                }
            })
            .catch((error) => {
                console.error(error);
                enqueueSnackbar(
                    'Não foi possível excluir os registros',
                    { variant: 'error' }
                )
            })
    }

    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length - 1)}>
            <DeleteDialog open={openDeleteDialog} handleClose={deleteRows} />
            <DefaultTable
                title=""
                columns={columns}
                data={data}
                loading={loading}
                debouncedSearchTime={debounceSearchTime}
                ref={tableRef}
                options={{
                    serverSide: true,
                    responsive: "standard",
                    searchText: filterState.search as any,
                    page: filterState.pagination.page - 1,
                    rowsPerPage: filterState.pagination.per_page,
                    rowsPerPageOptions,
                    count: totalRecords,
                    customToolbar: () => (
                        <FilterResetButton
                            handleClick={() => filterManager.resetFilter()}
                        />
                    ),
                    onSearchChange: (value) => filterManager.changeSearch(value),
                    onChangePage: (page) => filterManager.changePage(page),
                    onChangeRowsPerPage: (perPage) => filterManager.changeRowsPerPage(perPage),
                    onColumnSortChange: (changedColumn: string, direction: string) =>
                        filterManager.changeColumnSort(changedColumn, direction),
                    onRowsDelete: (rowsDeleted) => {
                        //console.log(rowsDeleted);
                        setRowsToDelete(rowsDeleted);
                        return false;
                    }
                }}
            />
        </MuiThemeProvider>
    );
}

export default Table;