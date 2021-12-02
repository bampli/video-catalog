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

const App: React.FC = () => {
  return (
    <React.Fragment>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Navbar />
          <Box paddingTop={'70px'}>
            <Breadcrumbs />
            <AppRouter />
          </Box>
        </BrowserRouter>
      </ThemeProvider>
    </React.Fragment>
  );
}

export default App;
