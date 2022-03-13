/**
 * Created by iZel on 6/9/17.
 */

class ParentRouter {

    get defaultRoute(){
        return {
            '/'         : 'getAll',
            'POST /'    : 'create',
            'PUT /'     : 'update',
            'DELETE /:id'  : 'remove'
        }
    }

    get routes(){
        return {}
    }

    constructor(router,Model=null){
        this.router=router;
        this.Model=Model;
        this.default={};
        if (!this.router) throw new Error('Missing app property');
        this.default = Model ? this.defaultRoute:{}
        this.registerRoutes();
    }

    registerRoutes() {
        let routes = Object.assign({},this.default,this.routes);

        Object.keys(routes).forEach((path) => {
            let method = routes[path];
            let verb = path.split(' ').length > 1 ? path.split(' ')[0] : 'get';
            let api = path.split(' ').length > 1 ? path.split(' ')[1] : '/';
            verb = verb.toLowerCase();
            this.router[verb](api, this[method].bind(this));
        });
    }

    getAll(req,res) {
        // console.log("getAll");
        // console.log(this.Model)
        // this.Model.findOne({name:'Adrian'}, (err, pe) => {
        //     console.log(":asdaxxxxsdas");
        //     console.log(err);
        //     console.log(pe);
        // })
        this.Model.find(function (err,resp) {
            // console.log(":asdasdas");
            // console.log(err);
            // console.log(resp);
            if(err) this.handleError(res)(err);
            return res.json(resp);
        });
    }

    create(req,res){
        let body= req.body;
        let model=new this.Model(body);
        model.save(function (err,data) {
            if(err) return this.handleError(res)(err);
            return res.json(data)
        })
    }

    update(req,res){
        let query = {
            _id:req.body._id
        };
        this.Model.findOneAndUpdate(query,req.body, {new:true},function (err, doc) {
            if (err) this.handleError(res)(err);
            res.json(doc);
        })
    }

    remove(req,res){
        this.Model.remove({_id:req.params.id},function (err,data) {
            if(err) return this.handleError(res)(err);
            return res.json(data)
        })
    }


    handleError(res) {
        return function(error) {
            return res.status(500).json(error);
        }
    }
}

module.exports = ParentRouter;

