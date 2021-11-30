//import { colors, createMuiTheme } from "@material-ui/core";
//import red from "@material-ui/core/colors/red";
//import { colors } from "@material-ui/core";
import { createTheme, SimplePaletteColorOptions } from "@material-ui/core/styles";
import {PaletteOptions} from "@material-ui/core/styles/createPalette";

const palette: PaletteOptions = {
    primary: {
        main: '#79aec8',
        contrastText: '#fff',
      },
      secondary: {
        main: '#4db5ab',
        contrastText: '#fff',
      },
      background: {
          default: '#fafafa'
      }
}
const theme = createTheme({
  palette,
  overrides: {
      MUIDataTable: {
        paper: {
            boxShadow: "none",
        }
      },
      MUIDataTableToolbar: {
          root: {
              minHeight: '50px',
              backGroundColor: palette!.background!.default
          },
          icon: {
              color: (palette!.primary as SimplePaletteColorOptions).main,
              '&:hover, &:active, &:focus': {
                  color: '#055a52'
              }
          },
          iconActive: {
            color: '#055a52',
            '&:hover, &:active, &:focus': {
                color: '#055a52'
            }
        }
      },
      MUIDataTableHeadCell: {
        fixedHeader: {
            paddingTop: 8,
            paddingBottom: 8,
            backgroundColor: (palette!.primary as SimplePaletteColorOptions).main,
            color: '#ffffff',
            '&[aria-sort]': {
                backgroundColor: "#459ac4"
            },
            sortActive: {
                color: '#fff'
            },
            sortAction: {
                alignItems: 'center'
            },
            sortLabelRoot: {
                '& svg': {
                    color: '#fff !important'
                }
                // color: '#fff !important'
            },
            MUIDataTableSelectCell: {
                headerCell: {
                    backgroundColor: (palette!.primary as SimplePaletteColorOptions).main,
                    '& span': {
                        color: '#fff !important'
                    }
                }
            }
        },
      }
    // MuiFormLabel: {
    //   root: {
    //     fontSize: '1.2rem',
    //     fontWeight: 500,
    //   },
    // },
    // MuiInputBase: {
    //     input: {

    //     }
    // }
  },
});

export default theme;