import * as React from 'react';
import AsyncAutocomplete, { AsyncAutocompleteComponent } from "../../../components/AsyncAutocomplete";
import GridSelected from "../../../components/GridSelected";
import GridSelectedItem from "../../../components/GridSelectedItem";
import genreHttp from '../../../util/http/genre-http';
import useHttpHandled from '../../../hooks/useHttpHandled';
import { FormControl, FormControlProps, FormHelperText, Typography, useTheme } from "@material-ui/core";
import { useCallback, useImperativeHandle, useRef } from "react";

import useCollectionManager from '../../../hooks/useCollectionManager';
import { getGenresFromCategory } from '../../../util/model-filters';

interface GenreFieldProps {
    genres: any[],
    setGenres: (genres) => void,
    categories: any[],
    setCategories: (categories) => void,
    error: any,
    disabled: boolean;
    FormControlProps?: FormControlProps
}

export interface GenreFieldComponent {
    clear: () => void
}

const GenreField = React.forwardRef<GenreFieldComponent, GenreFieldProps> ((props, ref) => {

    const {
        genres,
        setGenres,
        categories,
        setCategories,
        error,
        disabled
    } = props;
    const autocompleteHttp = useHttpHandled();
    const { addItem, removeItem } = useCollectionManager(genres, setGenres);
    const { removeItem: removeCategory } = useCollectionManager(categories, setCategories);
    const autocompleteRef = useRef() as React.MutableRefObject<AsyncAutocompleteComponent>;
    const theme = useTheme();

    const fetchOptions = useCallback((searchText) => {
        return autocompleteHttp(
            genreHttp
                .list({
                    queryParams: {
                        search: searchText,
                        all: ""
                    }
                })
        ).then(data => data.data);  //.catch(error => console.error(error, searchText));
    }, [autocompleteHttp]);

    useImperativeHandle(ref, () => ({
        clear: () => autocompleteRef.current.clear()
    }));

    // console.log("GenreField genres=", genres);
    // console.log(" error=", error);

    return (
        <>
            <AsyncAutocomplete
                ref={autocompleteRef}
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
                    label: 'G??neros',
                    error: error !== undefined
                }}
            />
            <FormHelperText style={{height: theme.spacing(2)}}>
                Escolha os g??nero(s) do v??deo
            </FormHelperText>
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
                            <GridSelectedItem
                                key={key}
                                onDelete={() => {
                                    const categoriesWithOneGenre = categories
                                        .filter(category => {
                                            const genresFromCategory = getGenresFromCategory(genres, category);
                                            return genresFromCategory.length === 1 && genres[0].id === genre.id
                                        });
                                    categoriesWithOneGenre.forEach(cat =>removeCategory(cat));
                                    removeItem(genre);
                            }} xs={12}
                            >
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
});

export default GenreField;
