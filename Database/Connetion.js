let mongo = require('mongoose');
const dotenv=require("dotenv")
dotenv.config({path:"./dotenv"});
console.log(process.env.MONGO_URI);

conne=process.env.MONGO_URI
const conn = mongo.connect(conne,{
    useNewUrlParser:true,
    useUnifiedTopology:true
})
.then(()=>{console.log("Mongo db connected")})
.catch((error)=>{console.log(error)})