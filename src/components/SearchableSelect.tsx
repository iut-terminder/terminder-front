import { useState, useEffect, useRef } from "react";

interface SearchableSelectOption {
  value: string;
  label: string;
  subLabel?: string;
  data?: any;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  placeholder: string;
  onSelect: (option: SearchableSelectOption) => void;
  className?: string;
  disabled?: boolean;
}

const SearchableSelect = ({ 
  options, 
  placeholder, 
  onSelect,
  className = "",
  disabled = false
}: SearchableSelectProps) => {
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<SearchableSelectOption[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredOptions(options.slice(0, 20));
    } else {
      const filtered = options.filter(option =>
        option.label?.toLowerCase().includes(search.toLowerCase()) ||
        option.value?.toString().toLowerCase().includes(search.toLowerCase()) ||
        option.subLabel?.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredOptions(filtered.slice(0, 20));
    }
  }, [search, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: SearchableSelectOption) => {
    onSelect(option);
    setSearch(option.label || "");
    setShowDropdown(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setShowDropdown(true);
  };

  const handleClear = () => {
    setSearch("");
    setShowDropdown(false);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full p-3 pr-10 border-2 border-gray-300 rounded-md text-right focus:border-teal-600 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
          dir="rtl"
          disabled={disabled}
        />
        
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          🔍
        </div>
        
        {search && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            type="button"
          >
            ✕
          </button>
        )}
      </div>

      {showDropdown && filteredOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto">
          <div className="p-2 border-b border-gray-100 bg-gray-50 text-xs text-gray-500 text-right">
            {filteredOptions.length} مورد یافت شد
          </div>
          {filteredOptions.map((option, index) => (
            <div
              key={option.value || index}
              onClick={() => handleSelect(option)}
              className="p-3 hover:bg-teal-50 cursor-pointer text-right border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="font-medium text-gray-800">{option.label}</div>
              {option.subLabel && (
                <div className="text-sm text-gray-500 mt-1">{option.subLabel}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {showDropdown && filteredOptions.length === 0 && search && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl">
          <div className="p-4 text-gray-500 text-center">
            نتیجه‌ای یافت نشد
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;