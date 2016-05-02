export class GeoLocation {

    latitude:number;
    longitude:number;

    constructor(latitude:number, longitude:number) {
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public toString():string {
        return JSON.stringify(this);
    }
}