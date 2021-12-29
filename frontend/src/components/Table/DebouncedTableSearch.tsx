import React, { useEffect, useRef, useState } from "react";
import Grow from '@material-ui/core/Grow';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton';
import ClearIcon from '@material-ui/icons/Clear';
import { makeStyles } from '@material-ui/core/styles';
import { debounce } from 'lodash';

// Component based on release 3.8.2
// MUI-Datatables built on Material-UI
// https://raw.githubusercontent.com/gregnb/mui-datatables/3.8.2/src/components/TableSearch.js

const useStyles = makeStyles(
  theme => ({
    main: {
      display: 'flex',
      flex: '1 0 auto',
    },
    searchIcon: {
      color: theme.palette.text.secondary,
      marginTop: '10px',
      marginRight: '8px',
    },
    searchText: {
      flex: '0.8 0',
    },
    clearIcon: {
      '&:hover': {
        color: theme.palette.error.main,
      },
    },
  }),
  { name: 'MUIDataTableSearch' },
);

const DebouncedTableSearch = ({ options, searchText, onSearch, onHide, debounceTime }) => {
  const classes = useStyles();

  const [state, setState] = useState<{ text: string }>(
    { text: searchText }
  );
  const dispatchOnSearch = useRef(
    debounce(async (value) => onSearch(value), 400)
  ).current;

  useEffect(() => {
    return () => {
      dispatchOnSearch.cancel();
    }
  }, [dispatchOnSearch]);

  const handleTextChange = event => {
    value = event.target.value;
    setState({
      text: value
    });
    //console.log(value, state);
    dispatchOnSearch(value);
  };

  const onKeyDown = event => {
    if (event.key === 'Escape') {
      onHide();
    }
  };

  const clearIconVisibility = options.searchAlwaysOpen ? 'hidden' : 'visible';

  let value = state.text;
  if (searchText && searchText.value !== undefined) {
    value = searchText.value;
  };

  return (
    <Grow appear in={true} timeout={300}>
      <div className={classes.main}>
        <SearchIcon className={classes.searchIcon} />
        <TextField
          className={classes.searchText}
          autoFocus={true}
          InputProps={{
            'data-test-id': options.textLabels.toolbar.search,
          }}
          inputProps={{
            'aria-label': options.textLabels.toolbar.search,
          }}
          value={value || ''}
          onKeyDown={onKeyDown}
          onChange={handleTextChange}
          fullWidth={true}
          placeholder={options.searchPlaceholder}
          {...(options.searchProps ? options.searchProps : {})}
        />
        <IconButton className={classes.clearIcon} style={{ visibility: clearIconVisibility }} onClick={onHide}>
          <ClearIcon />
        </IconButton>
      </div>
    </Grow>
  );
};

export default DebouncedTableSearch;
