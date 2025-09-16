import Toast from 'react-native-toast-message';


export const showSuccessToast = (message: string) => {
    Toast.show({
        type: 'success',
        text1: 'Success',
        text2: message,
        visibilityTime: 3000,
        autoHide: true,
        position: 'top'
    });
};

export const showErrorToast = (message: string) => {
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: message,
      visibilityTime: 4000,
      autoHide: true,   
      position: 'top'
    });
};