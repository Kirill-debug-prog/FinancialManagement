import * as SeparatorPrimitive from "@radix-ui/react-separator";
import clsx from "clsx";

import "./separator.scss";

function Separator({
    className,
    orientation = "horizontal",
    decorative = true,
    ...props
}) {
    return (
        <SeparatorPrimitive.Root
            decorative={decorative}
            orientation={orientation}
            className={clsx("separator", className)}
            {...props}
        />
    );
}

export { Separator };
