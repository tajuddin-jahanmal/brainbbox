import React from "react";
import AwesomeAlert from 'react-native-awesome-alerts';
import Colors from "../../constant";

const SweetAlert = (props) =>
{
	return (
		<AwesomeAlert
			{...props}
			showProgress={props.progress || false}
			title={props.title || ''}
			message={props.message || ''}
			progressColor={props.progressColor || Colors.primary}
			progressSize={props.progressSize || 30}
			closeOnTouchOutside={props.closeOnHardwareBackPress || false}
			closeOnHardwareBackPress={props.hardwareClose || true}
			showCancelButton={props.cancel || false}
			showConfirmButton={props.confirm || false}
			confirmButtonColor={Colors.primary}
			onCancelPressed={props.onCancel}
			onConfirmPressed={props.onConfirm}
		/>
	)
};

export default SweetAlert;