import language from "../../localization";
import SweetAlert from "../SweetAlert";

const CashInOutValidationAlert = (props) =>
{
    return (
        <SweetAlert
            title={language.alert}
            message={props.message}
            confirm={true}
			confirmText={language.ok}
			onConfirm={props.onConfirm}
			show={props.show}
			confirmButtonStyle={{ width: 50 }}
			confirmButtonTextStyle={{ textAlign: 'center' }}

        />
    )
};

const AddCustomerValidationAlert = (props) =>
{
    return (
        <SweetAlert
            title={language.alert}
            message={props.message}
            confirm={true}
			confirmText={language.ok}
			onConfirm={props.onConfirm}
			show={props.show}
			confirmButtonStyle={{ width: 50 }}
			confirmButtonTextStyle={{ textAlign: 'center' }}

        />
    )
};

const TokenAlert = (props) =>
{
    return (
        <SweetAlert
            title={language.alert}
            message={language.youEnteredInvalidTicket}
            confirm={true}
			confirmText={language.ok}
			onConfirm={props.onConfirm}
			show={props.show}
			confirmButtonStyle={{ width: 50 }}
			confirmButtonTextStyle={{ textAlign: 'center' }}

        />
    )
};

export { AddCustomerValidationAlert, CashInOutValidationAlert, TokenAlert };
export default () => {};