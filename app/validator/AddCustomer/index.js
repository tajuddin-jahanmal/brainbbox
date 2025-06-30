import * as yup from "yup";
import { isValid } from "../../utils/isValid";

const Validation = (fields) =>
{
    const { error } = isValid(
        {
            // phone: yup.string().required("Phone is required fields.").min(10, "Phone must be 10 numbers.").max(10, "Phone must be 10 numbers.").trim(),
            // email: yup.string().required("Email is required fields."),
            phone: yup.string().required("Phone is required fields.").min(6, "Phone must be between 6 and 12 numbers.").max(12, "Phone must be between 6 and 12 numbers.").trim(),
            countryCode: yup.string().required("Country Code is required fields.").trim(),
            firstName: yup.string().required("First Name is required fields.").trim(),
        },
        {
            firstName: fields.firstName,
            countryCode: fields.countryCode,
            phone: fields.phone,
            // email: fields.email,
        }
    )

    return error;
};

export default Validation;