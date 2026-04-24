"use client";

import { useState, useEffect, useRef } from "react";

function CurrencyDropdown({ value, onChange, currencies, currencyInfo, label }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);

    const scrollContainerRef = useRef(null);

    function getCurrencyLabel(code) {
        const info = currencyInfo[code];
        if (!info) return code;
        return `${code} - ${info.name}`;
    }

    const filtered = currencies.filter((c) =>
        getCurrencyLabel(c).toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        if (isOpen && scrollContainerRef.current) {
            const activeElement = scrollContainerRef.current.children[activeIndex];
            if (activeElement) {
                activeElement.scrollIntoView({
                    block: "nearest",
                    behavior: "smooth"
                });
            }
        }
    }, [activeIndex, isOpen]);

    return (
        <div className="relative mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>

            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-3 cursor-pointer bg-white hover:border-green-500 transition"
            >
                {currencyInfo[value] && (
                    <img src={currencyInfo[value].flag} alt={value} className="w-8 h-6 rounded-sm object-cover" />
                )}
                <span className="flex-1">{getCurrencyLabel(value)}</span>
                <span className="text-gray-400">▼</span>
            </div>

            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => { setIsOpen(false); setSearchQuery(""); }}
                />
            )}

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-hidden flex flex-col">
                    <input
                        autoFocus
                        type="text"
                        placeholder="Search..."
                        className="p-3 border-b border-gray-100 focus:outline-none"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setActiveIndex(0);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "ArrowDown") {
                                e.preventDefault();
                                setActiveIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : prev));
                            } else if (e.key === "ArrowUp") {
                                e.preventDefault();
                                setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
                            } else if (e.key === "Enter") {
                                if (filtered.length > 0) {
                                    onChange(filtered[activeIndex]);
                                    setIsOpen(false);
                                    setSearchQuery("");
                                    setActiveIndex(0);
                                }
                            }
                        }}
                    />
                    <div ref={scrollContainerRef} className="overflow-y-auto">
                        {filtered.map((c, index) => (
                            <div
                                key={c}
                                className={`flex items-center gap-3 px-4 py-3 cursor-pointer ${index === activeIndex ? "bg-green-50 border-l-4 border-green-500" : "hover:bg-gray-50"
                                    }`}
                                onMouseEnter={() => setActiveIndex(index)}
                                onClick={() => {
                                    onChange(c);
                                    setIsOpen(false);
                                    setActiveIndex(0);
                                    setSearchQuery("");
                                }}
                            >
                                {currencyInfo[c] && (
                                    <img src={currencyInfo[c].flag} alt={c} className="w-6 h-4 rounded-sm" />
                                )}
                                <span className={value === c ? "font-bold text-green-700" : ""}>
                                    {getCurrencyLabel(c)}
                                </span>
                            </div>
                        ))}
                        {filtered.length === 0 && (
                            <div className="p-4 text-gray-500 text-sm">No currencies found...</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default CurrencyDropdown;