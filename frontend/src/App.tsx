import { Box, CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import React from 'react';
//import logo from './logo.svg';
//import './App.css';
import { Navbar } from './components/Navbar';
import { BrowserRouter } from "react-router-dom";
import { AppRouter } from './routes/AppRouter';
import Breadcrumbs from './components/Breadcrumbs';
import theme from './theme';
import { SnackbarProvider } from './components/SnackbarProvider';
import {LoadingProvider} from "./components/loading/LoadingProvider";
import Spinner from './components/Spinner';

const App: React.FC = () => {
  return (
    <React.Fragment>
      <LoadingProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider>
            <BrowserRouter>
              <Spinner />
              <Navbar />
              <Box paddingTop={'70px'}>
                <Breadcrumbs />
                <AppRouter />
              </Box>
            </BrowserRouter>
          </SnackbarProvider>
        </ThemeProvider>
      </LoadingProvider>
    </React.Fragment>
  );
}

export default App;
