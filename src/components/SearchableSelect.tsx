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
  const [dropdownUpwards, setDropdownUpwards] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(option =>
        option.label?.toLowerCase().includes(search.toLowerCase()) ||
        option.value?.toString().toLowerCase().includes(search.toLowerCase()) ||
        option.subLabel?.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [search, options]);

  useEffect(() => {
    // بررسی اینکه dropdown باید به بالا باز شود یا پایین
    if (inputRef.current && showDropdown) {
      const inputRect = inputRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - inputRect.bottom;
      const spaceAbove = inputRect.top;
      
      // اگر فضای پایین کمتر از 300px باشد، به بالا باز شود
      setDropdownUpwards(spaceBelow < 300 && spaceAbove > 300);
    }
  }, [showDropdown]);

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
    setSearch("");
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
          ref={inputRef}
          type="text"
          value={search}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full p-4 pr-12 text-lg border-2 border-gray-300 rounded-lg text-right focus:border-teal-600 focus:ring-4 focus:ring-teal-200 outline-none transition-all h-14"
          dir="rtl"
          disabled={disabled}
        />
        
        {/* آیکون جستجو */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
          
        </div>
        
        {/* آیکون پاک کردن */}
        {search && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl"
            type="button"
          >
            ✕
          </button>
        )}
      </div>

      {showDropdown && filteredOptions.length > 0 && (
        <div 
          className={`absolute z-50 w-full min-w-[500px] bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto ${
            dropdownUpwards 
              ? 'bottom-full mb-1'  // به بالا باز شود
              : 'top-full mt-1'     // به پایین باز شود
          }`}
        >
          <div className="p-2 border-b border-gray-100 bg-gray-50 text-sm text-gray-500 text-right">
            {filteredOptions.length} مورد یافت شد
          </div>
          {filteredOptions.map((option, index) => (
            <div
              key={option.value || index}
              onClick={() => handleSelect(option)}
              className="p-3 hover:bg-teal-50 cursor-pointer text-right border-b border-gray-100 last:border-b-0 transition-colors flex items-center justify-between"
            >
              {/* نام درس */}
              <div className="font-bold text-gray-800 text-lg truncate ml-4">
                {option.label}
              </div>
              
              {/* اطلاعات تکمیلی */}
              <div className="flex items-center gap-3 text-sm text-gray-600 flex-shrink-0">
                {option.subLabel?.split('|').map((part, i) => (
                  <span key={i} className="bg-gray-100 px-3 py-1 rounded-md whitespace-nowrap">
                    {part.trim()}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showDropdown && filteredOptions.length === 0 && search && (
        <div className={`absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-xl ${
          dropdownUpwards ? 'bottom-full mb-1' : 'top-full mt-1'
        }`}>
          <div className="p-4 text-gray-500 text-center text-lg">
            🔍 نتیجه‌ای یافت نشد
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;