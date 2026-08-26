const express=require('express');
const Router=express.Router();
const Admin=require('../model/admin');
const jwt = require('jsonwebtoken')

// Router.post('/regsiter',async(req,res)=>{
   
//  try{
//         const {name,email,password}=req.body;
      
//         const a =await Admin.findOne({email});
//         if(a){
//             return res.json({message:"Admin Already Registered"})
//         }
//           console.log(req.body);
//         const data=await Admin.create(req.body);
//          console.log("data",data)
//          return res.json({"message":"Email  Registered"});
//     }
// catch(error){
//     return res.json({"message":"Email Not Registered"}); 
// }


// });


Router.post('/login', async (req, res) => {
    try{
        const{email,password} = req.body;
        const data =await Admin.findOne({email:email});
        if(!data){
            return res.json({msg:"Email not exit"});
        }
        if (data.password == password) {
            const token = jwt.sign(
                { adminId: data._id },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            return res.json({
                msg:"Sucess",
                token:token,
                role:"admin",
                name:data.name,
                adminId:data._id
            })

        }else{
            return res.json({msg:"Password is Incorrect"})
                }
            } catch (er) {
                console.log(er);
                return res.status(500).json({ msg: "Server error" });
            }
        });



        


Router.get("/show", async (req, res) => {
    try {
        const data = await Admin.find();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching admin data" });
    }
});








Router.put("/update/:id", async (req, res) => {
    try {
        const updatedAdmin = await Admin.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json({ message: "Admin updated", admin: updatedAdmin });
    } catch (error) {
        res.status(500).json({ message: "Error updating admin", error: error.message });
    }
});

Router.patch('/patch/:id', async (req, res) => {
    try {
        const updatedAdmin = await Admin.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json({ message: 'Admin updated', admin: updatedAdmin });
    } catch (error) {
        res.status(500).json({ message: "Error patching admin", error: error.message });
    }
});
Router.delete("/delete/:id", async (req, res) => {
    try {
        await Admin.findByIdAndDelete(req.params.id);
        res.json({ message: "Admin deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting admin", error: error.message });
    }
});

module.exports=Router;




