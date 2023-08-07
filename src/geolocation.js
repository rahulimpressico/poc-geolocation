import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import randomColor from "randomcolor";
import { ZoomControl } from "react-leaflet";
import Multiselect from "multiselect-react-dropdown";
import "leaflet.polyline.snakeanim/L.Polyline.SnakeAnim.js";
import { useNavigate } from "react-router-dom";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

export const Geo = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [deviceId, setDeviceId] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const navigate = useNavigate();

  const mapRef = useRef(null);

  const handleDeviceIdChange = (_, values) => {
    setDeviceId(values);
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

    const filteredLocations = data.filter((data) => {
      const locationDateTime = new Date(data.date);
      const startDateObj = startDate ? new Date(startDate) : null;
      const endDateObj = endDate ? new Date(endDate) : null;

      const withinDateTimeRange =
        (!startDateObj || locationDateTime >= startDateObj) &&
        (!endDateObj || locationDateTime <= endDateObj);

      const deviceMatch = deviceId.includes(data.device_id);

      return withinDateTimeRange && deviceMatch;
    });

    const sortedData = filteredLocations.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
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
        const check = data.map((id) => {
          console.log(id.device_id);
          if (id.length > 1) {
            return id;
          } else {
            return "No such country.";
          }
        });
        // console.log(check);

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
  /////////////////////////////////

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371.0; // Earth's radius in km

    const lat1Rad = (lat1 * Math.PI) / 180.0;
    const lon1Rad = (lon1 * Math.PI) / 180.0;
    const lat2Rad = (lat2 * Math.PI) / 180.0;
    const lon2Rad = (lon2 * Math.PI) / 180.0;

    const dlon = lon2Rad - lon1Rad;
    const dlat = lat2Rad - lat1Rad;

    const a =
      Math.sin(dlat / 2) ** 2 +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dlon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;
    return distance;
  }

  function calculateStoppageAndMovingTime(data) {
    let stoppageTime = 0;
    let movingTime = 0;

    for (let i = 1; i < data.length; i++) {
      const prevPoint = data[i - 1];
      const currentPoint = data[i];

      const prevTime = new Date(prevPoint.date);
      const currentTime = new Date(currentPoint.date);

      //  Convert to hours
      const timeDifference = (currentTime - prevTime) / (1000 * 3600);
      const roundedTimeDifference = Number(timeDifference.toFixed(2));

      const distance = calculateDistance(
        parseFloat(prevPoint.latitude),
        parseFloat(prevPoint.longitude),
        parseFloat(currentPoint.latitude),
        parseFloat(currentPoint.longitude)
      );

      if (distance === 0) {
        stoppageTime += roundedTimeDifference;
      } else {
        movingTime += roundedTimeDifference;
      }
    }

    return { stoppageTime, movingTime };
  }

  ////////////////////////////////////
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map", {
        zoomControl: false,
      }).setView([42.9697569, -83.7477471], 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 26,
        attribution:
          'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);

      L.control.zoom({ position: "bottomright" }).addTo(mapRef.current);
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
      const { stoppageTime, movingTime } =
        calculateStoppageAndMovingTime(deviceLocations);

      const stoppage = stoppageTime;
      const moving = movingTime;

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
        .bindPopup(
          `<b>I am a Device:<b>${device}</b>.<br>
      The Stoppage time is: <b>${stoppage} hours</b>,<br> And the moving time is: <b>${moving} hours</b>`
        )
        .addTo(mapRef.current);

      // vv.snakeIn();
    });
  }, [filteredData]);

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
                <Autocomplete
                  multiple
                  id="combo-box-demo"
                  options={uniqueDeviceIds}
                  sx={{ backgroundColor: "#fafafa" }}
                  onChange={handleDeviceIdChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Device" />
                  )}
                />
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
