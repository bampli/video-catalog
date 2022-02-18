import * as React from 'react';
import AsyncAutocomplete, { AsyncAutocompleteComponent } from "../../../components/AsyncAutocomplete";
import GridSelected from "../../../components/GridSelected";
import GridSelectedItem from "../../../components/GridSelectedItem";
import castMemberHttp from '../../../util/http/cast-member-http';
import useHttpHandled from '../../../hooks/useHttpHandled';
import useCollectionManager from '../../../hooks/useCollectionManager';
import { FormControl, FormControlProps, FormHelperText, Typography } from "@material-ui/core";
import { useCallback, useImperativeHandle, useRef } from "react";
//import { CastMember } from "../../../util/models";

interface CastMemberFieldProps {
    castMembers: any[],
    setCastMembers: (castMembers) => void,
    error: any,
    disabled: boolean;
    FormControlProps?: FormControlProps
}

export interface CastMemberFieldComponent {
    clear: () => void
}

const CastMemberField = React.forwardRef<CastMemberFieldComponent, CastMemberFieldProps>((props, ref) => {

    const {
        castMembers,
        setCastMembers,
        error,
        disabled
    } = props;
    const autocompleteHttp = useHttpHandled();
    const { addItem, removeItem } = useCollectionManager(castMembers, setCastMembers);
    const autocompleteRef = useRef() as React.MutableRefObject<AsyncAutocompleteComponent>;

    const fetchOptions = useCallback((searchText) => {
        return autocompleteHttp(
            castMemberHttp
                .list({
                    queryParams: {
                        search: searchText,
                        all: ""
                    }
                })
        ).then(data => data.data);
    }, [autocompleteHttp]);

    useImperativeHandle(ref, () => ({
        clear: () => autocompleteRef.current.clear()
    }));

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
                    label: 'Elenco',
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
                        castMembers.map((castMember, key) => (
                            <GridSelectedItem
                                key={key}
                                onDelete={() => removeItem(castMember)} xs={6}
                            >
                                <Typography noWrap={true}>
                                    {castMember.name}
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

export default CastMemberField;
