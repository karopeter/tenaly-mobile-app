import * as Yup from 'yup';

export const signUpSchema = Yup.object().shape({
    email: Yup.string()
       .email('Invalid email')
       .required('Email is required'),

    fullName: Yup.string()
       .min(2, 'Full name must be at least 2 characters')
       .required('Full name is required'),
    phoneNumber: Yup.string()
      .matches(/^\d{10,15}$/, 'Phone number is invalid')
      .required('Phone number is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    passwordConfirm: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Please confirm your password'),
    roleSelection: Yup.string().oneOf(['customer', 'seller']).required('Please select an option'),
});


export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .when('selectedTab', {
      is: 0, // When selectedTab is Email
      then: (schema) =>
        schema
          .email('Enter a valid email')
          .required('Email is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
  phoneNumber: Yup.string()
    .when('selectedTab', {
      is: 1, // When selectedTab is Phone
      then: (schema) =>
        schema
          .matches(/^\d{10,15}$/, 'Phone number must be 10–15 digits')
          .required('Phone number is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
  password: Yup.string()
    .min(6, 'Password too short')
    .required('Password is required'),
});

