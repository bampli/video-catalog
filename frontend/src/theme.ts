import { green, red } from "@material-ui/core/colors";
import { createTheme } from "@material-ui/core/styles";
import { PaletteOptions, SimplePaletteColorOptions } from "@material-ui/core/styles/createPalette";

const palette: PaletteOptions = {
  primary: {
    main: "#79aec8",
    contrastText: "#fff",
  },
  secondary: {
    main: "#4db5ab",
    contrastText: "#fff",
    dark: "#055a52"
  },
  background: {
    default: "#fafafa",
  },
  success: {
    main: green[500],
    contrastText: "#fff",
  },
  error: {
    main: red[500],
  },
};

const theme = createTheme({
  palette,
  overrides: {
    MUIDataTable: {
      paper: {
        boxShadow: "none",
      },
    },
    MUIDataTableToolbar: {
      root: {
        minHeight: "50px",
        backGroundColor: palette!.background!.default,
      },
      icon: {
        color: (palette!.primary as SimplePaletteColorOptions).main,
        "&:hover, &:active, &:focus": {
          color: (palette!.secondary as SimplePaletteColorOptions).dark,
          //color: "#055a52",
        },
      },
      iconActive: {
        color: "#055a52",
        "&:hover, &:active, &:focus": {
          color: (palette!.secondary as SimplePaletteColorOptions).dark,
          //color: "#055a52",
        },
      },
    },
    MUIDataTableHeadCell: {
      fixedHeader: {
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: (palette.primary as SimplePaletteColorOptions).main,
        color: "#ffffff",
        "&[aria-sort]": {
          backgroundColor: "#459ac4",
        },
      },
      sortActive: {
        color: "#fff",
      },
      sortAction: {
        alignItems: "center",
      },
      sortLabelRoot: {
        "& svg": {
          color: "#fff !important",
        },
      },
    },
    MUIDataTableSelectCell: {
      headerCell: {
        backgroundColor: (palette.primary as SimplePaletteColorOptions).main,
        "& span": {
          color: "#fff !important",
        },
      },
    },
    MUIDataTableBodyCell: {
      root: {
        color: (palette.secondary as SimplePaletteColorOptions).main,
        "&:hover, &:active, &:focus": {
          color: (palette.secondary as SimplePaletteColorOptions).main,
        },
      },
    },
    MUIDataTableToolbarSelect: {
      title: {
        color: (palette.primary as SimplePaletteColorOptions).main,
      },
      iconButton: {
        color: (palette.primary as SimplePaletteColorOptions).main,
      },
    },
    MUIDataTableBodyRow: {
      root: {
        "&:nth-child(odd)": {
          backgroundColor: palette!.background!.default,
        },
      },
    },
    MUIDataTablePagination: {
      root: {
        color: (palette.primary as SimplePaletteColorOptions).main,
      },
    },
    MUIDataTableFilterList: {
      root: {
        marginBottom: '8px',
      },
    },
    MuiFormControl: {
      root: {
        minWidth: '120px',
      }
    },
    MuiFormLabel: {
      root: {
        fontSize: '1.2rem',
        fontWeight: 500,
      },
    },
    MuiInputBase: {
        input: {

        }
    }
  },
});

export default theme;
