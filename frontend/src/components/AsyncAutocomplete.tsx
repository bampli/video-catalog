import * as React from 'react';
import { Autocomplete, AutocompleteProps } from '@material-ui/lab';
import { TextField } from '@material-ui/core';
import { TextFieldProps } from '@material-ui/core';

interface AsyncAutocompleteProps {
    TextFieldProps?: TextFieldProps
}

const AsyncAutocomplete: React.FC<AsyncAutocompleteProps> = (props) => {

    const textFieldProps: TextFieldProps = {
        margin: 'normal',
        variant: 'outlined',
        fullWidth: true,
        InputLabelProps: { shrink: true }
    };

    const autocompleteProps: AutocompleteProps = {
        renderInput: (params) => (
            <TextField
                {...params}
                {...textFieldProps}
            />
        )
    };

    return (
        <Autocomplete />
    )
};

export default AsyncAutocomplete;
