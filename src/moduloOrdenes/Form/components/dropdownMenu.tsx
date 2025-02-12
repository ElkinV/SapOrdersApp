import React, { useState, useRef } from "react";

interface DropdownMenuProps {
    onOptionSelect: (code: number) => void; // Callback para enviar el código asociado
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ onOptionSelect }) => {
    const [isActive, setIsActive] = useState(false);
    const [selectedOption, setSelectedOption] = useState("Tipo");

    // Mapa de opciones con códigos asociados
    const optionsMap: { [key: string]: number } = {
        PediClie: 13,
        Cotiza: 83,
    };

    const dropdownRef = useRef<HTMLDivElement>(null);

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

    React.useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscapeKey);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscapeKey);
        };
    }, []);

    const handleOptionClick = (option: string) => {
        setSelectedOption(option); // Actualiza la opción seleccionada visualmente
        const code = optionsMap[option]; // Obtiene el código asociado
        onOptionSelect(code); // Envía el código al componente padre
        setIsActive(false); // Cierra el menú
    };

    return (
        <div ref={dropdownRef} className="relative">
            <div className="mt-4 inline-flex items-center overflow-hidden rounded-md border bg-white">
                <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-700"
                >
                    {selectedOption}
                </button>
                <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className="h-full p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-700"
                >
                    <span className="sr-only">Menu</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="size-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
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
                    className="absolute end-0 z-10 mt-2 w-56 rounded-md border border-gray-100 bg-white shadow-lg"
                    role="menu"
                >
                    <div className="p-2">
                        <button
                            type="button"
                            onClick={() => handleOptionClick("PediClie")}
                            className="block w-full text-left rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                            role="menuitem"
                        >
                            PediClie
                        </button>
                        <button
                            type="button"
                            onClick={() => handleOptionClick("Cotiza")}
                            className="block w-full text-left rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                            role="menuitem"
                        >
                            Cotiza
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DropdownMenu;
