
export interface InputProps {
    label?: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    onBlur: () => void;
    error?: string;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    containerClassName?: string;
    inputClassName?: string;
    rightIcon?: React.ReactNode;
    touched?: boolean;
}