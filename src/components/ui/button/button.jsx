import './button.scss'

export function Button({ variant = "black", size="default", className, ...props }) {
    return (
        <button
        variant={variant}
        className={`btn btn-${variant} ${className || ""} size-${size}`}
        {...props}
        />
    )
};