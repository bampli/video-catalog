import * as React from 'react';
import { Box, Button, Checkbox, makeStyles, TextField, Theme } from "@material-ui/core";
import { ButtonProps } from "@material-ui/core/Button"
import { useForm } from "react-hook-form";

const useStyles = makeStyles((theme: Theme) => {
    return {
        submit: {
            margin: theme.spacing(1)
        }
    }
});

const Form = () => {

    const classes = useStyles();

    const buttonProps: ButtonProps = {
        className: classes.submit,
        variant: "outlined",
        //size: "medium"    // this is the default
    };

    const { register, getValues } = useForm();

    return (
        <form>
            <TextField
                name="name"
                label="Nome"
                fullWidth
                variant={"outlined"}
                inputRef={register}
            />
            <TextField
                name="description"
                label="Descrição"
                multiline
                rows="4"
                fullWidth
                variant={"outlined"}
                margin={"normal"}
                inputRef={register}
            />
            <Checkbox
                name="is_active"
                inputRef={register} //('is_active').ref} version 7?
            />
            Ativo?
            <Box dir={"rtl"}>
                <Button {...buttonProps} onClick={() => console.log(getValues())}>Salvar</Button>
                <Button {...buttonProps} type="submit">Salvar e continuar editando</Button>
            </Box>
        </form>
    );
}

export default Form;