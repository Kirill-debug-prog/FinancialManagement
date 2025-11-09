import React from 'react'
import './card.css'

function Card ({className, ...props}) {
    return (
        <div 
        className={`card ${className || ""}`}
        {...props}>
        </div>
    )
};

function CardHeader ({className, ...props}) {
    return (
        <div className={`cardHeder ${className ||""}`}
        {...props}>
        </div>
    )
}

function CradTitle ({className, ...props}) {
    return (
        <h4 className={`cardTitle ${className ||""}`}
        {...props}>
        </h4>
    )
}

function CardDescription ({className, ...props}) {
    return (
        <p className={`cardDescription ${className ||""}`}
        {...props}>
        </p>
    )
}

export  {
    Card,
    CardHeader,
    CradTitle,
    CardDescription,
}