import { useState, useRef, useEffect } from "react";
import "./FinYear.css";

const getFinancialYear = (year) => {
  const startYearStr = String(year);
  const endYearStr = String(year + 1);
  return `${startYearStr}-${endYearStr}`;
};

const startYear = 1990;
const endYear = new Date().getFullYear() + 5;

const financialYears = [];
for (let year = startYear; year <= endYear; year++) {
  financialYears.push(getFinancialYear(year));
}

export default function FinancialYearDropdown() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  let defaultFinancialYear;
  if (currentMonth < 3) {
    // Before April 1st (month 3)
    defaultFinancialYear = getFinancialYear(currentYear - 1);
  } else {
    defaultFinancialYear = getFinancialYear(currentYear);
  }

  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(defaultFinancialYear); // Set default to current FY
  const dropdownRef = useRef(null);

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="financial-year-dropdown" ref={dropdownRef}>
      <button onClick={toggleDropdown} className="menu-button">
        FY {selectedYear}
        <span className="chevron">▼</span>
      </button>

      {isOpen && (
        <div className="menu-items">
          <div className="menu-items-list">
            {financialYears.map((year) => (
              <div key={year}>
                <button
                  onClick={() => handleYearSelect(year)}
                  className="menu-item"
                >
                  {year}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
