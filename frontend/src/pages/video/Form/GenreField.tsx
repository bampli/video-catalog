import * as React from 'react';
import AsyncAutocomplete from "../../../components/AsyncAutocomplete";
import GridSelected from "../../../components/GridSelected";
import GridSelectedItem from "../../../components/GridSelectedItem";
import genreHttp from '../../../util/http/genre-http';
import useHttpHandled from '../../../hooks/useHttpHandled';
import { Typography } from "@material-ui/core";
import useCollectionManager from '../../../hooks/useCollectionManager';

interface GenreFieldProps {
    genres: any[],
    setGenres: (genres) => void
}

const GenreField: React.FC<GenreFieldProps> = (props) => {

    const { genres, setGenres } = props;
    const autocompleteHttp = useHttpHandled();
    const { addItem, removeItem } = useCollectionManager(genres, setGenres);

    function fetchOptions(searchText) {
        return autocompleteHttp(
            genreHttp
                .list({
                    queryParams: {
                        search: searchText,
                        all: ""
                    }
                })
        ).then(data => data.data).catch(error => console.error(error, searchText));
    }

    return (
        <>
            <AsyncAutocomplete
                fetchOptions={fetchOptions}
                AutocompleteProps={{
                    freeSolo: true,
                    getOptionLabel: option => option.name,
                    onChange: (event, value) => addItem(value),
                    options: []
                }}
                TextFieldProps={{
                    label: 'Gêneros'
                }}
            />
            <GridSelected>
                {
                    genres.map((genre, key) => (
                        <GridSelectedItem key={key} onDelete={() => {
                            console.log('clicked delete')
                        }} xs={12}>
                            <Typography noWrap={true}>
                                {genre.name}
                            </Typography>
                        </GridSelectedItem>
                    ))
                }
            </GridSelected>
        </>
    );
};

export default GenreField;
