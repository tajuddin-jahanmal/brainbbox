import { isValid } from "../../utils/isValid";
import * as yup from "yup";

const Validation = (fields) =>
{
    const { error } = isValid(
        {
            profit: yup.string().optional().trim(),
            amount: yup.string().required("Amount is required fields.").min(1, "Amount must be greater then 0.").trim(),
        },
        { amount: fields.amount, profit: fields.profit }
    )

    return error;
};

export default Validation;