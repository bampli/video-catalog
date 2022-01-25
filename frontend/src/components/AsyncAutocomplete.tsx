import React, { useEffect, useState } from 'react';
import { Autocomplete, AutocompleteProps } from '@material-ui/lab';
import { CircularProgress, TextField } from '@material-ui/core';
import { TextFieldProps } from '@material-ui/core/TextField';
import { useDebounce } from 'use-debounce/lib';

interface AsyncAutocompleteProps<
    T,
    Multiple extends boolean | undefined,
    DisableClearable extends boolean | undefined,
    FreeSolo extends boolean | undefined
    > {
    fetchOptions: (searchText) => Promise<any>;
    debounceTime?: number;
    TextFieldProps?: TextFieldProps;
    AutocompleteProps?: Omit<
        AutocompleteProps<
            T,
            Multiple,
            DisableClearable,
            FreeSolo
        >, 'renderInput'
    >;
}

const AsyncAutocomplete: React.FC<AsyncAutocompleteProps<any, undefined, undefined, boolean>> = (props) => {

    const { AutocompleteProps, debounceTime = 300 } = props;
    const { freeSolo, onOpen, onClose, onInputChange } = AutocompleteProps as any;
    const [open, setOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [debouncedSearchText] = useDebounce(searchText, debounceTime);
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState([]);

    const textFieldProps: TextFieldProps = {
        margin: 'normal',
        variant: 'outlined',
        fullWidth: true,
        InputLabelProps: { shrink: true },
        ...(props.TextFieldProps && { ...props.TextFieldProps })
    };

    const autocompleteProps: AutocompleteProps<any, undefined, undefined, boolean> = {
        loadingText: 'Carregando...',
        noOptionsText: 'Nenhum item encontrado',
        ...(AutocompleteProps && { ...AutocompleteProps }),
        open,
        options,
        loading: loading,
        // inputValue: searchText,
        onOpen() {
            setOpen(true);
            onOpen && onOpen(); // allow override by caller
        },
        onClose() {
            setOpen(false);
            onClose && onClose(); // allow override by caller
        },
        onInputChange(event, value) {
            setSearchText(value);
            onInputChange && onInputChange(); // allow override by caller
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

    useEffect( () => {
        if (!open && !freeSolo) {
            setOptions([])
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    useEffect(() => {
        //console.log("useEffect-1", open, searchText, freeSolo);
        if (!open || (debouncedSearchText === "" && freeSolo)) {
            return;
        }
        let isSubscribed = true;
        (async () => {
            setLoading(true);
            try {
                const data = await props.fetchOptions(debouncedSearchText);
                if (isSubscribed) {
                    //console.log("useEffect-2", data);
                    setOptions(data);
                }
            } finally {
                setLoading(false);
            }
        })();
        return () => {
            isSubscribed = false;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [freeSolo ? debouncedSearchText : open]);

    return (
        <Autocomplete {...autocompleteProps} />
    )
};

export default AsyncAutocomplete;
