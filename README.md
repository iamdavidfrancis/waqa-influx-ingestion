# waqa-influx-ingestion

A tool to fetch the latest AQI numbers from the WA Dept of Ecology site:
https://enviwa.ecology.wa.gov/Report/StationsIndexReport

# Usage

You need to already have an influxdb instance running with a database made.

Pull the image with:
```
docker pull iamdavidfrancis/waqa-influx-ingestion
```

The image requires several environment variables to work:

`INFLUX_HOST`: The IP address or hostname of the InfluxDb Instance   
`INFLUX_DATABASE`: The name of the database to send the data.   
`INFLUX_USER`: The username for the influxdb instance.   
`INFLUX_PASSWORD`: The password for the influxdb user.

# Known Issues

None as of this commit. Please see GitHub issues for anything new.


# TODO
* Add Influx port to environment variables.
* Add UTs
