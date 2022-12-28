var express = require("express");
var router = express.Router();
var GtfsRealtimeBindings = require("gtfs-realtime-bindings");
var request = require("request");

router.get("/", function (req, res, next) {
  fetch("https://mdotmta-gtfs-rt.s3.amazonaws.com/MARC+RT/marc-vp.pb")
    .then((r1) => r1.arrayBuffer())
    .then((r2) => new Uint8Array(r2))
    .then((r3) => GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(r3))
    .then((r4) => res.send(r4));
});

module.exports = router;
