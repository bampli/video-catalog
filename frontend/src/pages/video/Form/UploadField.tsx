import React, { useRef } from 'react';
import { Button, FormControl, FormControlProps } from '@material-ui/core';
import InputFile, { InputFileComponent } from '../../../components/InputFile';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

interface UploadFieldProps {
    accept: string;
    label: string;
    setValue: (value) => void
    error?: any;
    disabled?: boolean;
    FormControlProps?: FormControlProps
}

const UploadField: React.FC<UploadFieldProps> = (props) => {
    const fileRef = useRef() as React.MutableRefObject<InputFileComponent>;
    const {
        accept,
        label,
        setValue,
        error,
        disabled
    } = props;
    return (
        <FormControl
            error={error !== undefined}
            disabled={disabled === true}
            fullWidth
            margin={'normal'}
            {...props.FormControlProps}
        >
            <InputFile
                ref={fileRef}
                TextFieldProps={{
                    label: label,
                    InputLabelProps: { shrink: true },
                    style: { backgroundColor: '#ffffff' }
                }}
                InputFileProps={{
                    accept,
                    onChange(event) {
                        const files = event.target.files as any;
                        files.length && setValue(files[0])
                    }
                }}
                ButtonFile={
                    <Button
                        endIcon={<CloudUploadIcon />}
                        variant={'contained'}
                        color={'primary'}
                        onClick={() => fileRef.current.openWindow()}
                    >
                        Adicionar
                    </Button>
                }
            />
        </FormControl>
    );
};

export default UploadField;