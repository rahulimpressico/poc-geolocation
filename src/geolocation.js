import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { data_table } from "./data/data";
import randomColor from "randomcolor";
import axios from "axios";
import { ZoomControl } from "react-leaflet";
import "leaflet.polyline.snakeanim";

export const Geo = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [deviceId, setDeviceId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const mapRef = useRef(null);

  const handleDeviceIdChange = (e) => {
    setDeviceId(e.target.value);
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

  const handleSubmit = (event) => {
    event.preventDefault();

    const filteredLocations = data_table.filter((data) => {
      const withinDateRange =
        (!startDate || new Date(data.date) >= new Date(startDate)) &&
        (!endDate || new Date(data.date) <= new Date(endDate));
      const matchingDeviceId = !deviceId || data.device_id == deviceId;
      return withinDateRange && matchingDeviceId;
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
    window.location.reload();
  };

  const getData = async () => {
    try {
      // const response = await axios.get("http://172.20.31.46/locations");
      const data = data_table;

      const filteredData = data.map((obj) => {
        const { id, ...filteredObj } = obj;
        return { ...filteredObj };
      });

      const sortedData = filteredData.sort((a, b) => {
        if (a.device_id !== b.device_id) {
          return a.device_id - b.device_id;
        }

        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        const timeA = dateA.getTime();
        const timeB = dateB.getTime();
        return timeA - timeB && dateA - dateB;
      });

      setFilteredData(sortedData);
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
      }).setView([28.594766, 77.317355], 17);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
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

    devices.forEach((device, index) => {
      const deviceLocations = filteredData.filter(
        (data) => data.device_id === device
      );

      const coordinates = deviceLocations.map((dataPoint) => [
        dataPoint.latitude,
        dataPoint.longitude,
      ]);

      // const color = "#3A81F1";
      const color = getRandomColor();

      L.polyline(
        coordinates,
        { color, weight: 10, smoothFactor: 1 },
        { snakingSpeed: 200 }
      )
        .addTo(mapRef.current)
        .snakeIn();
      const markerColors = [
        // "red",
        "blue",
        // "green",
        // "yellow",
        // "purple",
        // "orange",
      ];

      // const startMarker = L.circleMarker(coordinates[0], {
      //   color: "#2DBEFF",
      //   fillColor: "#2DBEFF",
      //   fillOpacity: 1,
      //   radius: 4,
      // }).addTo(mapRef.current);
      const endMarker = L.marker(coordinates[coordinates.length - 1], {
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
    });
  }, [filteredData]);

  const uniqueDeviceIds = [];
  filteredData.forEach((data) => {
    const device_id = data.device_id;

    if (!uniqueDeviceIds.includes(device_id)) {
      uniqueDeviceIds.push(device_id);
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
                <a class="navbar-brand fw-bold" href="#">
                  <img
                    src="geo.png"
                    alt="Logo"
                    width="30"
                    height="38"
                    class="d-inline-block"
                  />
                  <span className="h5  fw-bold">GeoLocation Tracker</span>
                </a>
              </div>
            </nav>
          </div>
          <br />
          <div className="row mx-1">
            <div className="col-md-3" style={{ zIndex: "9999" }}>
              <>
                {" "}
                <label className="form-label fw-bold fs-6">Device ID</label>
                <select
                  className="form-select shadow-lg"
                  aria-label="Default select example"
                  onChange={handleDeviceIdChange}
                  value={deviceId}
                >
                  <option selected>Select your Device </option>
                  {uniqueDeviceIds.map((device_id, index) => {
                    return (
                      <>
                        <option value={device_id}>{device_id}</option>
                      </>
                    );
                  })}
                </select>
              </>
            </div>
            <div className="col-md-3" style={{ zIndex: "9999" }}>
              {" "}
              <label className="form-label fs-6 fw-bold">Start Date</label>
              <input
                type="date"
                className="form-control shadow-lg"
                id="start_date"
                onChange={handleStartDateChange}
                value={startDate}
              />
            </div>
            <div className="col-md-3" style={{ zIndex: "9999" }}>
              <label className="form-label fw-bold fs-6">End Date</label>
              <input
                type="date"
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
