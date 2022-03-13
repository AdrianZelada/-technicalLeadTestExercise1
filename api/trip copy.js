
let parentRouter=require('../core/parent.router');
let User= require('../schemas/users');
// let conn= require('../communication/conn').default();

const datax = [
    {
      "lat": -33.580462,
      "lon": -70.567177
    },
    {
      "lat": -33.580432,
      "lon": -70.567147
    },
    {
      "lat": -33.580432,
      "lon": -70.567147
    },
    {
      "lat": -33.580433,
      "lon": -70.567144
    }
  ];
class TripRoute extends parentRouter{

    get routes(){
        return{
            'POST /v1' : 'createByReadings',
        }
    }

    constructor(router,db){
        super(router, User(db))
    }

    createByReadings(req, res) {
        let newTrip = {};
        const readings = req.body.readings;
        const sortReadings = readings.sort( (item1, item2) => {
            return item1.time - item2.time;
        });

        newTrip.start = {
            time: sortReadings[0].time,
            lat: sortReadings[0].location.lat,
            lon: sortReadings[0].location.lon
        }

        newTrip.end = {
            time: sortReadings[sortReadings.length-1].time,
            lat: sortReadings[sortReadings.length-1].location.lat,
            lon: sortReadings[sortReadings.length-1].location.lon
        }

        newTrip.duration = sortReadings[sortReadings.length-1].time - sortReadings[0].time;

        let initialPoint = sortReadings[0];
        // let auxreading = [...sortReadings];
        // auxreading.shift()
        // console.log('lenght asda ', auxreading.length, sortReadings.length);
        // let distance =  auxreading.reduce((result, val) => {
        //     result.averageSpeed += val.speed;
        //     result.averageSpeedLimit += val.speedLimit;
        //     return result;
        // }, {averageSpeed: 0, averageSpeedLimit :0});

        // console.log("distance");
        // console.log(distance);

        // let distance2 =  auxreading.reduce((result, val) => {
        //     result.averageSpeed += val.speed;
        //     result.averageSpeedLimit += val.speedLimit;
        //     return result;
        // }, {averageSpeed: 0, averageSpeedLimit :0});

        // console.log("distance22222");
        // console.log(distance2);
        // console.log(auxreading.length);
        // console.log((distance.averageSpeed /auxreading.length) * newTrip.duration);
        // console.log((distance.averageSpeedLimit/auxreading.length) * newTrip.duration);
        // newTrip.end = sortReadings[sortReadings.length-1];
        // const aux = sortReadings.reduce((result, val) => {
        //     if(result.point == null) {
        //         result.point = val.location;
        //         result.time1 = val.time;
        //     } else {
        //        result.distance += distenceBetweenTwoPoints(result.point.lat, result.point.lon, val.location.lat, val.location.lon);
        //        result.point = val.location;
               
        //        result.distance1 += getDistance(result.time1, val.time, val.speedLimit);
        //        result.time1 = val.time;
        //     }

            
        //     return result
        // },{ distance :0 , point: null, time1:0,  distance1: 0});

        const aux = datax.reduce((result, val) => {
                if(result.point == null) {
                    result.point = {
                        lat : val.lat,
                        lon : val.lon
                    }
                    
                    // result.time1 = val.time;
                } else {
                   result.distance += distenceBetweenTwoPoints(result.point.lat, result.point.lon, val.lat, val.lon);
                   result.point = {
                    lat : val.lat,
                    lon : val.lon
                    }
                   
                //    result.distance1 += getDistance(result.time1, val.time, val.speedLimit);
                //    result.time1 = val.time;
                }
    
                
                return result
            },{ distance :0 , point: null, time1:0,  distance1: 0});

        // const data = distenceBetweenTwoPoints(newTrip.start.lat, newTrip.start.lon, newTrip.end.lat, newTrip.end.lon);
        
        // console.log("data");
        // console.log(data);
        console.log("distancesss");
        console.log(aux);
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
        res.json({newTrip})
    }
}

function distenceBetweenTwoPoints(lat1, lon1, lat2, lon2){
    const R = 6371; // km
// const A1 = lat1 * Math.PI/180; // φ, λ in radians
// const A2 = lat2 * Math.PI/180;
const dLat = (lat2-lat1) ;
const dLon = (lon2-lon1) ;

const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1) * Math.cos(lat2) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

return R * c; // in metres
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  }
  
  function deg2rad(deg) {
    return deg * (Math.PI/180)
  }



  function getValues(){

  }
  function getDistance(t1, t2, v) {
      return v * (t2-t1); 
  }

module.exports = TripRoute;