const express = require('express');
const Router = express.Router();
const Product = require('../model/Product');
const productUpload = require('../middleware/productUpload');

// Configure fields for single thumbnail and multiple images
const uploadFields = productUpload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 10 }
]);

const parseTags = (tags) => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    try {
        return JSON.parse(tags);
    } catch {
        return tags.split(',').map(tag => tag.trim()).filter(Boolean);
    }
};

// 1. CREATE / ADD PRODUCT
Router.post('/register', uploadFields, async (req, res) => {
    try {
        const {
            name,
            shortdescription,
            description,
            price,
            compareprice,
            costprice,
            stockquantity,
            stockstatus,
            refundpolicy,
            iscouponavailable,
            isrefundable_replacement,
            isfreedelivery,
            refund_days,
            isreplaceable,
            category_id,
            tags,
            height,
            width,
            status,
            is_feature
        } = req.body;

        // Validation for required fields
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: "Product name is required" });
        }
        if (!shortdescription || !shortdescription.trim()) {
            return res.status(400).json({ success: false, message: "Short description is required" });
        }
        if (price === undefined || price === null || price === '') {
            return res.status(400).json({ success: false, message: "Price is required" });
        }
        if (compareprice === undefined || compareprice === null || compareprice === '') {
            return res.status(400).json({ success: false, message: "Compare price is required" });
        }
        if (costprice === undefined || costprice === null || costprice === '') {
            return res.status(400).json({ success: false, message: "Cost price is required" });
        }
        if (!stockstatus) {
            return res.status(400).json({ success: false, message: "Stock status is required" });
        }
        if (!refundpolicy) {
            return res.status(400).json({ success: false, message: "Refund policy is required" });
        }
        if (refund_days === undefined || refund_days === null || refund_days === '') {
            return res.status(400).json({ success: false, message: "Refund days is required" });
        }
        const categoryId = category_id || req.body.category;
        if (!categoryId) {
            return res.status(400).json({ success: false, message: "Category is required" });
        }
        if (height === undefined || height === null || height === '') {
            return res.status(400).json({ success: false, message: "Height is required" });
        }
        if (width === undefined || width === null || width === '') {
            return res.status(400).json({ success: false, message: "Width is required" });
        }

        // Handle uploaded thumbnail
        let thumbnailPath = '';
        if (req.files?.['thumbnail']?.[0]) {
            thumbnailPath = `uploads/products/${req.files['thumbnail'][0].filename}`;
        } else if (req.body.thumbnail) {
            thumbnailPath = req.body.thumbnail;
        }

        if (!thumbnailPath) {
            return res.status(400).json({ success: false, message: "Product thumbnail is required" });
        }

        // Handle uploaded gallery images
        let imagesList = [];
        if (req.files?.['images']?.length > 0) {
            imagesList = req.files['images'].map(file => `uploads/products/${file.filename}`);
        } else if (req.body.images) {
            imagesList = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
        }

        if (imagesList.length === 0) {
            return res.status(400).json({ success: false, message: "At least one product image is required" });
        }

        const newProduct = new Product({
            name: name.trim(),
            shortdescription: shortdescription.trim(),
            description: description ? description.trim() : "",
            price: Number(price),
            compareprice: Number(compareprice),
            costprice: Number(costprice),
            stockquantity: stockquantity !== undefined ? Number(stockquantity) : 0,
            stockstatus,
            refundpolicy,
            iscouponavailable: iscouponavailable === true || iscouponavailable === 'true',
            isrefundable_replacement: isrefundable_replacement === true || isrefundable_replacement === 'true',
            isfreedelivery: isfreedelivery === true || isfreedelivery === 'true',
            refund_days: Number(refund_days),
            isreplaceable: isreplaceable === true || isreplaceable === 'true',
            images: imagesList,
            thumbnail: thumbnailPath,
            category_id: categoryId,
            tags: parseTags(tags),
            height: Number(height),
            width: Number(width),
            status: status || 'active',
            is_feature: is_feature === true || is_feature === 'true'
        });

        await newProduct.save();

        return res.status(201).json({
            success: true,
            message: "Product added successfully",
            product: newProduct
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to add product",
            error: error.message
        });
    }
});

// 2. GET ALL PRODUCTS
Router.get('/show', async (req, res) => {
    try {
        const products = await Product.find()
            .populate('category_id', 'category description image status')
            .sort({ createdAt: -1 });

        return res.json(products);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching products",
            error: error.message
        });
    }
});

// 3. GET SINGLE PRODUCT BY ID
Router.get('/show/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category_id', 'category description image status');

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        return res.json({ success: true, product });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching product details",
            error: error.message
        });
    }
});

// 4. UPDATE PRODUCT (PUT)
Router.put('/update/:id', uploadFields, async (req, res) => {
    try {
        const existingProduct = await Product.findById(req.params.id);
        if (!existingProduct) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const updateData = { ...req.body };
        if (updateData.category) {
            updateData.category_id = updateData.category;
            delete updateData.category;
        }

        // Handle numeric fields conversion if present
        const numericFields = ['price', 'compareprice', 'costprice', 'stockquantity', 'refund_days', 'height', 'width'];
        numericFields.forEach(field => {
            if (updateData[field] !== undefined) updateData[field] = Number(updateData[field]);
        });

        // Handle boolean fields
        const booleanFields = ['iscouponavailable', 'isrefundable_replacement', 'isfreedelivery', 'isreplaceable', 'is_feature'];
        booleanFields.forEach(field => {
            if (updateData[field] !== undefined) {
                updateData[field] = updateData[field] === true || updateData[field] === 'true';
            }
        });

        // Handle tags
        if (updateData.tags !== undefined) {
            updateData.tags = parseTags(updateData.tags);
        }

        // Handle thumbnail update
        if (req.files?.['thumbnail']?.[0]) {
            updateData.thumbnail = `uploads/products/${req.files['thumbnail'][0].filename}`;
        }

        // Handle images update
        if (req.files?.['images']?.length > 0) {
            updateData.images = req.files['images'].map(file => `uploads/products/${file.filename}`);
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('category_id', 'category description image status');

        return res.json({
            success: true,
            message: 'Product updated successfully',
            product: updatedProduct
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error updating product",
            error: error.message
        });
    }
});

// 5. PATCH PRODUCT (PATCH)
Router.patch('/patch/:id', async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (updateData.category) {
            updateData.category_id = updateData.category;
            delete updateData.category;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('category_id', 'category description image status');

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        return res.json({
            success: true,
            message: 'Product patched successfully',
            product: updatedProduct
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error patching product",
            error: error.message
        });
    }
});

// 6. DELETE PRODUCT
Router.delete('/delete/:id', async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        return res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error deleting product",
            error: error.message
        });
    }
});

module.exports = Router;
