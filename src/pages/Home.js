import React from "react";
import Header from "../components/Header";
import Map from "../components/Map";
import TimeTable from "../components/TimeTable";

export default function Home() {
  return (
    <>
      <Header />
      <div className="home-wrapper a">
        <Map />
        <TimeTable />
      </div>
    </>
  );
}
