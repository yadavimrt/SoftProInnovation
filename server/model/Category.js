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
    
    image: {
        type: String,
        default: ''
    },
    status:{
            type:String, 
            enum:["active","inactive","delete"],
            default: "active"
    },
    timestamps:{
        type:Date,
        default:Date.now
    },
});
  
const Category = mongoose.model('Category', ctSchema);
module.exports = Category;