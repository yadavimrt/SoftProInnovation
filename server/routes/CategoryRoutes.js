const Category = require('../model/Category');
const Product = require('../model/Product');
const express = require('express');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');
const Router = express.Router();

Router.post('/register', upload.single('image'), async (req, res) => {
    try {
        const { category, description, status } = req.body;
        if (!category || !category.trim()) {
            return res.status(400).json({ success: false, message: "Category name is required" });
        }
        if (!description || !description.trim()) {
            return res.status(400).json({ success: false, message: "Description is required" });
        }

        const existingCategory = await Category.findOne({
            category: { $regex: new RegExp(`^${category.trim()}$`, 'i') }
        });

        if (existingCategory) {
            return res.status(400).json({ success: false, message: "Category already exists" });
        }

        const imagePath = req.file ? `uploads/categories/${req.file.filename}` : '';

        const newCategory = new Category({
            category: category.trim(),
            description: description.trim(),
            image: imagePath,
            status: status || 'active'
        });

        await newCategory.save();
        return res.status(201).json({
            success: true,
            message: "Category added successfully",
            category: newCategory
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to add category",
            error: error.message
        });
    }
});

Router.get('/show', async (req, res) => {
    try {
        const matchStage = {};
        if (req.query.status && req.query.status !== 'all') {
            matchStage.status = req.query.status;
        }

        const categories = await Category.aggregate([
            ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
            { $sort: { timestamps: -1 } },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: 'category_id',
                    as: 'products'
                }
            },
            {
                $addFields: {
                    productCount: { $size: '$products' }
                }
            },
            {
                $project: {
                    products: 0
                }
            }
        ]);
        return res.json(categories);
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error fetching categories", error: error.message });
    }
});

Router.put('/update/:id', upload.single('image'), async (req, res) => {
    try {
        const { category, description, status } = req.body;
        const updateData = {
            category,
            description,
            status
        };

        if (req.file) {
            updateData.image = `uploads/categories/${req.file.filename}`;
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        if (!updatedCategory) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.json({ success: true, message: 'Category updated successfully', category: updatedCategory });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating category", error: error.message });
    }
});

Router.patch('/patch/:id', async (req, res) => {
    try {
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedCategory) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.json({ success: true, message: 'Category patched successfully', category: updatedCategory });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error patching category", error: error.message });
    }
});

const deleteCategoryHandler = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ success: false, message: 'Category ID is required' });
        }

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        // Delete category image from disk if exists
        if (category.image) {
            try {
                const fullImagePath = path.join(__dirname, '..', category.image);
                if (fs.existsSync(fullImagePath)) {
                    fs.unlinkSync(fullImagePath);
                }
            } catch {
                // Ignore file system cleanup errors
            }
        }

        // Unlink or update any products assigned to this category
        try {
            await Product.updateMany({ category_id: id }, { $unset: { category_id: 1 } });
        } catch {
            // Non-critical product unlink failure
        }

        await Category.findByIdAndDelete(id);

        return res.json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error deleting category', error: error.message });
    }
};

Router.delete('/delete/:id', deleteCategoryHandler);
Router.delete('/:id', deleteCategoryHandler);
Router.post('/delete/:id', deleteCategoryHandler);

module.exports = Router;