import "./table.scss";

function joinClasses(base, extra) {
    return [base, extra].filter(Boolean).join(" ");
}

export function Table({ className, ...props }) {
    return (
        <div className={joinClasses("table-container", className)}>
            <table className={joinClasses("table", className)} {...props} />
        </div>
    );
}

export function TableHeader({ className, ...props }) {
    return (
        <thead className={joinClasses("table-header", className)} {...props} />
    );
}

export function TableBody({ className, ...props }) {
    return (
        <tbody className={joinClasses("table-body", className)} {...props} />
    );
}

export function TableFooter({ className, ...props }) {
    return (
        <tfoot className={joinClasses("table-footer", className)} {...props} />
    );
}

export function TableRow({ className, ...props }) {
    return (
        <tr className={joinClasses("table-row", className)} {...props} />
    );
}

export function TableHead({ className, ...props }) {
    return (
        <th data-slot="table-head" className={joinClasses("table-head", className)} {...props} />
    );
}

export function TableCell({ className, ...props }) {
    return (
        <td className={joinClasses("table-cell", className)} {...props} />
    );
}

export function TableCaption({ className, ...props }) {
    return (
        <caption className={joinClasses("table-caption", className)} {...props} />
    );
}
