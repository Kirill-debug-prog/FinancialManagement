import React from "react";
import './input.css'

function Input ({className, type, ...props}) {
    return (
        <input
        type = {type}
        className={`input-box input-data ${className || ""}`}
        {...props}
        />
    )
};

export {Input};
