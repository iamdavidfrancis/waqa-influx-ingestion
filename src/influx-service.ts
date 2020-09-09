import * as Influx from 'influx';

import { IAirQuality } from './waqa-service'

export default class InfluxService {
    private measurement =  'airQuality';
    private influx: Influx.InfluxDB;

    constructor() {
        if (!process.env.INFLUX_HOST) {
            throw "Missing InfluxDb Host";
        }
        if (!process.env.INFLUX_DATABASE) {
            throw "Missing InfluxDb Database";
        }
        if (!process.env.INFLUX_USER) {
            throw "Missing InfluxDb Username";
        }
        if (!process.env.INFLUX_PASSWORD) {
            throw "Missing InfluxDb Password";
        }

        const config: Influx.ISingleHostConfig = {
            host: process.env.INFLUX_HOST,
            database: process.env.INFLUX_DATABASE,
            username: process.env.INFLUX_USER,
            password: process.env.INFLUX_PASSWORD,
            schema: [
                {
                    measurement: this.measurement,
                    fields: {
                        color: Influx.FieldType.STRING,
                        description: Influx.FieldType.STRING,
                        index: Influx.FieldType.FLOAT,
                        pollutant: Influx.FieldType.STRING,
                        pollutantId: Influx.FieldType.INTEGER,
                        value: Influx.FieldType.FLOAT,
                       //  uv_led_fan: Influx.FieldType.INTEGER
                    },
                    tags: [
                        'station'
                    ]
                }
            ]
        };
    
        this.influx = new Influx.InfluxDB(config);
    }

    public async addDbEntry(station: string, item: IAirQuality): Promise<void> {
        if (!this.influx) {
            throw "DB not Initialized";
        }

        const timestamp = item.datetime || new Date();

        console.log(`Writing data to influx. Timestamp: ${timestamp.toISOString()}. Index: ${item.index}`);

        try {
            await this.influx.writePoints([
                {
                    measurement: this.measurement,
                    tags: {
                        station
                    },
                    timestamp,
                    fields: {
                        color: item.color,
                        description: item.description,
                        index: item.index,
                        pollutant: item.pollutant,
                        pollutantId: item.pollutantId,
                        value: item.value,
                    }
                }
            ]);
        } catch (e) {
            console.error(JSON.stringify(e, null, '\t'));
        }
    }
}