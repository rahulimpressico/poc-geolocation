import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { data_table } from "./data/data";
// import randomColor from "randomcolor";
// import axios from "axios";

export const Geo = () => {
  const [filteredData, setFilteredData] = useState(data_table);
  const [deviceId, setDeviceId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const mapRef = useRef(null);

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
  //   console.log(filteredData);

  //   const getData = async () => {
  //     try {
  //       const response = await axios.get("http://172.20.31.46:3000/locations");
  //       const data = response.data;

  //       console.log(data);
  //       setFilteredData(data);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([28.594766, 77.317355], 16);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);
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

      const color = "#3A81F1";

      L.polyline(coordinates, { color, weight: 6 }).addTo(mapRef.current);
      const markerColors = [
        "red",
        "blue",
        "green",
        "yellow",
        "green",
        "purple",
      ];

      // const startMarker = L.circleMarker(coordinates[0], {
      //   color: "#2DBEFF",
      //   fillColor: "#2DBEFF",
      //   fillOpacity: 1,
      //   radius: 4,
      // }).addTo(mapRef.current);
      const endMarker = L.marker(coordinates[coordinates.length - 1], {
        icon: L.icon({
          iconUrl: `https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${markerColors[index]}.png`,
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

  const handleDeviceIdChange = (e) => {
    setDeviceId(e.target.value);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  // const getRandomColor = () => {
  //   const randomcolor = randomColor({
  //     luminosity: "dark",
  //   });
  //   return randomcolor;
  // };
  // console.log(deviceId);
  return (
    <>
      <div className="container-fluid">
        <div className="row">
          <nav
            className="navbar navbar-light bg-light"
            style={{ height: "72px" }}
          >
            <div className="container-fluid">
              <span className="navbar-brand mb-0 h1 fw-bold">
                GeoLocation Tracker
              </span>
            </div>
          </nav>
        </div>
        <br />
        <div className="row mx-1">
          <div className="col-md-3">
            {" "}
            <label className="form-label">Device ID</label>
            <select
              class="form-select"
              aria-label="Default select example"
              onChange={handleDeviceIdChange}
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
          </div>
          <div className="col-md-3">
            {" "}
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="date form-control"
              id="start_date"
              onChange={handleStartDateChange}
              value={startDate}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">End Date</label>
            <input
              type="date"
              className=" date form-control"
              id="end_date"
              onChange={handleEndDateChange}
              value={endDate}
            />
          </div>
          <div className="col-md-3" style={{ paddingTop: "7px" }}>
            {(deviceId && startDate && endDate && (
              <button
                type="submit"
                className="btn btn-outline-success my-4 float-start"
                onClick={handleSubmit}
              >
                Submit
              </button>
            )) || (
              <button
                type="submit"
                disabled
                className="btn btn-outline-success my-4 float-start"
                onClick={handleSubmit}
              >
                Submit
              </button>
            )}
          </div>
        </div>
        <br />
        <br />
        <div className="alert alert-info text-center" role="alert">
          Location of your Device's
        </div>

        <div className="row">
          <div
            className="card-body"
            style={{
              marginTop: "6px",
              width: "100%",
              height: "820px",
              overflowX: "hidden",
              overflowY: "auto",
              textAlign: "center",
              padding: "20px",
            }}
          >
            <div
              id="map"
              style={{ width: "100%", height: "728px", border: "0px" }}
            ></div>
          </div>
        </div>
      </div>
    </>
  );
};
