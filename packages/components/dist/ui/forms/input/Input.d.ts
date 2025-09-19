import React from 'react';
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    error?: string;
    helperText?: string;
    fullWidth?: boolean;
    startAdornment?: React.ReactNode;
    endAdornment?: React.ReactNode;
    variant?: 'outlined' | 'filled' | 'standard';
    size?: 'small' | 'medium' | 'large';
}
export declare const Input: React.FC<InputProps>;
export default Input;
//# sourceMappingURL=Input.d.ts.map