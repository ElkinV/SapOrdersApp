import React, { useState, useRef, useEffect } from "react";

interface DropdownMenuProps {
    onOptionSelect: (code: number) => void;
    initialOption?: string;
    label?: string;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
                                                       onOptionSelect,
                                                       initialOption = "Seleccionar tipo",
                                                       label = "Tipo de documento"
                                                   }) => {
    const [isActive, setIsActive] = useState(false);
    const [selectedOption, setSelectedOption] = useState(initialOption);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const optionsMap: { [key: string]: number } = {
        "Pedido Cliente": 13,
        "Cotización": 83,
    };

    // Visibilidad del estado: Añadir ARIA para lectores de pantalla
    const dropdownId = "document-type-dropdown";
    const labelId = "document-type-label";

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsActive(false);
        }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
            setIsActive(false);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setIsActive(!isActive);
        } else if (event.key === "ArrowDown" && isActive) {
            event.preventDefault();
            const menuButtons = document.querySelectorAll('[role="menuitem"]');
            if (menuButtons.length > 0) {
                (menuButtons[0] as HTMLElement).focus();
            }
        }
    };

    const handleOptionKeyDown = (event: React.KeyboardEvent, option: string) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleOptionClick(option);
        } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            const menuButtons = document.querySelectorAll('[role="menuitem"]');
            const currentIndex = Array.from(menuButtons).indexOf(event.currentTarget);
            const nextIndex = event.key === "ArrowDown"
                ? (currentIndex + 1) % menuButtons.length
                : (currentIndex - 1 + menuButtons.length) % menuButtons.length;
            (menuButtons[nextIndex] as HTMLElement).focus();
        } else if (event.key === "Tab" && !event.shiftKey && event.currentTarget === menuButtons[menuButtons.length - 1]) {
            setIsActive(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscapeKey);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscapeKey);
        };
    }, []);

    const handleOptionClick = (option: string) => {
        setSelectedOption(option);
        const code = optionsMap[option];
        onOptionSelect(code);
        setIsActive(false);
        buttonRef.current?.focus(); // Devolver el foco al botón principal
    };

    return (
        <div ref={dropdownRef} className="relative w-48">
            {/* Añadir etiqueta visible para claridad */}
            <label id={labelId} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <div
                className={`inline-flex items-center overflow-hidden rounded-md border bg-white shadow-sm w-full ${
                    isActive ? "ring-2 ring-blue-300" : ""
                }`}
                aria-expanded={isActive}
                aria-haspopup="listbox"
                aria-labelledby={labelId}
            >
                <button
                    ref={buttonRef}
                    type="button"
                    id={dropdownId}
                    onClick={() => setIsActive(!isActive)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left flex items-center justify-between"
                    aria-controls={isActive ? "dropdown-menu" : undefined}
                >
                    <span>{selectedOption}</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`w-4 h-4 ml-2 transition-transform ${isActive ? "rotate-180" : ""}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>
            </div>

            {isActive && (
                <div
                    id="dropdown-menu"
                    className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg animate-in fade-in"
                    role="listbox"
                    aria-labelledby={dropdownId}
                >
                    <div className="p-1">
                        {Object.keys(optionsMap).map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => handleOptionClick(option)}
                                onKeyDown={(e) => handleOptionKeyDown(e, option)}
                                className={`flex w-full items-center justify-between rounded-lg px-4 py-2 text-sm ${
                                    selectedOption === option
                                        ? "bg-blue-100 text-blue-700 font-medium"
                                        : "text-gray-700 hover:bg-gray-50"
                                }`}
                                role="menuitem"
                                aria-selected={selectedOption === option}
                                tabIndex={isActive ? 0 : -1}
                            >
                                {option}
                                {selectedOption === option && (
                                    <svg
                                        className="w-4 h-4 text-blue-600"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DropdownMenu;