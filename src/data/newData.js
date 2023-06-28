const csvFilePath = "data.csv";
const csv = require("csvtojson");
const fs = require("fs");

// const csv_data = () => {
//   return csv()
//     .fromFile(csvFilePath)
//     .then((jsonObj) => {
//       const newData = jsonObj.map((data) => {
//         const custom_field = data._source.origin.custom_field;
//         const raw_value = data._source.raw_value;
//         const source = data._source;
//         return {
//           custom_field,
//           raw_value,
//           source,
//         };
//       });

//       const jsonData = JSON.stringify(newData);
//       fs.writeFile("output1.json", jsonData, (err) => {
//         if (err) {
//           console.error("Error writing JSON file:", err);
//         } else {
//           console.log("JSON file has been saved.");
//         }
//       });
//     });
// };

// csv_data();

// const csv_data = () => {
//   return csv()
//     .fromFile(csvFilePath)
//     .then((jsonObj) => {
//       const newData = jsonObj.map((data) => {
//         const device_id = data["_source/data/device_id"];
//         const latitude = data["_source/data/latitude"];
//         const longitude = data["_source/data/longitude"];
//         const dateTime = data["_source/date"];
//         return {
//           custom_field: device_id,
//           raw_value: {
//             LATITUDE: latitude,
//             LONGITUDE: longitude,
//           },
//           source: {
//             date: dateTime,
//           },
//         };
//       });

//       const jsonData = JSON.stringify(newData);
//       fs.writeFile("output1.json", jsonData, (err) => {
//         if (err) {
//           console.error("Error writing JSON file:", err);
//         } else {
//           console.log("JSON file has been saved.");
//         }
//       });
//     });
// };

// csv_data();


const csv_data = () => {
    return csv()
      .fromFile(csvFilePath)
      .then((jsonObj) => {
        const newData = jsonObj.map((data) => {
          const device_id = data["_source/data/device_id"];
          const latitude = data["_source/data/latitude"];
          const longitude = data["_source/data/longitude"];
          const dateTime = data["_source/date"];
  
          const raw_value = {};
          if (latitude) {
            raw_value.LATITUDE = latitude;
          }
          if (longitude) {
            raw_value.LONGITUDE = longitude;
          }
  
          return {
            custom_field: device_id,
            raw_value: Object.keys(raw_value).length > 0 ? raw_value : undefined,
            source: {
              date: dateTime,
            },
          };
        });
  
        const jsonData = JSON.stringify(newData);
        fs.writeFile("output1.json", jsonData, (err) => {
          if (err) {
            console.error("Error writing JSON file:", err);
          } else {
            console.log("JSON file has been saved.");
          }
        });
      });
  };



csv_data()
