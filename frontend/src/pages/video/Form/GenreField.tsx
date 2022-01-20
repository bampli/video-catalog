import * as React from 'react';
import AsyncAutocomplete from "../../../components/AsyncAutocomplete";
import GridSelected from "../../../components/GridSelected";
import GridSelectedItem from "../../../components/GridSelectedItem";
import genreHttp from '../../../util/http/genre-http';
import useHttpHandled from '../../../hooks/useHttpHandled';

interface GenreFieldProps {
}

const GenreField: React.FC<GenreFieldProps> = () => {

    const autocompleteHttp = useHttpHandled();
    const fetchOptions = (searchText) => autocompleteHttp(
        genreHttp
            .list({
                queryParams: {
                    search: searchText, all: ""
                }
            })
    ).then(data => data.data).catch(error => console.error(error, searchText));

    return (
        <>
            <AsyncAutocomplete
                fetchOptions={fetchOptions}
                AutocompleteProps={{
                    freeSolo: true,
                    getOptionLabel: option => option.name,
                    options: []
                }}
                TextFieldProps={{
                    label: 'Gêneros'
                }}
            />
            <GridSelected>
                <GridSelectedItem onDelete={() => { }}>
                    Gênero 1
                </GridSelectedItem>
            </GridSelected>
        </>
    );
};

export default GenreField;
