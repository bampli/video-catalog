import * as React from 'react';
import { Box, Button, Checkbox, makeStyles, TextField, Theme } from "@material-ui/core";
import { ButtonProps } from "@material-ui/core/Button"

const useStyles = makeStyles((theme: Theme) => {
    return {
        submit: {
            margin: theme.spacing(1)
        }
    }
});

export const Form = () => {

    const classes = useStyles();

    const buttonProps: ButtonProps = {
        className: classes.submit,
        variant: "outlined",
        //size: "medium"
    };

    return (
        <form>
            <TextField
                name="name"
                label="Nome"
                fullWidth
                variant={"outlined"}
            />
            <TextField
                name="description"
                label="Descrição"
                multiline
                rows="4"
                fullWidth
                variant={"outlined"}
                margin={"normal"}
            />
            <Checkbox
                name="is_active"
            />
            Ativo?
            <Box dir={"rtl"}>
                <Button {...buttonProps}>Salvar</Button>
                <Button {...buttonProps} type="submit">Salvar e continuar editando</Button>
            </Box>
        </form>
    );
}
