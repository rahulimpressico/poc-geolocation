import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import randomColor from "randomcolor";
import { ZoomControl } from "react-leaflet";
import Multiselect from "multiselect-react-dropdown";
import "leaflet.polyline.snakeanim/L.Polyline.SnakeAnim.js";
import { useNavigate } from "react-router-dom";


export const Geo = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [deviceId, setDeviceId] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const navigate = useNavigate();

  const mapRef = useRef(null);

  const handleDeviceIdChange = (selectedOptions) => {
    const selectedValues = selectedOptions.map((option) => option);
    setDeviceId(selectedValues);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const getRandomColor = () => {
    const randomcolor = randomColor({
      luminosity: "dark",
    });
    return randomcolor;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const accessToken = localStorage.getItem("token");
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${accessToken}`);
    var requestOptions = {
      method: "GET",
      headers: myHeaders,
    };

    const response = await fetch(
      "https://location-api-xl.onrender.com/location",
      requestOptions
    );
    const data = await response.json();
    console.log("papu:", data);

    const filteredLocations = data.filter((data) => {
      const date = new Date(data.date).toLocaleString("en-US");
      const withinDateRange =
        (!startDate || date >= new Date(startDate).toLocaleString("en-US")) &&
        (!endDate || date <= new Date(endDate).toLocaleString("en-US"));
      const deviceMatch = deviceId.includes(data.device_id);

      return withinDateRange && (deviceId.length === 0 || deviceMatch);
    });

    const sortedData = filteredLocations.sort((a, b) => {
      const dateA = new Date(a.date).toLocaleString("en-US");
      const dateB = new Date(b.date).toLocaleString("en-US");
      return dateA - dateB;
    });

    setFilteredData(sortedData);

    setDeviceId("");
    setEndDate("");
    setStartDate("");
  };

  const handleReset = () => {
    // window.location.reload();
    getData();
  };

  const HandelLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const getData = async () => {
    const accessToken = localStorage.getItem("token");
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${accessToken}`);
    var requestOptions = {
      method: "GET",
      headers: myHeaders,
    };
    try {
      const response = await fetch(
        "https://location-api-xl.onrender.com/location",
        requestOptions
      );
      if (response.status === 200) {
        const data = await response.json();

        const filteredData = data.map((obj) => {
          const { id, ...filteredObj } = obj;
          return { ...filteredObj };
        });
        const sortedData = [...filteredData].sort((a, b) => {
          if (a.device_id !== b.device_id) {
            return a.device_id.localeCompare(b.device_id);
          }
          const A_date = new Date(a.date);
          const B_date = new Date(b.date);
          const formattedDate_A = A_date.toLocaleString("en-US");
          const formattedDate_B = B_date.toLocaleString("en-US");
          const dateA = new Date(formattedDate_A);
          const dateB = new Date(formattedDate_B);
          return dateA - dateB;
        });

        setFilteredData(sortedData);
      } else {
        throw new Error("Failed to fetch data");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map", {
        zoomControl: false,
      }).setView([39.9724676, -99.5540494], 6);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 26,
        attribution:
          'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);

      // L.control.zoom({ position: "topright" }).addTo(mapRef.current);
    }
  }, []);

  useEffect(() => {
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        mapRef.current.removeLayer(layer);
      }
    });
    const devices = new Set(filteredData.map((data) => data.device_id));

    devices.forEach((device) => {
      const deviceLocations = filteredData.filter(
        (data) => data.device_id === device
      );

      const coordinates = deviceLocations
        .filter((dataPoint) => dataPoint.latitude && dataPoint.longitude)
        .map((dataPoint) => [
          parseFloat(dataPoint.latitude),
          parseFloat(dataPoint.longitude),
        ])
        .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng));

      const color = getRandomColor();
      const markerColors = ["blue"];

      const latLngs = coordinates.map(([lat, lng]) => L.latLng(lat, lng));

      setTimeout(() => {
        try {
          const j = latLngs;
          const Poluyine = L.polyline(j, {
            color,
            weight: 6,
            smoothFactor: 1,
            snakingSpeed: 200,
            vertices: 20,
          }).addTo(mapRef.current);
          Poluyine.snakeIn();
        } catch (err) {}
      }, 10000);

      // const startMarker = L.circleMarker(coordinates[0], {
      //   color: "#2DBEFF",
      //   fillColor: "#2DBEFF",
      //   fillOpacity: 1,
      //   radius: 4,
      // }).addTo(mapRef.current);

      L.marker(coordinates[coordinates.length - 1], {
        icon: L.icon({
          iconUrl: `https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${markerColors}.png`,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        }),
      })
        .bindPopup(`<b>Hello!</b><br>I am a Device ${device}.`)
        .addTo(mapRef.current);

      // vv.snakeIn();
    });
  }, [filteredData]);

  // useEffect(() => {});

  const uniqueDeviceIds = [];
  filteredData.forEach((data) => {
    const device__id = data.device_id;

    if (!uniqueDeviceIds.includes(device__id)) {
      uniqueDeviceIds.push(device__id);
    }
  });

  return (
    <>
      <div
        id="map"
        className="container-fluid"
        style={{ width: "100%", height: "943px", border: "0px", zIndex: "1" }}
      >
        <div>
          <div className="row">
            <nav
              className="navbar navbar-expand-lg navbar-light shadow-none"
              style={{ height: "72px", zIndex: "9999" }}
            >
              <div className="container-fluid">
                <a className="navbar-brand fw-bold" href="#">
                  <img
                    src="geo.png"
                    alt="Logo"
                    width="30"
                    height="38"
                    className="d-inline-block"
                  />
                  <span className="h5  fw-bold">GeoLocation Tracker</span>
                </a>
              </div>
              <div className="d-flex">
                <button
                  type="submit"
                  className="btn btn-success"
                  style={{ paddingRight: "60px", paddingLeft: "20px" }}
                  onClick={HandelLogout}
                >
                  Logout
                </button>
              </div>
            </nav>
          </div>
          <br />

          <div className="row mx-1">
            <div className="col-md-3" style={{ zIndex: "9999" }}>
              <>
                {" "}
                <label className="form-label fw-bold fs-6">Device ID</label>
                <Multiselect
                  isObject={false}
                  onKeyPressFn={() => {}}
                  onRemove={() => {}}
                  onSearch={() => {}}
                  onSelect={handleDeviceIdChange}
                  options={uniqueDeviceIds.map((id) => id)}
                  className="bg-white"
                  selectedValues={deviceId}
                />
                {/* <select
                  className="choices-multiple form-select shadow-lg"
                  onChange={handleDeviceIdChange}
                  data-live-search="true"
                  multiple
                >
                  <option key={"ud"}>Select your Device </option>
                  {uniqueDeviceIds.map((id, index) => {
                    return (
                      <option key={index} value={id}>
                        {id}
                      </option>
                    );
                  })}
                </select> */}
              </>
            </div>
            <div className="col-md-3" style={{ zIndex: "9999" }}>
              {" "}
              <label className="form-label fs-6 fw-bold">Start Date</label>
              <input
                type="datetime-local"
                className="form-control shadow-lg"
                id="start_date"
                onChange={handleStartDateChange}
                value={startDate}
              />
            </div>
            <div className="col-md-3" style={{ zIndex: "9999" }}>
              <label className="form-label fw-bold fs-6">End Date</label>
              <input
                type="datetime-local"
                className="form-control shadow-lg"
                id="end_date"
                onChange={handleEndDateChange}
                value={endDate}
              />
            </div>
            <div
              className="col-md-3"
              style={{ paddingTop: "7px", zIndex: "9999" }}
            >
              {(deviceId && startDate && endDate && (
                <button
                  type="submit"
                  className="btn btn-success my-4 mx-3 float-start"
                  onClick={handleSubmit}
                >
                  Submit
                </button>
              )) || (
                <>
                  <button
                    type="submit"
                    className="btn btn-primary my-4 mx-3 float-start shadow-lg"
                    onClick={handleReset}
                  >
                    Reset
                  </button>
                </>
              )}
            </div>
          </div>

          <br />
          <br />
        </div>
      </div>
    </>
  );
};
