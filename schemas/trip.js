
class Trip {
    constructor(db){
        let Schema = db.mongoose.Schema;

        this.schema = new Schema({
            start: {
                time: Number,
                lat: Number,
                lon: Number,
                address: String
            },
            end:{
                time: Number,
                lat: Number,
                lon: Number,
                address: String
            },
            distance: Number,
            duration: Number,
            overspeedsCount: Number,
            boundingBox: [Schema.Types.Mixed]
            });;
    }
}

module.exports=(db)=>{
    return db.mongoose.model('trips',new Trip(db).schema);
}