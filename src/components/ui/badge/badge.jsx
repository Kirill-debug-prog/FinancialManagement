import { Slot } from "@radix-ui/react-slot";
import "./badge.scss";

function Badge({
    variant = "default",
    asChild = false,
    className = "",
    ...props
}) {
    const Comp = asChild ? Slot : "span";

    return (
        <Comp
            data-slot="badge"
            className={`badge badge--${variant} ${className}`.trim()}
            {...props}
        />
    );
}

export {Badge}