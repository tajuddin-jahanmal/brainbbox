import * as yup from "yup";

export function isValid (Schema = {}, Data ={})
{
    try {
        let result = yup.object().shape(Schema);
        result.validateSync(Data);
        return {result};
    } catch ({message}) {
        return {error: message}
    }
}

export default () => {};