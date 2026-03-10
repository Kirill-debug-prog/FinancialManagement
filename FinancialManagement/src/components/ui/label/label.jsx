import React from "react";
import './label.css'

function Label({clasName, ...props}) {
    return (
        <label 
        className={`lable ${clasName || ""}`} 
        {...props} />
    )
};

export {Label};