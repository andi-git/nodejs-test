import {GeoLocation} from "./position";

export class Distance {

    fromLocation:GeoLocation;
    fromAddress:string;
    toLocation:GeoLocation;
    toAddress:string;
    meters:number;
    seconds:number;

    constructor(fromLocation:GeoLocation, fromAddress:string, toLocation:GeoLocation, toAddress:string, meters:number, seconds:number) {
        this.fromLocation = fromLocation;
        this.fromAddress = fromAddress;
        this.toLocation = toLocation;
        this.toAddress = toAddress;
        this.meters = meters;
        this.seconds = seconds;
    }

    public toString():string {
        return JSON.stringify(this);
    }
}