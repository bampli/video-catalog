import * as React from 'react';
import AsyncAutocomplete, { AsyncAutocompleteComponent } from "../../../components/AsyncAutocomplete";
import GridSelected from "../../../components/GridSelected";
import GridSelectedItem from "../../../components/GridSelectedItem";
import categoryHttp from '../../../util/http/category-http';
import useHttpHandled from '../../../hooks/useHttpHandled';
import useCollectionManager from '../../../hooks/useCollectionManager';
import { FormControl, FormControlProps, FormHelperText, makeStyles, Theme, Typography, useTheme } from "@material-ui/core";
import { Genre } from "../../../util/models";
import { getGenresFromCategory } from '../../../util/model-filters';
import { grey } from "@material-ui/core/colors"
import { useCallback, useImperativeHandle, useRef } from "react";

const useStyles = makeStyles((theme: Theme) => ({
    genresSubtitle: {
        color: grey["800"],
        fontSize: '0.8rem'
    }
}));

interface CategoryFieldProps {
    categories: any[],
    setCategories: (categories) => void,
    genres: Genre[],
    error: any,
    disabled: boolean;
    FormControlProps?: FormControlProps
}

export interface CategoryFieldComponent {
    clear: () => void
}

const CategoryField = React.forwardRef<CategoryFieldComponent, CategoryFieldProps> ((props, ref) => {

    const {
        categories,
        setCategories,
        genres,
        error,
        disabled
    } = props;
    const classes = useStyles();
    const autocompleteHttp = useHttpHandled();
    const { addItem, removeItem } = useCollectionManager(categories, setCategories);
    const autocompleteRef = useRef() as React.MutableRefObject<AsyncAutocompleteComponent>;
    const theme = useTheme();

    const fetchOptions = useCallback((searchText) => {
        return autocompleteHttp(
            categoryHttp
                .list({
                    queryParams: {
                        genres: genres.map(genre => genre.id).join(','),
                        all: ""
                    }
                })
        ).then(data => data.data);    //.catch(error => console.error(error, searchText));
    }, [autocompleteHttp, genres]);
    //address?genres=id1,id2

    useImperativeHandle(ref, () => ({
        clear: () => autocompleteRef.current.clear()
    }));

    // console.log("CategoryField categories=", categories);
    // console.log(" genres=", genres);
    // console.log(" error=", error);
    
    return (
        <>
            <AsyncAutocomplete
                ref={autocompleteRef}
                fetchOptions={fetchOptions}
                AutocompleteProps={{
                    //autoSelect: true, // choose autoSelect OR getOptionSelected
                    clearOnEscape: true,
                    freeSolo: false,
                    getOptionLabel: option => option.name,
                    getOptionSelected: (option, value) => option.id === value.id,
                    onChange: (event, value) => addItem(value),
                    disabled: disabled === true || !genres.length,
                    options: []
                }}
                TextFieldProps={{
                    label: 'Categorias',
                    error: error !== undefined
                }}
            />
            <FormHelperText style={{height: theme.spacing(2)}}>
                Escolha pelo menos uma categoria
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
                        categories.map((category, key) => {
                            const genresFromCategory = getGenresFromCategory(genres, category)
                                .map(genre => genre.name)
                                .join(',');
                            return (
                                <GridSelectedItem
                                    key={key}
                                    onDelete={() => removeItem(category)} xs={12}
                                >
                                    <Typography noWrap={true}>
                                        {category.name}
                                    </Typography>
                                    <Typography noWrap={true} className={classes.genresSubtitle}>
                                        Gêneros: {genresFromCategory}
                                    </Typography>
                                </GridSelectedItem>
                            )
                        })
                    }
                </GridSelected>
                {
                    error && <FormHelperText>{error.message}</FormHelperText>
                }
            </FormControl>
        </>
    );
});

export default CategoryField;
