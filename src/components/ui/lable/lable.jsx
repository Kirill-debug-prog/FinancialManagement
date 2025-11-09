import React from "react";
import './lable.css'

function Lable({clasNAme, ...props}) {
    return (
        <label 
        className={`lable ${clasNAme || ""}`} 
        {...props} />
    )
};

export {Lable};