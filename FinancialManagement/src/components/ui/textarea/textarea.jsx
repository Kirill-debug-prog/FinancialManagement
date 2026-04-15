import "./textarea.scss";

function Textarea({ className = "", ...props }) {
    return (
        <textarea
            data-slot="textarea"
            className={`textarea ${className}`}
            {...props}
        />
    );
}

export default  Textarea ;
