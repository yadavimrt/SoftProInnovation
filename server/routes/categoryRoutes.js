const Category=require('../model/Category');
const express=require('express');
const Router=express.Router();

Router.post('/register',async(req,res)=>{
   
 try{
        const {category,description,status}=req.body;
        const a =await Category.findOne({category});
        if(a){
            return res.json({message:"Category Already Registered"})
        }
        const data= await new Category({
            category:category,
            description:description,
            status:status
        });
         await data.save();
         return res.json({"message":"Category  Registered"});
    }

catch(error){
    return res.json({"message":"Category Not Registered"}); 
}
})

Router.get('/show', async (req, res) => {
    try {
        const categories = await Category.find();
        return res.json(categories);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching categories" });
    }
});

Router.put('/update/:id', async (req, res) => {
    try {
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json({ message: 'Category updated', category: updatedCategory });
    } catch (error) {
        res.status(500).json({ message: "Error updating category", error: error.message });
    }
});

Router.patch('/patch/:id', async (req, res) => {
    try {
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json({ message: 'Category patched', category: updatedCategory });
    } catch (error) {
        res.status(500).json({ message: "Error patching category", error: error.message });
    }
});

Router.delete('/delete/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ message: "Error deleting category", error: error.message });
    }
});

module.exports=Router;