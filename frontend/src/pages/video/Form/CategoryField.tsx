import * as React from 'react';
import AsyncAutocomplete from "../../../components/AsyncAutocomplete";
import GridSelected from "../../../components/GridSelected";
import GridSelectedItem from "../../../components/GridSelectedItem";
import categoryHttp from '../../../util/http/category-http';
import useHttpHandled from '../../../hooks/useHttpHandled';
import useCollectionManager from '../../../hooks/useCollectionManager';
import { Typography } from "@material-ui/core";
import { Genre } from "../../../util/models";

interface CategoryFieldProps {
    categories: any[],
    setCategories: (categories) => void,
    genres: Genre[]
}

const CategoryField: React.FC<CategoryFieldProps> = (props) => {

    const { categories, setCategories, genres } = props;
    const autocompleteHttp = useHttpHandled();
    const { addItem, removeItem } = useCollectionManager(categories, setCategories);

    function fetchOptions(searchText) {
        return autocompleteHttp(
            categoryHttp
                .list({
                    queryParams: {
                        genres: genres.map(genre => genre.id).join(','),
                        all: ""
                    }
                })
        ).then(data => data.data).catch(error => console.error(error, searchText));
    }
    //address?genres=id1,id2
    return (
        <>
            <AsyncAutocomplete
                fetchOptions={fetchOptions}
                AutocompleteProps={{
                    freeSolo: false,
                    getOptionLabel: option => option.name,
                    onChange: (event, value) => addItem(value),
                    disabled: !genres.length,
                    options: []
                }}
                TextFieldProps={{
                    label: 'Categorias'
                }}
            />
            <GridSelected>
                {
                    categories.map((category, key) => (
                        <GridSelectedItem key={key} onDelete={() => {
                            console.log('clicked delete')
                        }} xs={12}>
                            <Typography noWrap={true}>
                                {category.name}
                            </Typography>
                        </GridSelectedItem>
                    ))
                }
            </GridSelected>
        </>
    );
};

export default CategoryField;
