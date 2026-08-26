const mongoose = require('mongoose');

const ctSchema = new mongoose.Schema({
    category:{
        type:String, 
         required:true
        },
 
        
    description:{
            type:String, 
             required:true
         },
    
    status:{
            type:String, 
            enum:["active","inactive","delete"],
    },
    timestamps:{
        type:Date,
        default:Date.now
    },
});
  
const Category = mongoose.model('Category', ctSchema);
module.exports = Category;