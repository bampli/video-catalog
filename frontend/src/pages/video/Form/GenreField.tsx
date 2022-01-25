import * as React from 'react';
import AsyncAutocomplete from "../../../components/AsyncAutocomplete";
import GridSelected from "../../../components/GridSelected";
import GridSelectedItem from "../../../components/GridSelectedItem";
import genreHttp from '../../../util/http/genre-http';
import useHttpHandled from '../../../hooks/useHttpHandled';
import { FormControl, FormControlProps, FormHelperText, Typography } from "@material-ui/core";

import useCollectionManager from '../../../hooks/useCollectionManager';

interface GenreFieldProps {
    genres: any[],
    setGenres: (genres) => void,
    error: any,
    disabled: boolean;
    FormControlProps?: FormControlProps
}

const GenreField: React.FC<GenreFieldProps> = (props) => {

    const { genres, setGenres, error, disabled } = props;
    const autocompleteHttp = useHttpHandled();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        ).then(data => data.data);  //.catch(error => console.error(error, searchText));
    }

    // console.log("GenreField genres=", genres);
    // console.log(" error=", error);

    return (
        <>
            <AsyncAutocomplete
                fetchOptions={fetchOptions}
                AutocompleteProps={{
                    //autoSelect: true, // choose autoSelect OR getOptionSelected
                    clearOnEscape: true,
                    freeSolo: true,
                    getOptionLabel: option => option.name,
                    getOptionSelected: (option, value) => option.id === value.id,
                    onChange: (event, value) => addItem(value),
                    disabled,
                    options: []
                }}
                TextFieldProps={{
                    label: 'Gêneros',
                    error: error !== undefined
                }}
            />
            <FormControl
                margin={'normal'}
                fullWidth
                error={error !== undefined}
                disabled={disabled === true}
                {...props.FormControlProps}
            >
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
                {
                    error && <FormHelperText>{error.message}</FormHelperText>
                }
            </FormControl>
        </>
    );
};

export default GenreField;
