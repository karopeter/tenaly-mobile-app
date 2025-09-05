import { SignUpFormValues, LoginFormValues } from "./auth.d";

export const signUpInitialValues: SignUpFormValues = {
  fullName: '',
  email: '',
  phoneNumber: '',
  password: '',
  passwordConfirm: '',
  roleSelection: 'customer'
};

export const loginInitialValues: LoginFormValues = {
  login: '',
  password: '',
  selectedTab: 0,
}