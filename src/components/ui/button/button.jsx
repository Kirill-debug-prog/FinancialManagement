import React from "react";
import './button.css'

export function Button({ variant = "black", className, ...props }) {
    return (
        <button
        variant={variant}
        className={`btn btn-${variant} ${className || ""}`}
        {...props}
        />
    )
};