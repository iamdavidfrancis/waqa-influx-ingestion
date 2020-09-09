import WaqaService from './waqa-service';
import InfluxService from './influx-service';

let interval;

class Main {
    public async start() {
        const influxService = new InfluxService();
        const waqaService = new WaqaService();

        const ingestData = async () => {
            try {
                // Right now we only support Bellevue station.
                var airQuality = await waqaService.getCurrentAirQuality();
                await influxService.addDbEntry("Bellevue", airQuality);
            } catch (e) {
                if (typeof(e) === "string") {
                    console.error(e);
                } else {
                    console.error(JSON.stringify(e, null, '\t'));
                }
                
            }
        };

        await ingestData();

        const halfHourMs = 30 * 60 * 1000;
        interval = setInterval(ingestData, halfHourMs);
    }
}

const app = new Main();
    app.start()
        .then(() => console.log("Main start method ended. Interval running."))
        .catch((err) => console.error(`Main start method ended with an error: ${JSON.stringify(err, null, '\t')}`));