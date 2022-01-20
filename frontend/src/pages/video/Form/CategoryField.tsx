import * as React from 'react';
import AsyncAutocomplete from "../../../components/AsyncAutocomplete";
import GridSelected from "../../../components/GridSelected";
import GridSelectedItem from "../../../components/GridSelectedItem";
import categoryHttp from '../../../util/http/category-http';
import useHttpHandled from '../../../hooks/useHttpHandled';

interface CategoryFieldProps {
}

const CategoryField: React.FC<CategoryFieldProps> = () => {

    const autocompleteHttp = useHttpHandled();
    const fetchOptions = (searchText) => autocompleteHttp(
        categoryHttp
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
                    label: 'Categorias'
                }}
            />
            <GridSelected>
                <GridSelectedItem onDelete={() => { }}>
                    Categoria 1
                </GridSelectedItem>
            </GridSelected>
        </>
    );
};

export default CategoryField;
