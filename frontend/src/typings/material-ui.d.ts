import { ComponentNameToClassKey } from "@material-ui/core/styles/overrides";
import {
  Palette,
  PaletteColor,
  PaletteColorOptions,
  PaletteOptions,
} from "@material-ui/core/styles/createPalette";

declare module "@material-ui/core/styles/overrides" {
  //import { ComponentNameToClassKey } from "@material-ui/core/styles/overrides";

  interface ComponentNameToClassKey {
    MUIDataTable: any;
    MUIDataTableToolbar: any;
    MUIDataTableHeadCell: any;
    MuiTableSortLabel: any;
    MUIDataTableSelectCell: any;
    MUIDataTableBodyCell: any;
    MUIDataTableToolbarSelect: any;
    MUIDataTableBodyRow: any;
    MUIDataTablePagination: any;
  }
}

declare module "@material-ui/core/styles/createPalette" {
  import {
    Palette,
    PaletteColor,
    PaletteColorOptions,
    PaletteOptions,
  } from "@material-ui/core/styles";

  interface Palette {
    success: PaletteColor;
  }

  interface PaletteOptions {
    success?: PaletteColorOptions;
  }
}
