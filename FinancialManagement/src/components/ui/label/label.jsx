import React from "react";
import './label.scss'

function Label({clasName, ...props}) {
    return (
        <label 
        className={`lable ${clasName || ""}`} 
        {...props} />
    )
};

export {Label};