import {SyncEvent} from 'ts-events/dist/lib/index';

export interface Result<T> {

    value():T;
    success(result:T):void;
    error(result?:T):void;
    isSuccess():boolean;
    isError():boolean;
    onSuccess<T>(callback?:(res:T) => void):Result<T>;
    onError<T>(callback?:(res:T) => void):Result<T>;
}

export class ResultBasic<T> implements Result<T> {

    _value:T = null;
    _success:boolean = false;
    _successEvent = new SyncEvent<T>();
    _errorEvent = new SyncEvent<T>();

    constructor(result?:T, success?:boolean) {
        if (result != null) {
            this._value = result;
        }
        if (success != null) {
            this._success = success;
        }
    }

    public value():T {
        return this._value;
    }

    public success(result:T):void {
        this._value = result;
        this._successEvent.post(this._value);
    }

    public error(result?:T):void {
        this._value = result;
        this._errorEvent.post(this._value);
    }

    public isSuccess():boolean {
        return this._success === true;
    }

    public isError():boolean {
        return this._success === false;
    }

    public onSuccess(callback:(res:T) => void):Result<T> {
        this._successEvent.attach(callback);
        return this;
    }

    public onError(callback:(res:T) => void):Result<T> {
        this._errorEvent.attach(callback);
        return this;
    }

    public toString():string {
        return JSON.stringify(this);
    }
}
