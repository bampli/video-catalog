import * as React from 'react';
import { Chip } from "@material-ui/core";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import theme from '../theme';

const localTheme = createTheme({
    palette: {
        primary: theme.palette.success,
        secondary: theme.palette.error
    }
});

export const BadgeYes = () => {
    return (
        <ThemeProvider theme={localTheme}>
            <Chip label="Sim" color="primary" />
        </ThemeProvider>
    );
};

export const BadgeNo = () => {
    return (
        <ThemeProvider theme={localTheme}>
            <Chip label="Não" color="secondary" />
        </ThemeProvider>
    );
};