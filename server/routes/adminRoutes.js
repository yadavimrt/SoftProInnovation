const express=require('express');
const Router=express.Router();
const Admin=require('../model/admin');

Router.post('/regsiter',async(req,res)=>{
   
 try{
        const {name,email,password}=req.body;
      
        const a =await Admin.findOne({email});
        if(a){
            return res.json({message:"Admin Already Registered"})
        }
          console.log(req.body);
        const data=await Admin.create(req.body);
         console.log("data",data)
         return res.json({"message":"Email  Registered"});
    }
catch(error){
    return res.json({"message":"Email Not Registered"}); 
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




