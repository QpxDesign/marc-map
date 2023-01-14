import React, { useEffect, useState, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { FaTrain } from "react-icons/fa";
import StopData from "../assets/StopData.json";
import PennLine from "../assets/LineData/Penn.json";
import Brunswick from "../assets/LineData/Brunswick.json";
import FredrickBranch from "../assets/LineData/FredrickBranch.json";
import Camden from "../assets/LineData/Camden.json";
import RouteData from "../assets/RouteData.json";

mapboxgl.accessToken =
  "pk.eyJ1IjoicXB4ZGVzaWduIiwiYSI6ImNreHJrMHc3djRtNzIyb29rODhidHd5d2oifQ.HHiNG99FXsJ_GPIO1eFk1w";

export default function Map() {
  const [trains, setTrains] = useState([]);
  const [stops, setStops] = useState([]);

  const [res, setRes] = useState([]);
  const [tripUpdatesRes, setTripUpdatesRes] = useState([]);
  // map params
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-77.0369);
  const [lat, setLat] = useState(38.9072);
  const [zoom, setZoom] = useState(9);
  useEffect(() => {
    const interval = setInterval(() => {
      getData();
      getTripUpdatesData();
    }, 15_000);

    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    getData();
    getTripUpdatesData();
  }, []);
  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12?optimize=true",
      center: [lng, lat],
      zoom: zoom,
    });
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      })
    );
    map.current.addControl(new mapboxgl.NavigationControl());
  });
  async function getData() {
    fetch("https://api.marcmap.app/mtaAPI")
      .then((r) => r.json())
      .then((r2) =>
        r2.entity !== undefined && !deepEqual(r2, res) ? setRes(r2) : null
      )
      .catch((err) => err);
  }
  async function getTripUpdatesData() {
    fetch("https://marc-api-production.up.railway.app/TripUpdatesAPI")
      .then((r) => r.json())
      .then((r2) =>
        r2.entity !== undefined && !deepEqual(tripUpdatesRes, r2)
          ? setTripUpdatesRes(r2)
          : null
      )
      .catch((err) => err);
  }
  function deepEqual(x, y) {
    const ok = Object.keys,
      tx = typeof x,
      ty = typeof y;
    return x && y && tx === "object" && tx === ty
      ? ok(x).length === ok(y).length &&
          ok(x).every((key) => deepEqual(x[key], y[key]))
      : x === y;
  }
  function FindFinalStop(tripId) {
    try {
      return StopData.find(
        (stop) =>
          stop.stop_id ==
          tripUpdatesRes.entity
            .find(
              (trip) =>
                trip.tripUpdate !== undefined &&
                trip.tripUpdate.trip.tripId == tripId
            )
            .tripUpdate.stopTimeUpdate.at(-1).stopId
      ).stop_name;
    } catch (e) {
      return "error";
    }
  }
  function findDelayTime(tripId) {
    try {
      const delay = Math.abs(
        Math.round(
          tripUpdatesRes.entity
            .filter((trip) => trip.tripUpdate.trip.tripId === tripId)[0]
            .tripUpdate.stopTimeUpdate.at(-1).arrival.delay / 60
        )
      );
      const TimeMessage =
        tripUpdatesRes.entity
          .filter((trip) => trip.tripUpdate.trip.tripId === tripId)[0]
          .tripUpdate.stopTimeUpdate.at(-1).arrival.delay >= 0
          ? " Early"
          : " Late";
      return delay + " Minutes" + TimeMessage;
    } catch (e) {
      return "error";
    }
  }

  // populate maps with stop and line data
  function toTitleCase(str) {
    return str;
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  function formatTime(s) {
    const dtFormat = new Intl.DateTimeFormat("en-US", {
      timeStyle: "short",
      timeZone: "America/New_York",
    });

    return dtFormat.format(new Date(s * 1e3));
  }
  function CustomFilter(tripId) {
    if (tripUpdatesRes.entity[0].tripUpdate === undefined) {
      return "error";
    }
    var stopObject = {};
    try {
      var stopObject = tripUpdatesRes.entity.find(
        (e) => e.tripUpdate.trip.tripId === tripId
      ).tripUpdate.stopTimeUpdate;
      if (stopObject === undefined) return "error";
    } catch (e) {
      return "error";
    }
    for (var index = 0; index < stopObject.length; index++) {
      const timestamp = tripUpdatesRes.header.timestamp;
      if (
        stopObject.at(index).departure !== undefined &&
        stopObject.at(index).arrival !== undefined &&
        index !== stopObject.length - 1
      ) {
        if (
          stopObject.at(index).departure.time +
            stopObject.at(index).departure.delay <=
            timestamp &&
          stopObject.at(index + 1).arrival.time +
            stopObject.at(index + 1).arrival.delay >=
            timestamp
        ) {
          return stopObject.at(index + 1);
        }
      }
    }

    return "404";
  }
  // add trains to map to map
  useEffect(() => {
    if (
      res.length !== 0 &&
      res.entity !== undefined &&
      res !== null &&
      tripUpdatesRes.entity !== undefined
    ) {
      res.entity.map((train) => {
        const latitude = train.vehicle.position.latitude;
        const longitude = train.vehicle.position.longitude;
        const icon = document.createElement("div");
        var result = trains.find(
          (marker) => marker.id === train.vehicle.trip.tripId
        );

        if (result !== undefined && result.length !== 0) {
          result.marker.setLngLat([longitude, latitude]);
          result.marker.setRotation(train.vehicle.position.bearing);
        } else {
          setTrains((current) => [...current, train.vehicle.trip.tripId]);
          icon.className = "marker-icon";
          if (mapboxgl.Marker)
            var marker = new mapboxgl.Marker({
              rotation: train.vehicle.position.bearing,
              element: icon,
            })
              .setLngLat([longitude, latitude])
              .setPopup(
                new mapboxgl.Popup({
                  offset: 25,
                }) // add popups
                  .setHTML(
                    `<div class="trainPopup">
                <h3>${train.vehicle.trip.tripId
                  .replace("Train", "Train ")
                  .replace("Saturday", " Saturday")
                  .replace("Sunday", " Sunday")}</h3>
                   <h4>Next Stop: ${
                     CustomFilter(train.vehicle.trip.tripId) !== "error" &&
                     CustomFilter(train.vehicle.trip.tripId) !== "404"
                       ? StopData.filter(
                           (stop) =>
                             stop.stop_id ==
                             CustomFilter(train.vehicle.trip.tripId).stopId
                         )[0].stop_name
                       : "n/a"
                   }</h4>
                     <h4>Arriving at: ${
                       CustomFilter(train.vehicle.trip.tripId) !== "error" &&
                       CustomFilter(train.vehicle.trip.tripId) !== "404" &&
                       CustomFilter(train.vehicle.trip.tripId).arrival !==
                         undefined
                         ? formatTime(
                             CustomFilter(train.vehicle.trip.tripId).arrival
                               .time
                           )
                         : "n/a"
                     }
                <h4>Final Stop: ${FindFinalStop(train.vehicle.trip.tripId)}</h4>
                  <h4>Currently: ${findDelayTime(
                    train.vehicle.trip.tripId
                  )}</h4>
                  <span class="last-updated" style="margin-left:auto">Last Updated: ${formatTime(
                    tripUpdatesRes.header.timestamp
                  )}</span>
                </div>
                `
                  )
              )
              .addTo(map.current);
          setTrains((current) => [
            ...current,
            {
              id: train.vehicle.trip.tripId,
              marker,
            },
          ]);
        }
      });
    }
  }, [res]);
  function helper(obj, stop_id) {
    for (var i = 0; i < obj.length; i++) {
      if (obj[i].stopId == stop_id) {
        if (obj[i].departure !== undefined) {
          return formatTime(obj[i].departure.time);
        }
      }
    }
    return "error";
  }
  function getTrainsFromStationId(stop_id) {
    // find results
    var results = [];
    if (tripUpdatesRes.entity === undefined) {
      return "";
    }
    for (var i = 0; i < tripUpdatesRes.entity.length; i++) {
      for (
        var i2 = 0;
        i2 < tripUpdatesRes.entity[i].tripUpdate.stopTimeUpdate.length;
        i2++
      ) {
        if (
          tripUpdatesRes.entity[i].tripUpdate.stopTimeUpdate[i2].stopId ==
            stop_id &&
          tripUpdatesRes.entity[i].tripUpdate.stopTimeUpdate[i2].departure !==
            undefined &&
          tripUpdatesRes.entity[i].tripUpdate.stopTimeUpdate[i2].departure
            .time >
            Date.now() / 1000
        ) {
          results.push(tripUpdatesRes.entity[i]);
        }
      }
    }
    //display results
    var results_display = "";
    results.forEach((r, index) => {
      results_display += `<h2>${r.tripUpdate.trip.tripId} • ${
        RouteData.filter((route) => route.id == r.tripUpdate.trip.routeId)[0]
          .route_name
      } Line • ${
        r.tripUpdate.stopTimeUpdate !== undefined
          ? StopData.find(
              (s) => s.stop_id == r.tripUpdate.stopTimeUpdate.at(-1).stopId
            ).stop_name
          : ""
      } • Arriving At ${helper(r.tripUpdate.stopTimeUpdate, stop_id)}</h2>`;
    });
    if (results_display !== "") {
      return results_display
        .replaceAll("Train", "Train ")
        .replaceAll("Saturday", " Saturday")
        .replaceAll("Sunday", " Sunday");
    }

    return "No Train Is Currently On Its Way to this Station";
  }
  useEffect(() => {
    StopData.map((stop) => {
      const latitude = stop.stop_lat;
      const longitude = stop.stop_lon;
      var marker = new mapboxgl.Marker({
        color: "#004D93",
      })
        .setLngLat([longitude, latitude])
        .setPopup(
          new mapboxgl.Popup({
            offset: 25,
          }) // add popups
            .setHTML(
              `<div class="stopPopup"><h1 class="stopName">${toTitleCase(
                stop.stop_name
              )}</h1>
              </div>`
            )
        )
        .addTo(map.current);
      setStops((current) => [
        ...current,
        {
          id: stop.stop_id,
          marker,
        },
      ]);
    });
  }, []);
  useEffect(() => {
    for (var i = 0; i < stops.length; i++) {
      stops[i].marker._popup
        .setHTML(`<div class="stopPopup"><h1 class="stopName">${toTitleCase(
        StopData.find((s) => s.stop_id == stops[i].id).stop_name
      )}</h1>
              <h2>${getTrainsFromStationId(stops[i].id)}</h2>
              </div>`);
    }
  }, [tripUpdatesRes]);

  useEffect(() => {
    // generate coordinates
    var penn_coordinates = [];
    var brunswick_coordinates = [];
    var camden_coordinates = [];
    var fredrick_coordinates = [];
    PennLine.forEach((element, index) => {
      var tmp = [element.shape_pt_lon, element.shape_pt_lat];
      penn_coordinates.push(tmp);
    });
    Brunswick.forEach((element, index) => {
      var tmp = [element.shape_pt_lon, element.shape_pt_lat];
      brunswick_coordinates.push(tmp);
    });
    Camden.forEach((element, index) => {
      var tmp = [element.shape_pt_lon, element.shape_pt_lat];
      camden_coordinates.push(tmp);
    });
    FredrickBranch.forEach((element, index) => {
      var tmp = [element.shape_pt_lon, element.shape_pt_lat];
      fredrick_coordinates.push(tmp);
    });
    map.current.on("load", () => {
      // penn
      if (!map.current.getLayer("penn")) {
        map.current.addSource("penn", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: penn_coordinates,
            },
          },
        });
      }
      if (!map.current.getLayer("camden")) {
        map.current.addSource("camden", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: camden_coordinates,
            },
          },
        });
      }
      if (!map.current.getLayer("brunswick")) {
        map.current.addSource("brunswick", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: brunswick_coordinates,
            },
          },
        });
      }
      if (!map.current.getLayer("fredrick")) {
        map.current.addSource("fredrick", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: fredrick_coordinates,
            },
          },
        });
      }
      if (!map.current.getLayer("penn")) {
        map.current.addLayer({
          id: "penn",
          type: "line",
          source: "penn",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#D82A38",
            "line-width": 8,
          },
        });
      }
      if (!map.current.getLayer("camden")) {
        map.current.addLayer({
          id: "camden",
          type: "line",
          source: "camden",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#FF5624",
            "line-width": 8,
          },
        });
      }
      if (!map.current.getLayer("brunswick")) {
        map.current.addLayer({
          id: "brunswick",
          type: "line",
          source: "brunswick",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#F0AC1D",
            "line-width": 8,
          },
        });
      }
      if (!map.current.getLayer("fredrick")) {
        map.current.addLayer({
          id: "fredrick",
          type: "line",
          source: "fredrick",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#F0AC1D",
            "line-width": 8,
          },
        });
      }
    });
  }, []);
  return <div className="map-container" ref={mapContainer} />;
}
