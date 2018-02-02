import Logger from '../../common/logger';
import Moment from 'moment-timezone';
import Request from 'request-promise-native';
import _ from 'lodash';

class DataService {
    all(format, queryParams) {
        return new Promise(function(resolve, reject){

            let start = Moment(queryParams.start, ['YYYYMMDDhhmmss', 'YYYYMMDD']),
                end = Moment(queryParams.end, ['YYYYMMDDhhmmss', 'YYYYMMDD']),
                longitude = queryParams.longitude,
                latitude = queryParams.latitude,
                radius = queryParams.radius,
                longitude1 = queryParams.longitude1,
                latitude1 = queryParams.latitude1,
                longitude2 = queryParams.longitude2,
                latitude2 = queryParams.latitude2,
                type = queryParams.type,
                variable = queryParams.variable,
                dataFormat = null;

            switch(format){
                case 'application/json':
                    dataFormat = 'json';
                    break;
                case 'text/csv':
                    dataFormat = 'csv';
                    break;
                default:
                    reject(new TypeError('Invalid accept header. Must be either JSON or CSV'));
                    break;
            }

            let options = {
                uri: process.env.UO_URL + 'sensors/data/raw.' + dataFormat,
                qs: {
                    api_key: process.env.UO_KEY,
                },
                json: true
            };

            if(start.isValid()){
                options.qs['start_time'] = start.format('YYYYMMDDhhmmss');
            }
            else {
                reject(new TypeError('Start date is invalid'));
            }

            if(end.isValid()){
                options.qs['end_time'] = end.format('YYYYMMDDhhmmss');
            }
            else {
                reject(new TypeError('End date is invalid'));
            }

            if(longitude && latitude && radius){
                if(isNan(longitude) || isNan(latitude) || isNan(radius)){
                    reject(new TypeError('Longitude, latitude and radius must be numeric'));
                }
                else {
                    options.qs.buffer = longitude + ',' + latitude + ',' + radius;
                }
            }

            if(longitude1 && latitude1 && longitude2 && latitude2){
                if(isNan(longitude1) || isNan(latitude1) || isNan(longitude2) || isNan(latitude2)){
                    reject(new TypeError('Longitudes and latitudes must be numeric'));
                }
                else {
                    delete options.qs.buffer;
                    options.qs.bbox = longitude1 + ',' + latitude1 + ',' + longitude2 + ',' + latitude2;
                }
            }

            if(type){
                if(!type instanceof Array){
                    reject(new TypeError('Sensor types must be an array'));
                }
                else {
                    options.qs.sensor_type = type.toString().replace(',', '-and-');
                }
            }

            if(variable){
                if(!variable instanceof Arra){
                    reject(new TypeError('Variables must be an array'));
                }
                else {
                    options.qs.variable = variable.toString().replace(',', '-and-');
                }
            }

            Request(options).then(function (data) {
                let formattedData = [];
                data.forEach(function(sensor){
                    Object.keys(sensor.data).forEach(function(key){
                        Object.keys(sensor.data[key].data).forEach(function(timestamp){
                            formattedData.push({
                                sensor: sensor.name,
                                type: sensor.type,
                                theme: sensor.data[key].meta.theme,
                                geom: sensor.geom,
                                measurement: key,
                                units: sensor.data[key].meta.units,
                                timestamp: Moment(timestamp).tz('Europe/London').toDate(),
                                reading: sensor.data[key].data[timestamp]
                            });
                        });
                    });
                });
                resolve(_.sortBy(formattedData, ['timestamp', 'sensor']));
            }).catch(function (err) {
                Logger.warn(err);
                reject(err);
            });
        });
    }

    byId(format, id, queryParams) {
        return new Promise(function(resolve, reject){

            let start = Moment(queryParams.start, ['YYYYMMDDhhmmss', 'YYYYMMDD']),
                end = Moment(queryParams.end, ['YYYYMMDDhhmmss', 'YYYYMMDD']),
                variable = queryParams.variable,
                dataFormat = null;

            switch(format){
                case 'application/json':
                    dataFormat = 'json';
                    break;
                case 'text/csv':
                    dataFormat = 'csv';
                    break;
                default:
                    reject(new TypeError('Invalid accept header. Must be either JSON or CSV'));
                    break;
            }

            let options = {
                uri: process.env.UO_URL + 'sensor/data/raw.' + dataFormat,
                qs: {
                    api_key: process.env.UO_KEY,
                    sensor_name: id
                },
                json: true
            };

            if(start.isValid()){
                options.qs['start_time'] = start.format('YYYYMMDDhhmmss');
            }
            else {
                reject(new TypeError('Start date is invalid'));
            }

            if(end.isValid()){
                options.qs['end_time'] = end.format('YYYYMMDDhhmmss');
            }
            else {
                reject(new TypeError('End date is invalid'));
            }

            if(variable){
                if(!variable instanceof Arra){
                    reject(new TypeError('Variables must be an array'));
                }
                else {
                    options.qs.variable = variable.toString().replace(',', '-and-');
                }
            }

            Request(options).then(function (sensor) {
                let formattedData = [];
                sensor = sensor['0'];
                Object.keys(sensor.data).forEach(function(key){
                    Object.keys(sensor.data[key].data).forEach(function(timestamp){
                        formattedData.push({
                            sensor: sensor.name,
                            type: sensor.type,
                            theme: sensor.data[key].meta.theme,
                            geom: sensor.geom,
                            measurement: key,
                            units: sensor.data[key].meta.units,
                            timestamp: Moment(timestamp).tz('Europe/London').toDate(),
                            reading: sensor.data[key].data[timestamp]
                        });
                    });
                });
                resolve(_.sortBy(formattedData, ['timestamp', 'sensor']));
            }).catch(function (err) {
                Logger.warn(err);
                reject(err);
            });
        });
    }
}

export default new DataService();
