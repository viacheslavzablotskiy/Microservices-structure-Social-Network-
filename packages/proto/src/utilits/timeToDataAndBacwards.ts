import { TimeStamp } from "@repo/static-data";

export function convertDateToTimeStamp(date: Date): TimeStamp {
    const millis = date.getTime();
    return {
        seconds: Math.floor(millis / 1000),
        nanos: (millis % 1000) * 1e6, 
    }
}

export function convertTimeStampToDate(ts: TimeStamp): Date {
    return new Date(ts.seconds * 1000 + ts.nanos / 1e6)
}