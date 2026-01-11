import React from "react";
import './lable.css'

function Lable({clasName, ...props}) {
    return (
        <label 
        className={`lable ${clasName || ""}`} 
        {...props} />
    )
};

export {Lable};