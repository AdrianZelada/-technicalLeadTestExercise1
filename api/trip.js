
let parentRouter=require('../core/parent.router');
let Trip= require('../schemas/trip');
const axios = require('axios');

class TripRoute extends parentRouter{

    get routes(){
        return{
            'POST /v1'  : 'createByReadings',
            'GET /v1'   : 'getWithFilter'
        }
    }

    constructor(router,db){
        super(router, Trip(db))
    }

    getWithFilter(req, res){
        let params = req.query;
        if( params.start_gte == null || params.start_lte == null || params.distance_gte == null){
            res.statusCode = 422;
            res.json(this._buildMessageError("Invalid", `Missing params`));
        }

        let query = this.Model.find({
            'start.time': {
                $gte: params.start_gte,
                $lte: params.start_lte,
            },
            distance: {
                $gte: params.distance_gte,
            }
        });

        params.offset = params.offset != null ? params.offset : 0;
        params.limit = params.limit != null ? params.limit : 10;
        query
        .skip(params.offset)
        .limit(params.limit)
        .then((response) => {
            res.json({
                trips: response
            })
        }).catch((e) =>{
            res.statusCode = 422;
            res.json(this._buildMessageError("Error", `Error in the process`));
        });
    }

    async createByReadings(req, res) {
        let newTrip = {};
        const limit = 5;
        const readings = req.body.readings;

        if(!this._validateNumberReadings(readings, limit)){
            res.statusCode = 422;
            res.json(this._buildMessageError("Invalid Readings", `The number of readings must be greater than ${limit}`));
        }

        if(!this._validatePropertyTime(readings)){
            res.statusCode = 422;
            res.json(this._buildMessageError("Invalid Readings", `Do not have the property of time`));
        }
        const sortReadings = readings.sort( (item1, item2) => {
            return item1.time - item2.time;
        });
 
        newTrip.start = {
            time: sortReadings[0].time,
            lat: sortReadings[0].location.lat,
            lon: sortReadings[0].location.lon
        }
        const addressStart = await this._getAddress(newTrip.start.lat, newTrip.start.lon);
        newTrip.start.address = addressStart.data.display_name;

        newTrip.end = {
            time: sortReadings[sortReadings.length-1].time,
            lat: sortReadings[sortReadings.length-1].location.lat,
            lon: sortReadings[sortReadings.length-1].location.lon,
        }

        const addressEnd = await this._getAddress(newTrip.end.lat, newTrip.end.lon);
        newTrip.end.address = addressEnd.data.display_name;

        newTrip.duration = sortReadings[sortReadings.length-1].time - sortReadings[0].time;


        const mapDistance = sortReadings.reduce((result, val) => {
            if(result.point == null) {
                result.point = {
                    lat : val.location.lat,
                    lon : val.location.lon
                }
            } else {
               result.distance += this._distenceBetweenTwoPointsInKm(result.point.lat, result.point.lon, val.location.lat, val.location.lon);
               result.point = {
                lat : val.location.lat,
                lon : val.location.lon
                }
            }
            return result
        },{ distance :0 , point: null});

        newTrip.distance = mapDistance.distance;
        let overspeed = sortReadings.reduce((result, val) => {
            if(result.previous != null) {
                if(val.speed>= val.speedLimit) {
                    if(result.previous.speed < result.previous.speedLimit){
                        result.count++;
                    }
                }
            }
            result.previous = {speedLimit : val.speedLimit, speed:val.speed};
            return result
        },{ count: 0, previous: null});
        newTrip.overspeedsCount = overspeed.count;
        this.Model.create(newTrip,(err, data) => {
            return res.json(data)
        });
    }

    _validateNumberReadings(readings , limit){
        return readings.length >= limit;
    }

    _validatePropertyTime(readings) {
        return readings.reduce((result, val) => {
            return result && val.time != null; 
        }, true);
    }
     
    _buildMessageError(title, message){
        return {
            "error": {
              "statusCode": 0,
              "errorCode": 0,
              "srcMessage": title,
              "translatedMessage": message
            }
          }
    }

    _distenceBetweenTwoPointsInKm(lat1, lon1, lat2, lon2){
        const R = 6371; // km
        const dLat = (lat2-lat1) ;
        const dLon = (lon2-lon1) ;
    
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    async _getAddress(lat, lon){
        return await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
    }
}

module.exports = TripRoute;