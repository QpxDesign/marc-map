import React, { useEffect, useState } from "react";

export default function TimeTable() {
  const [res, setRes] = useState([]);

  useEffect(() => {
    fetch("http://localhost:9000/tripUpdatesAPI")
      .then((r) => r.json())
      .then((r2) => setRes(r2))
      .then((r3) => console.log(r3));
    console.log(res);
  }, []);
  return (
    <div className="timetable-wrapper">
      <h1>Timetable</h1>
      {res.entity !== undefined
        ? res.entity.map((e) => {
            <div className="timetable-item">
              <div className="status-light" />
              <h2></h2>
            </div>;
          })
        : null}

      <div></div>
    </div>
  );
}
