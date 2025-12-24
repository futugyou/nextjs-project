
import React, { useState, useEffect } from "react";

const ActionButton = ({
    variant,
    theme,
    disabled,
    onClick,
    children,
}: {
    variant: "primary" | "secondary" | "success" | "danger";
    theme?: string;
    disabled?: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) => {
    const baseClasses = "px-6 py-3 rounded-lg font-semibold transition-all duration-200";
    const enabledClasses = "hover:scale-105 shadow-md hover:shadow-lg";
    const disabledClasses = "opacity-50 cursor-not-allowed";

    const variantClasses = {
        primary:
            "bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white shadow-lg hover:shadow-xl",
        secondary:
            theme === "dark"
                ? "bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 hover:border-slate-500"
                : "bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 hover:border-gray-400",
        success:
            "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl",
        danger:
            "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl",
    };

    return (
        <button
            className={`${baseClasses} ${disabled ? disabledClasses : enabledClasses} ${disabled && variant === "secondary"
                ? "bg-gray-200 text-gray-500"
                : disabled && variant === "success"
                    ? "bg-gray-400"
                    : variantClasses[variant]
                }`}
            disabled={disabled}
            onClick={onClick}
        >
            {children}
        </button>
    );
};

export default ActionButton;