import {ReplaySubject} from "@reactivex/rxjs";

export interface Result<T> {

    value(): T;
    success(result: T): void;
    error(result?: any): void;
    isSuccess(): boolean;
    isError(): boolean;
    onSuccess<T>(callback?: (res: T) => void): Result<T>;
    onError<T>(callback?: (res: T) => void): Result<T>;
}

export class ResultBasic<T> implements Result<T> {

    _value: T = null;
    _err: any = null;
    _success: boolean = false;
    _successSubject = new ReplaySubject(1);
    _errorSubject = new ReplaySubject(1);

    public value(): T {
        return this._value;
    }

    public success(result: T): void {
        this._value = result;
        this._successSubject.next(this._value);
    }

    public error(err?: T): void {
        this._err = err;
        this._errorSubject.next(this._err);
    }

    public isSuccess(): boolean {
        return this._success === true;
    }

    public isError(): boolean {
        return this._success === false;
    }

    public onSuccess(callback: (res: T) => void): Result<T> {
        this._successSubject.subscribe(callback);
        return this;
    }

    public onError(callback: (res: T) => void): Result<T> {
        this._errorSubject.subscribe(callback);
        return this;
    }

    public toString(): string {
        return JSON.stringify(this);
    }
}