import Logger from '../../common/logger';
import Request from 'request-promise-native';

class SensorsService {
  all(format, queryParams) {
      return new Promise(function(resolve, reject){

          let longitude = queryParams.longitude,
              latitude = queryParams.latitude,
              radius = queryParams.radius,
              longitude1 = queryParams.longitude1,
              latitude1 = queryParams.latitude1,
              longitude2 = queryParams.longitude2,
              latitude2 = queryParams.latitude2,
              type = queryParams.type,
              variable = queryParams.variable,
              lastRecord = queryParams.lastRecord,
              dataFormat = null;

          switch(format){
              case 'application/json':
                  dataFormat = 'json';
                  break;
              case 'application/geo+json':
                  dataFormat = 'geojson';
                  break;
              case 'text/csv':
                  dataFormat = 'csv';
                  break;
              default:
                  reject(new TypeError('Invalid accept header. Must be either JSON, GeoJSON or CSV'));
                  break;
          }

          let options = {
              uri: process.env.UO_URL + 'sensors.' + dataFormat,
              qs: {
                  api_key: process.env.UO_KEY
              },
              json: true
          };

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

          if(lastRecord){
              options.qs.lastRecord = lastRecord;
          }

          Request(options).then(function (sensors) {

              Logger.info(sensors);

              resolve(sensors);
          }).catch(function (err) {
              Logger.warn(err);
              reject(err);
          });
      });
  }

  byId(format, id) {
      return new Promise(function(resolve, reject){

          let dataFormat = null;

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
              uri: process.env.UO_URL + 'sensor.' + dataFormat,
              qs: {
                  api_key: process.env.UO_KEY,
                  sensor_name: id
              },
              json: true
          };

          Request(options).then(function (sensor) {

              Logger.info(sensor);

              resolve(sensor);
          }).catch(function (err) {
              Logger.warn(err);
              reject(err);
          });
      });
  }
}

export default new SensorsService();
