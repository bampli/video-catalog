import * as React from 'react';
import { InputAdornment, TextField, TextFieldProps } from '@material-ui/core';
import { RefAttributes, useImperativeHandle, useRef, useState } from 'react';
//import { MutableRefObject, RefAttributes, useImperativeHandle, useRef } from "react";

export interface InputFileProps extends RefAttributes<InputFileComponent>{
    ButtonFile: React.ReactNode;
    InputFileProps?: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    TextFieldProps?: TextFieldProps;
};

export interface InputFileComponent {
    openWindow: () => void
    clear: () => void
};

const InputFile = React.forwardRef<InputFileComponent, InputFileProps>((props, ref) => {
    const fileRef = useRef() as React.MutableRefObject<HTMLInputElement>;
    const [filename, setFilename] = useState("");

    const textFieldProps: TextFieldProps = {
        variant: 'outlined',    // these are the default props
        ...props.TextFieldProps,
        InputProps: {
            ...(
                props.TextFieldProps && props.TextFieldProps.InputProps &&
                { ...props.TextFieldProps.InputProps }
            ),
            readOnly: true,
            endAdornment: (
                <InputAdornment position={'end'}>
                    {props.ButtonFile}
                </InputAdornment>
            )
        },
        value: filename // value cannot be overridden since is the last here
    };

    const inputFileProps = {
        ...props.InputFileProps,
        hidden: true,   // these props cannot be overridden by InputFileProps
        ref: fileRef,
        onChange(event) {   // ... except onChange, see how below.
            const files = event.target.files;
            if (files.length) {
                console.log(files);
                setFilename(
                    Array.from(files).map((file:any) => file.name).join(', ')
                );
            }
            if (props.InputFileProps && props.InputFileProps.onChange) {
                props.InputFileProps.onChange(event)    // the way to override onChange
            }
        }
    }

    useImperativeHandle(ref, () => ({
        openWindow: () => fileRef.current.click(),
        clear: () => setFilename("")
    }));

    return (
        <>
            <input type="file" {...inputFileProps} />
            <TextField {...textFieldProps} />
        </>
    );
});

export default InputFile
