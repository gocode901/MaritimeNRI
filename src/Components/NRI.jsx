import { useState, useRef } from "react";
import "./NRITimeCalculator.css";

const getFinancialYear = (year) => {
  const startYearStr = String(year);
  const endYearStr = String(year + 1);
  return `${startYearStr}-${endYearStr}`;
};

const startYear = 1990;
const endYear = new Date().getFullYear() + 4;

const financialYears = [];
for (let year = startYear; year <= endYear; year++) {
  financialYears.push(getFinancialYear(year));
}

export default function NRITimeCalculator() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  let defaultFinancialYear;
  if (currentMonth < 3) {
    defaultFinancialYear = getFinancialYear(currentYear - 1);
  } else {
    defaultFinancialYear = getFinancialYear(currentYear);
  }

  const [selectedYear, setSelectedYear] = useState(defaultFinancialYear);
  const [trips, setTrips] = useState([]);
  const [newTrip, setNewTrip] = useState({
    flyOut: null,
    flyIn: null,
    ongoing: false,
  });
  const flyOutRef = useRef(null);

  const handleYearSelect = (year) => {
    setSelectedYear(year);
  };

  const handleTripChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewTrip({ ...newTrip, [name]: type === "checkbox" ? checked : value });
  };

  const handleFlyOutChange = (date) => {
    setNewTrip({ ...newTrip, flyOut: date });
  };

  const handleFlyInChange = (date) => {
    setNewTrip({ ...newTrip, flyIn: date });
  };

  const addTrip = () => {
    if (!newTrip.flyOut) {
      alert("Please select a Fly-out date.");
      return;
    }

    const newTripToAdd = { ...newTrip };

    if (newTripToAdd.ongoing) {
      newTripToAdd.flyIn = null;
    } else if (!newTripToAdd.flyIn) {
      alert("Please select a Fly-in date or check 'Ongoing'.");
      return;
    }

    const flyOutDate = new Date(newTripToAdd.flyOut);
    const flyInDate = newTripToAdd.ongoing
      ? null
      : new Date(newTripToAdd.flyIn);

    // Overlap and Ongoing Trip Check:
    for (const trip of trips) {
      const existingFlyOut = new Date(trip.flyOut);
      const existingFlyIn = trip.ongoing ? new Date() : new Date(trip.flyIn);

      // Check for overlap (considering same-day starts/ends)

      if (
        flyOutDate <= existingFlyIn &&
        (flyInDate === null || flyInDate >= existingFlyOut)
      ) {
        setNewTrip({ flyOut: null, flyIn: null, ongoing: false });
        alert("New trip overlaps with an existing trip.");
        return;
      }

      // Check if a trip is ongoing and new trip's start date is after ongoing trip's start date
      if (trip.ongoing && flyOutDate >= existingFlyOut) {
        setNewTrip({ flyOut: null, flyIn: null, ongoing: false });
        alert("Cannot add a trip while an existing trip is ongoing.");
        return;
      }
    }

    if (flyInDate && flyInDate < flyOutDate) {
      alert("Fly-in date cannot be before Fly-out date.");
      return;
    }

    if (flyOutDate > currentDate) {
      alert("Fly-out date cannot be in the future.");
      return;
    }

    if (!newTripToAdd.ongoing && flyInDate > currentDate) {
      alert("Fly-in date cannot be in the future.");
      return;
    }

    setTrips([...trips, newTripToAdd]);
    setNewTrip({ flyOut: null, flyIn: null, ongoing: false });
  };
  const endOngoingTrip = (index) => {
    const updatedTrips = [...trips];
    if (updatedTrips[index].ongoing) {
      updatedTrips[index] = {
        ...updatedTrips[index],
        flyIn: new Date().toISOString().split("T")[0],
        ongoing: false,
      };
      setTrips(updatedTrips);
    }
  };

  const calculateNRIDays = () => {
    let totalDays = 0;
    for (const trip of trips) {
      let startDate = new Date(trip.flyOut);
      let endDate = trip.ongoing
        ? new Date()
        : trip.flyIn
        ? new Date(trip.flyIn)
        : new Date();

      const fyStart = new Date(parseInt(selectedYear.split("-")[0]), 3, 1);
      const fyEnd = new Date(parseInt(selectedYear.split("-")[1]), 2, 31);

      startDate = Math.max(startDate, fyStart);
      endDate = Math.min(endDate, fyEnd);

      if (startDate <= endDate) {
        let days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        const adjustedStartDate = new Date(trip.flyOut); // Original trip start date
        if (
          trip.ongoing &&
          adjustedStartDate >= fyStart &&
          adjustedStartDate <= fyEnd &&
          adjustedStartDate.toDateString() === new Date().toDateString()
        ) {
          days = 1;
        }
        totalDays += days;
      }
    }
    return totalDays;
  };

  const nriDays = calculateNRIDays();
  const daysNeeded = 183 - nriDays;

  const handleFlyOutFocus = () => {
    if (trips.length > 0) {
      const lastTrip = trips[trips.length - 1];
      const lastFlyIn = lastTrip.ongoing
        ? new Date()
        : new Date(lastTrip.flyIn);
      flyOutRef.current.min = lastFlyIn.toISOString().split("T")[0];
    } else {
      flyOutRef.current.min = "";
    }
  };

  return (
    <div className="nri-calculator-container">
      {/* Financial Year Dropdown */}
      <div className="financial-year-dropdown">
        <select
          value={selectedYear}
          onChange={(e) => handleYearSelect(e.target.value)}
          className="menu-button"
        >
          {financialYears.map((year) => (
            <option key={year} value={year}>
              FY {year}
            </option>
          ))}
        </select>
      </div>

      {/* Dashboard */}
      <div className="dashboard">
        <div className="nri-days">
          {/* {nriDays > 182
            ? `You Are An NRI\nNRI Days: ${nriDays}`
            : `NRI Days: ${nriDays}`} */}
          NRI Days: {nriDays}
          {nriDays > 182 && (
            <>
              <br />
              <span className="nri-status">Hey, You Are An NRI !!!</span>
            </>
          )}
        </div>
        <div className="days-needed">
          Days Needed: {daysNeeded > 0 ? daysNeeded : 0}
        </div>
      </div>

      {/* Trip List */}
      {trips.length === 0 ? (
        <p className="NoTrip">No Trips!!</p>
      ) : (
        <div className="trip-list">
          <h1 className="TripListHeading">Trip List</h1>
          <table>
            <thead>
              <tr>
                <th>Fly-out Date</th>
                <th>Fly-in Date</th>
                <th>Trip Length (Days)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip, index) => {
                let startDate = new Date(trip.flyOut);
                let endDate = trip.ongoing ? new Date() : new Date(trip.flyIn);

                const fyStart = new Date(
                  parseInt(selectedYear.split("-")[0]),
                  3,
                  1
                );
                const fyEnd = new Date(
                  parseInt(selectedYear.split("-")[1]),
                  2,
                  31
                );

                startDate = Math.max(startDate, fyStart);
                endDate = Math.min(endDate, fyEnd);

                const tripLength =
                  startDate <= endDate
                    ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) +
                      1
                    : 0;

                return (
                  <tr key={index}>
                    <td>{trip.flyOut.toString().split("T")[0]}</td>
                    <td>
                      {trip.ongoing
                        ? "Active"
                        : trip.flyIn.toString().split("T")[0]}
                    </td>
                    <td>{tripLength} in this FY</td>
                    <td>
                      <td>
                        {trip.ongoing ? (
                          <button onClick={() => endOngoingTrip(index)}>
                            End Trip
                          </button>
                        ) : (
                          "Ended!!"
                        )}
                      </td>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Trip Form */}
      <div className="add-trip">
        <h3>Add Trip</h3>
        <label htmlFor="flyOut">Fly-out Date:</label>
        <input
          type="date"
          id="flyOut"
          name="flyOut"
          value={newTrip.flyOut || ""}
          onChange={(e) => handleFlyOutChange(e.target.value)} // Corrected onChange
          ref={flyOutRef}
          onFocus={handleFlyOutFocus}
          min=""
        />

        <label htmlFor="flyIn">Fly-in Date:</label>
        <input
          type={newTrip.ongoing ? "text" : "date"}
          id="flyIn"
          name="flyIn"
          value={newTrip.ongoing ? "Ongoing" : newTrip.flyIn || ""}
          onChange={(e) => handleFlyInChange(e.target.value)} // Corrected onChange
          disabled={newTrip.ongoing}
        />

        <label>
          Ongoing:
          <input
            type="checkbox"
            name="ongoing"
            checked={newTrip.ongoing}
            onChange={handleTripChange}
          />
        </label>
        <button onClick={addTrip}>Add Trip</button>
      </div>
    </div>
  );
}
