import { useState } from "react";
import "./Accordion.scss";

export function Accordion({ children, multiple = false }) {
    const [openItems, setOpenItems] = useState([]);

    const toggleItem = (value) => {
        setOpenItems((prev) => {
            if (multiple) {
                return prev.includes(value)
                    ? prev.filter((v) => v !== value)
                    : [...prev, value];
            }
            return prev[0] === value ? [] : [value];
        });
    };

    return (
        <div className="accordion">
            {children.map((child) =>
                child.type === AccordionItem
                    ? {
                        ...child,
                        props: {
                            ...child.props,
                            isOpen: openItems.includes(child.props.value),
                            onToggle: toggleItem,
                        },
                    }
                    : child
            )}
        </div>
    );
}

export function AccordionItem({ value, isOpen, onToggle, children }) {
    return (
        <div className={`accordion__item ${isOpen ? "is-open" : ""}`}>
            {children.map((child) =>
                typeof child === "object"
                    ? {
                        ...child,
                        props: {
                            ...child.props,
                            value,
                            isOpen,
                            onToggle,
                        },
                    }
                    : child
            )}
        </div>
    );
}

export function AccordionTrigger({ children, value, isOpen, onToggle }) {
    return (
        <button
            className="accordion__trigger"
            onClick={() => onToggle(value)}
            aria-expanded={isOpen}
        >
            <span>{children}</span>
            <span className="accordion__icon">⌄</span>
        </button>
    );
}

export function AccordionContent({ children, isOpen }) {
    return (
        <div
            className="accordion__content"
            style={{ maxHeight: isOpen ? "1000px" : "0px" }}
        >
            <div className="accordion__content-inner">{children}</div>
        </div>
    );
}
