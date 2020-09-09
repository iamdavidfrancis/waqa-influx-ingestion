import fetch, {Response, RequestInit} from 'node-fetch';

export interface IAirQualityBase {
    color: string;
    description: string;
    index: number;
    pollutant: string;
    pollutantId: number;
    value: number;
}

export interface IAirQuality extends IAirQualityBase {
    datetime?: Date;
    indexes?: Array<IAirQualityBase>;
}

export default class WaqaService {

    public async getCurrentAirQuality(): Promise<IAirQuality> {
        console.log("Fetching most recent data.");
        const response = await WaqaService.fetchData();

        if (response.ok) {
            // Process response
            const payload = await response.json() as Array<any>;

            if (!payload) {
                throw `Unknown response payload: ${JSON.stringify(payload, null, '\t')}`;
            }

            if (payload.length === 0) {
                throw "Empty payload received. No data yet for the day.";
            }

            if (payload[0].StationId !== 190) {
                throw `Invalid StationId: ${payload[0].StationId}`;
            }

            const data = payload[0].data as Array<IAirQuality>;

            const lastItem = data.reduce((last, current) => {
                if (!last) {
                    return current;
                }

                const lastTime = new Date(last.datetime || 0);
                const currTime = new Date(current.datetime || 0);

                return (lastTime > currTime) ? last : current;
            });

            lastItem.indexes = undefined; // Remove this from model.
            lastItem.datetime = lastItem.datetime ? new Date(lastItem.datetime) : new Date();

            return lastItem;
        } else {
            const err = await response.text();
            throw err;
        }
    }

    private static async fetchData(): Promise<Response> {
        const url = "https://enviwa.ecology.wa.gov/report/GetIndexReportData";
        const body = WaqaService.buildRequestBody();

        const options: RequestInit = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"

            },
            body: JSON.stringify(body)
        };

        return await fetch(url, options);
    }

    private static buildRequestBody(): any {
        const body = {} as any;

        const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
        const tomorrowDay = tomorrow.getDate();
        const tomorrowMonth = tomorrow.getMonth() + 1;
        const tomorrowYear = tomorrow.getFullYear();

        const today = new Date();
        const todayDay = today.getDate();
        const todayMonth = today.getMonth() + 1;
        const todayYear = today.getFullYear();

        body.endDate = null;
        body.endDateAbsolute = `${tomorrowMonth}/${tomorrowDay}/${tomorrowYear} 23:00`;
        body.fromTb = 60;
        body.monitorChannelsByStationId = { "190": [2] };
        body["monitorChannelsByStationId[0].Key"] = "190";
        body["monitorChannelsByStationId[0].Value"] = [2];
        body.reportName = "index report";
        body.reportType = "Average";
        body.startDate = null;
        body.startDateAbsolute = `${todayMonth}/${todayDay}/${todayYear} 00:00`;
        body.toTb = 60;

        return body;
    }
}