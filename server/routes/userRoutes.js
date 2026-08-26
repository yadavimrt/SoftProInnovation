const express=require('express');
const Router=express.Router();
const User=require('../model/User');


// Router.post("/User/register", (req,res)=>{
//     res.json("User register information")
// })


Router.post('/register',async(req,res)=>{
   
 try{
        const {name,email,password,mobile,status,gender,picture}=req.body;
        const a =await User.findOne({email});
        if(a){
            return res.json({message:"User Already Registered"})
        }
        const data=new User({
            name:name,
            email:email,
            password:password,  
            mobile:mobile,
            status:status,
            gender:gender,
            picture:picture
        });
         await data.save();
         return res.json({"message":"Email  Registered"});
    }

catch(error){
    console.error("User registration error:", error);
    return res.json({"message":"Email Not Registered", error: error.message}); 
}

})
  
Router.get('/show', async (req, res) => {
    try {
        const users = await User.find();
        return res.json(users);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching users" });
    }
});

Router.put('/update/:id', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json({ message: 'User updated', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Error updating user", error: error.message });
    }
});

Router.patch('/patch/:id', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json({ message: 'User patched', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Error patching user", error: error.message });
    }
});

Router.delete('/delete/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user", error: error.message });
    }
});

module.exports = Router;
