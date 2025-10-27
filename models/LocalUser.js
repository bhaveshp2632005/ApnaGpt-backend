import mongoose from "mongoose";
const LocalUserSchema=new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    authProvider:{type:String,enum:["local","google"],default:"local"}, 
    createdAt:{type:Date,default:Date.now},
    lastLogin:{type:Date,default:Date.now}
})
export default mongoose.model("LocalUser",LocalUserSchema);