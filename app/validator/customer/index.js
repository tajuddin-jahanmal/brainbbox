import * as yup from 'yup';
export default (data) =>
{
  let schema = yup.object().shape({
      email: yup.string().email().optional().default("").trim(),
      countryCode: yup.string().required().trim(),
      phone: yup.string().required().min(6, "Phone must be between 6 and 12 numbers.").max(12, "Phone must be between 6 and 12 numbers.").trim(),
      lastName: yup.string().optional().default(""),
      firstName: yup.string().required().trim(),
    });

    try {
      schema.validateSync({...data});
      return {status: 'success', data: {...data}};
    } catch (error) {
      return {status: 'failure', message: error.errors[0]}
    }
}
