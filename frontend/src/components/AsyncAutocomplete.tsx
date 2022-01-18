import React, { useState } from 'react';
import { Autocomplete, AutocompleteProps } from '@material-ui/lab';
import { CircularProgress, TextField } from '@material-ui/core';
import { TextFieldProps } from '@material-ui/core';

interface AsyncAutocompleteProps {
    TextFieldProps?: TextFieldProps
}

const AsyncAutocomplete: React.FC<AsyncAutocompleteProps> = (props) => {

    const [open, setOpen] = useState(false);
    const [searchText, setsearchText] = useState("");
    const [loading, setloading] = useState(false);
    const [options, setoptions] = useState([]);

    const textFieldProps: TextFieldProps = {
        margin: 'normal',
        variant: 'outlined',
        fullWidth: true,
        InputLabelProps: { shrink: true },
        ...(props.TextFieldProps && { ...props.TextFieldProps })
    };

    const autocompleteProps: AutocompleteProps<any, false, false, false> = {
        open,
        options,
        loading: loading,
        loadingText: 'Carregando...',
        noOptionsText: 'Nenhum item encontrado',
        onOpen() {
            setOpen(true);
        },
        onClose() {
            setOpen(false);
        },
        onInputChange(event, value) {
            setsearchText(value)
        },
        renderInput: (params) => {
            return (
                <TextField
                    {...params}
                    {...textFieldProps}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {loading && <CircularProgress color={'inherit'} size={20} />}
                                {params.InputProps.endAdornment}
                            </>
                        )
                    }}
                />
            )
        },
    };

    return (
        <Autocomplete {...autocompleteProps} />
    )
};

export default AsyncAutocomplete;
