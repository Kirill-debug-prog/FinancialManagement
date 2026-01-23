import * as React from "react";
import './tabs.scss'
import * as TabsPrimitive from "@radix-ui/react-tabs";

function Tabs({ className, ...props }) {
    return (
        <TabsPrimitive.Root
            className={`tabs ${className || ""}`}
            {...props}
        />
    )
};

function TabsList({ className, ...props }) {
    return (
        <TabsPrimitive.List
            className={`tabs-list ${className || ""}`}
            {...props}
        />
    )
};

function TabsTrigger({ className, ...props }) {
    return (
        <TabsPrimitive.Trigger
        className={`tabs-trigger ${className || ""}`}
        {...props}
        />
    )
};

function TabsContent ({className, ...props}) {
    return(<TabsPrimitive.Content
    className={`tabs-content ${className || ""}`}
    {...props}
    />)
}

export {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
}