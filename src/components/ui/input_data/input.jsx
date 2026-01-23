import React from "react";
import CurrencyInput from 'react-currency-input-field';
import './input.scss'

function Input({ className, type, ...props }) {
    return (
        <input
            type={type}
            className={`input-box input-data ${className || ""}`}
            {...props}
        />
    )
};

function CurrencyInputs({ className, ...props }) {
    return (
        <CurrencyInput
        className={`input-box input-data ${className || ""}`}
        {...props} />
    )
};

export { Input, CurrencyInputs };
