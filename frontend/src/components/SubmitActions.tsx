import * as React from 'react';
import { Box, Button, makeStyles, Theme } from "@material-ui/core";
import { ButtonProps } from "@material-ui/core/Button"

interface SubmitActionsProps {
    disabledButtons?: boolean;
    handleSave: () => void
}

const useStyles = makeStyles((theme: Theme) => {
    return {
        submit: {
            margin: theme.spacing(1)
        }
    }
});

const SubmitActions: React.FC<SubmitActionsProps> = (props) => {

    const classes = useStyles();

    const buttonProps: ButtonProps = {
        className: classes.submit,
        color: 'secondary',
        variant: 'contained',
        disabled: props.disabledButtons === undefined ? false : props.disabledButtons
    };

    return (
        <Box dir={"ltf"}>
            <Button color={"primary"} {...buttonProps} onClick={props.handleSave}>
                Salvar
            </Button> 
            <Button color={"primary"} {...buttonProps} type="submit">Salvar e continuar editando</Button>
        </Box>
    );
}

export default SubmitActions;
