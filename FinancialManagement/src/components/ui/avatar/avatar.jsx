import * as AvatarPrimitive from "@radix-ui/react-avatar";
import clsx from "clsx";
import "./avatar.scss";

function Avatar({ className, ...props }) {
    return (
        <AvatarPrimitive.Root
            className={clsx("avatar", className)}
            {...props}
        />
    );
}

function AvatarImage({ className, ...props }) {
    return (
        <AvatarPrimitive.Image
            className={clsx("avatar__image", className)}
            {...props}
        />
    );
}

function AvatarFallback({ className, ...props }) {
    return (
        <AvatarPrimitive.Fallback
            className={clsx("avatar__fallback", className)}
            {...props}
        />
    );
}

export { Avatar, AvatarImage, AvatarFallback };
