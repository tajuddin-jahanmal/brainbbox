import language from "../../localization";
import SweetAlert from "../SweetAlert";

const CashInOutValidationAlert = (props) => {
  return (
    <SweetAlert
      title={props?.title || language?.alert}
      message={props?.message}
      confirm={true}
      confirmText={props?.confirmText || language?.ok}
      onConfirm={props?.onConfirm}
      show={props?.show}
      confirmButtonStyle={{ width: 50, ...props?.confirmButtonStyle }}
      confirmButtonTextStyle={{ 
        textAlign: 'center', 
        ...props?.confirmButtonTextStyle 
      }}
      cancel={props?.cancel}
      cancelText={props?.cancelText}
      onCancelPressed={props?.onCancel}
      {...props} // Spread remaining props at the end
    />
  );
};

const AddCustomerValidationAlert = (props) => {
  return (
    <SweetAlert
      title={props?.title || language?.alert}
      message={props?.message}
      confirm={true}
      confirmText={props?.confirmText || language?.ok}
      onConfirm={props?.onConfirm}
      show={props?.show}
      confirmButtonStyle={{ width: 50, ...props?.confirmButtonStyle }}
      confirmButtonTextStyle={{ 
        textAlign: 'center', 
        ...props?.confirmButtonTextStyle 
      }}
      cancel={props?.cancel}
      cancelText={props?.cancelText}
      onCancelPressed={props?.onCancel}
      {...props}
    />
  );
};

const TokenAlert = (props) => {
  return (
    <SweetAlert
      title={props?.title || language?.alert}
      message={props?.message || language?.youEnteredInvalidTicket}
      confirm={true}
      confirmText={props?.confirmText || language?.ok}
      onConfirm={props?.onConfirm}
      show={props?.show}
      confirmButtonStyle={{ width: 50, ...props?.confirmButtonStyle }}
      confirmButtonTextStyle={{ 
        textAlign: 'center', 
        ...props?.confirmButtonTextStyle 
      }}
      cancel={props?.cancel}
      cancelText={props?.cancelText}
      onCancelPressed={props?.onCancel}
      {...props}
    />
  );
};

const AccountDeleteAlert = (props) => {
  return (
    <SweetAlert
      title={props?.title || language?.alert}
      message={props?.message || language?.areYouSureToDeleteAccount}
      confirm={true}
      confirmText={props?.confirmText || language?.sure}
      onConfirm={props?.onConfirm}
      show={props?.show}
      confirmButtonStyle={{ width: 50, ...props?.confirmButtonStyle }}
      confirmButtonTextStyle={{ 
        textAlign: 'center', 
        ...props?.confirmButtonTextStyle 
      }}
      cancel={true}
      cancelText={props?.cancelText}
      onCancelPressed={props?.onCancel}
      {...props}
    />
  );
};

const AccountDeleteProcessAlert = (props) => {
  return (
    <SweetAlert
      title={props?.title || language?.alert}
      message={props?.message || language?.deleteAccountMessage}
      confirm={true}
      confirmText={props?.confirmText || language?.ok}
      onConfirm={props?.onConfirm}
      show={props?.show}
      confirmButtonStyle={{ width: 50, ...props?.confirmButtonStyle }}
      confirmButtonTextStyle={{ 
        textAlign: 'center', 
        ...props?.confirmButtonTextStyle 
      }}
      // cancel={props?.cancel}
      // cancelText={props?.cancelText}
      // onCancelPressed={props?.onCancel}
      {...props}
    />
  );
};

export {
  AccountDeleteAlert,
  AccountDeleteProcessAlert, AddCustomerValidationAlert,
  CashInOutValidationAlert,
  TokenAlert
};

export default () => {};