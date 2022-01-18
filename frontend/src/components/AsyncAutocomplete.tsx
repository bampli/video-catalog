import React, { useState } from 'react';
import { Autocomplete, AutocompleteProps } from '@material-ui/lab';
import { TextField } from '@material-ui/core';
import { TextFieldProps } from '@material-ui/core';

interface AsyncAutocompleteProps {
    TextFieldProps?: TextFieldProps
}

const AsyncAutocomplete: React.FC<AsyncAutocompleteProps> = (props) => {

    const [open, setOpen] = useState(false);
    const [searchText, setsearchText] = useState("");
    const textFieldProps: TextFieldProps = {
        margin: 'normal',
        variant: 'outlined',
        fullWidth: true,
        InputLabelProps: { shrink: true },
        ...(props.TextFieldProps && { ...props.TextFieldProps })
    };

    const autocompleteProps: AutocompleteProps<any, false, false, false> = {
        open,
        onOpen() {
            setOpen(true);
        },
        onClose() {
            setOpen(false);
        },
        onInputChange(event, value) {
            setsearchText(value)
        },
        renderInput: (params) => (
            <TextField
                {...params}
                {...textFieldProps}
            />
        ),
        options: []
    };

    return (
        <Autocomplete {...autocompleteProps} />
    )
};

export default AsyncAutocomplete;
