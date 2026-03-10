import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import './select.scss'

function Select({ ...props }) {
    return <SelectPrimitive.Root {...props} />
}

function SelectTrigger({ className, size = "default", children, ...props }) {
    return (
        <SelectPrimitive.Trigger className={`select-trigger select-trigger-${size} ${className}`}
            data-size={size}
            {...props}>
            <span className="select-value-wrapper">{children}</span>
            <SelectPrimitive.Icon asChild>
                <ChevronDown className="select-icon" />
            </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
    )
}

function SelectGroup({ className, ...props }) {
    return <SelectPrimitive.Group className={`select-group ${className}`} {...props} />
}

function SelectValue({ className, ...props }) {
    return <SelectPrimitive.Value className={`select-value ${className}`} {...props} />
}

function SelectLabel({ className, ...props }) {
    return <SelectPrimitive.Label className={`select-label ${className}`} {...props} />
}

function SelectItem({ className, children, ...props }) {
    return (
        <SelectPrimitive.Item
            className={`select-item ${className}`}
            {...props}
        >
            <span className="select-item-indicator-wrapper">
                <SelectPrimitive.ItemIndicator>
                    <Check size={16} />
                </SelectPrimitive.ItemIndicator>
            </span>

            <SelectPrimitive.ItemText>
                {children}
            </SelectPrimitive.ItemText>
        </SelectPrimitive.Item>
    );
}

function SelectSeparator({ className, ...props }) {
    return <SelectPrimitive.Separator className={`select-separator ${className}`} {...props} />
}

function SelectScrollUpButton({ className, ...props }) {
    return (
        <SelectPrimitive.ScrollUpButton className={`select-scroll-button ${className}`} {...props}>
            <ChevronUp size={16} />
        </SelectPrimitive.ScrollUpButton>
    )
}

function SelectScrollDownButton({ className, ...props }) {
    return (
        <SelectPrimitive.ScrollDownButton className={`select-scroll-button ${className}`} {...props}>
            <ChevronDown size={16} />
        </SelectPrimitive.ScrollDownButton>
    )
}

function SelectContent({ className, children, position = "popper", ...props }) {
    return (
        <SelectPrimitive.Portal>
            <SelectPrimitive.Content
                className={`select-content select-content-${position} ${className}`}
                position={position}
                {...props}
            >
                <SelectScrollUpButton />
                <SelectPrimitive.Viewport className="select-viewport">
                    {children}
                </SelectPrimitive.Viewport>
                <SelectScrollDownButton />
            </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
    )
}

export {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectScrollDownButton,
    SelectScrollUpButton,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
};
