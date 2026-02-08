import * as SwitchPrimitive from "@radix-ui/react-switch";
import clsx from "clsx";
import "./switch.scss";

function Switch({ className, ...props }) {
    return (
        <SwitchPrimitive.Root
            className={clsx("switch", className)}
            {...props}
        >
            <SwitchPrimitive.Thumb
                className="switch__thumb"
            />
        </SwitchPrimitive.Root>
    );
}

export { Switch };
