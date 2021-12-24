import React, { useEffect, useState } from "react";
import Grow from "@material-ui/core/Grow";
import TextField from "@material-ui/core/TextField";
import SearchIcon from "@material-ui/icons/Search";
import IconButton from "@material-ui/core/IconButton";
import ClearIcon from "@material-ui/icons/Clear";
import { makeStyles } from "@material-ui/core/styles";
import {debounce} from 'lodash';

const useStyles = makeStyles(
  (theme) => ({
    main: {
      display: "flex",
      flex: "1 0 auto",
    },
    searchIcon: {
      color: theme.palette.text.secondary,
      marginTop: "10px",
      marginRight: "8px",
    },
    searchText: {
      flex: "0.8 0",
    },
    clearIcon: {
      "&:hover": {
        color: theme.palette.error.main,
      },
    },
  }),
  { name: "MUIDataTableSearch" }
);

const TableSearch = ({ options, searchText, onSearch, onHide }) => {
  const classes = useStyles();

  const [state, setState] = useState<{text: string}>({text: searchText});

  useEffect(() => {
    if (searchText && searchText.value !== undefined) {
      setState(searchText.value);
    }
  }, [searchText]);

  const handleTextChange = (event) => {
    const value = event.target.value;
    setState({text: value});
    onSearch(value);
  };

  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      onHide();
    }
  };

  const clearIconVisibility = options.searchAlwaysOpen ? "hidden" : "visible";

  return (
    <Grow appear in={true} timeout={300}>
      <div className={classes.main}>
        <SearchIcon className={classes.searchIcon} />
        <TextField
          className={classes.searchText}
          autoFocus={true}
          InputProps={{
            "data-test-id": options.textLabels.toolbar.search,
          }}
          inputProps={{
            "aria-label": options.textLabels.toolbar.search,
          }}
          value={state.text || ""}
          onKeyDown={onKeyDown}
          onChange={handleTextChange}
          fullWidth={true}
          placeholder={options.searchPlaceholder}
          {...(options.searchProps ? options.searchProps : {})}
        />
        <IconButton
          className={classes.clearIcon}
          style={{ visibility: clearIconVisibility }}
          onClick={onHide}
        >
          <ClearIcon />
        </IconButton>
      </div>
    </Grow>
  );
};

export default TableSearch;
