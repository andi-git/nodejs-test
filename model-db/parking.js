"use strict";
var mongoose = require("mongoose");
exports.ParkingSchema = new mongoose.Schema({
    parkingId: { type: String, required: true },
    user: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: [Number], index: '2d', required: true },
    state: { type: String, required: true }
});
exports.ParkingModel = mongoose.model('Parking', exports.ParkingSchema);
//# sourceMappingURL=parking.js.map