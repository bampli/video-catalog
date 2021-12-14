import * as React from 'react';
import { SnackbarProvider as NotistackProvider, SnackbarProviderProps } from 'notistack';
import { IconButton, makeStyles, Theme } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import App from '../App';

const useStyles = makeStyles((theme: Theme) => {
    return {
        variantSuccess: {
            backgroundColor: theme.palette.success.main
        },
        variantError: {
            backgroundColor: theme.palette.error.main
        },
        variantInfo: {
            backgroundColor: theme.palette.primary.main
        },
    }
});

export const SnackbarProvider: React.FC<SnackbarProviderProps> = (props) => {

    let snackbarProviderRef; //: WithSnackbarProps; //ProviderContext;

    const classes = useStyles();

    const defaultProps: SnackbarProviderProps = {
        children: App,
        classes,
        autoHideDuration: 3000,
        maxSnack: 3,
        anchorOrigin: {
            horizontal: 'right',
            vertical: 'top'
        },
        preventDuplicate: true,
        ref: (el) => snackbarProviderRef = el,
        action: (key) => (
            <IconButton
                color={"inherit"}
                style={{ fontSize: 20 }}
                onClick={() => snackbarProviderRef.closeSnackbar(key)}
            >
                <CloseIcon />
            </IconButton>
        )
    };

    const newProps = { ...defaultProps, ...props };

    return (
        <NotistackProvider {...newProps}>
            {props.children}
        </NotistackProvider>
    );
}
