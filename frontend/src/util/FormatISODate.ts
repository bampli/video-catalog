import format from "date-fns/format";
import parseISO from "date-fns/parseISO";

const FormatISODate = (value: any) => {
    return format(parseISO(value), 'dd/MM/yyyy')
}

export default FormatISODate;
