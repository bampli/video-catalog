import React, { useEffect, useState } from 'react';
import { Autocomplete, AutocompleteProps } from '@material-ui/lab';
import { CircularProgress, TextField } from '@material-ui/core';
import { TextFieldProps } from '@material-ui/core';
import { useSnackbar } from "notistack";

interface AsyncAutocompleteProps {
    fetchOptions: (searchText) => Promise<any>
    TextFieldProps?: TextFieldProps
}

const AsyncAutocomplete: React.FC<AsyncAutocompleteProps> = (props) => {

    const [open, setOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState([]);
    const snackBar = useSnackbar();

    const textFieldProps: TextFieldProps = {
        margin: 'normal',
        variant: 'outlined',
        fullWidth: true,
        InputLabelProps: { shrink: true },
        ...(props.TextFieldProps && { ...props.TextFieldProps })
    };

    const autocompleteProps: AutocompleteProps<any, false, false, true> = {
        open,
        options,
        loading: loading,
        inputValue: searchText,
        loadingText: 'Carregando...',
        noOptionsText: 'Nenhum item encontrado',
        onOpen() {
            setOpen(true);
        },
        onClose() {
            setOpen(false);
        },
        onInputChange(event, value) {
            setSearchText(value)
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

    useEffect(() => {
        let isSubscribed = true;
        (async () => {
            setLoading(true);
            try {
                const { data } = await props.fetchOptions(searchText);
                if (isSubscribed) {
                    console.log("useEffect", data);
                    setOptions(data);
                    // setOptions(data.data);                    
                }
            } catch (error) {
                console.error(error);
                snackBar.enqueueSnackbar(
                    'Não foi possível carregar as informações',
                    { variant: 'error' }
                );
            } finally {
                setLoading(false);
            }
        })();
        return () => {
            isSubscribed = false;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchText]);

    return (
        <Autocomplete {...autocompleteProps} />
    )
};

export default AsyncAutocomplete;
