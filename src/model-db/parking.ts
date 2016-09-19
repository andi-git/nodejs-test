import mongoose = require('mongoose');

export interface Parking extends mongoose.Document {
    parkingId: String,
    user: String,
    date: Date,
    location: {type: [Number], index: '2d'},
    state: String
}

export const ParkingSchema = new mongoose.Schema({
    parkingId: {type:String, required: true},
    user: {type:String, required: true},
    date: {type:Date, required: true},
    location: {type: [Number], index: '2d', required: true},
    state: {type:String, required: true}
});

export const ParkingModel = mongoose.model<Parking>('Parking', ParkingSchema);