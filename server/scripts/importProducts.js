const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const Category = require("../model/Category");
const Product = require("../model/Product");

const PRODUCT_DATA_PATH = "c:\\Users\\ankur\\OneDrive\\Attachments\\Desktop\\ProductData\\IoT Robotics Drone & Embedded Systems Categories and Components";
const SERVER_UPLOADS = path.join(__dirname, "../uploads/products");

// Default prices based on product type
const priceMap = {
  "Arduino Boards": 400,
  "ATtiny85": 150,
  "BeagleBone Black": 3500,
  "ESP8266 & ESP32": 300,
  "PIC Microcontrollers": 250,
  "Raspberry Pi": 4000,
  "STM32 Boards": 600,
  "Temperature Sensor": 80,
  "Humidity Sensor": 150,
  "Motion Sensor": 120,
  "Distance Sensor": 180,
  "Light Sensor": 100,
  "WiFi Module": 200,
  "Bluetooth Module": 180,
  "LoRa Module": 800,
  "GSM Module": 1000,
  "Battery": 500,
  "Power Supply": 800,
  "Motor": 300,
  "Servo Motor": 200,
  "LCD Display": 250,
  "OLED Display": 300,
  "LED": 20,
};

function getPrice(productName, category) {
  // Check if product name matches a key
  for (let [key, price] of Object.entries(priceMap)) {
    if (productName.toLowerCase().includes(key.toLowerCase())) {
      return price;
    }
  }
  // Default price based on category
  const categoryMap = {
    "Microcontrollers & Development Boards": 500,
    "Sensor": 150,
    "Wireless & Communication Modules": 400,
    "Power & Battery Components": 600,
    "Actuators & Motors": 300,
    "Displays & Indicators": 250,
    "IoT KIT": 2000,
  };
  return categoryMap[category] || 500;
}

async function importProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/softproinnovation");
    console.log("Connected to MongoDB");

    // Get all category folders
    const mainDir = fs.readdirSync(PRODUCT_DATA_PATH).filter(
      (file) => fs.statSync(path.join(PRODUCT_DATA_PATH, file)).isDirectory() && file !== "."
    );

    for (const categoryFolder of mainDir) {
      const categoryPath = path.join(PRODUCT_DATA_PATH, categoryFolder);
      const categoryName = categoryFolder.replace(/^\d+\s+/, ""); // Remove number prefix
      
      console.log(`\n📁 Processing Category: ${categoryName}`);

      // Create or find category
      let category = await Category.findOne({ category: categoryName });
      if (!category) {
        category = await Category.create({
          category: categoryName,
          description: `${categoryName} - IoT Products`,
          image: "",
        });
        console.log(`✅ Created Category: ${categoryName}`);
      } else {
        console.log(`✅ Category exists: ${categoryName}`);
      }

      // Get all subcategories (product types)
      const subCategories = fs
        .readdirSync(categoryPath)
        .filter((file) => fs.statSync(path.join(categoryPath, file)).isDirectory());

      // Get image files directly in category folder (if any)
      const directImages = fs
        .readdirSync(categoryPath)
        .filter((file) => /\.(png|jpg|jpeg|gif)$/i.test(file));

      // Process direct images first
      for (const imageFile of directImages) {
        const imagePath = path.join(categoryPath, imageFile);
        const productName = imageFile.replace(/\.(png|jpg|jpeg|gif)$/i, "").trim();

        // Check if product already exists
        let product = await Product.findOne({
          name: productName,
          category_id: category._id,
        });

        if (!product) {
          // Copy image to server uploads
          const uploadDir = path.join(SERVER_UPLOADS, categoryName.toLowerCase().replace(/\s+/g, "-"));
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }

          const newImageName = `${productName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.png`;
          const destPath = path.join(uploadDir, newImageName);
          
          fs.copyFileSync(imagePath, destPath);
          
          const imageUrl = `/uploads/products/${categoryName.toLowerCase().replace(/\s+/g, "-")}/${newImageName}`;

          // Get price
          const price = getPrice(productName, categoryName);
          const comparePrice = Math.round(price * 1.4); // 40% markup for compare price
          const costPrice = Math.round(price * 0.6); // 40% margin

          // Create product
          product = await Product.create({
            name: productName,
            shortdescription: `${productName} - ${categoryName}`,
            description: `High quality ${productName} from IoT Robotics collection. Perfect for ${categoryName.toLowerCase()} projects.`,
            price: price,
            compareprice: comparePrice,
            costprice: costPrice,
            stockquantity: Math.floor(Math.random() * 50) + 10,
            stockstatus: "In Stock",
            refundpolicy: "30 days money back guarantee",
            refund_days: 30,
            iscouponavailable: false,
            isrefundable_replacement: true,
            isfreedelivery: price > 1000 ? true : false,
            isreplaceable: true,
            category_id: category._id,
            thumbnail: imageUrl,
            images: [imageUrl],
            height: 10,
            width: 10,
            tags: [categoryName],
            status: "active",
            is_feature: false,
          });

          console.log(`    ✅ Added: ${productName} - ₹${price}`);
        } else {
          console.log(`    ⏭️  Exists: ${productName}`);
        }
      }

      // Process subcategories (if any)
      if (subCategories.length > 0) {
        for (const subCategory of subCategories) {
          const subCategoryPath = path.join(categoryPath, subCategory);
          console.log(`  📂 Subcategory: ${subCategory}`);

          // Get all images (products)
          const imageFiles = fs
            .readdirSync(subCategoryPath)
            .filter((file) => /\.(png|jpg|jpeg|gif)$/i.test(file));

          for (const imageFile of imageFiles) {
            const imagePath = path.join(subCategoryPath, imageFile);
            const productName = imageFile.replace(/\.(png|jpg|jpeg|gif)$/i, "").trim();

            // Check if product already exists
            let product = await Product.findOne({
              name: productName,
              category_id: category._id,
            });

            if (!product) {
              // Copy image to server uploads
              const uploadDir = path.join(SERVER_UPLOADS, categoryName.toLowerCase().replace(/\s+/g, "-"));
              if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
              }

              const newImageName = `${productName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.png`;
              const destPath = path.join(uploadDir, newImageName);
              
              fs.copyFileSync(imagePath, destPath);
              
              const imageUrl = `/uploads/products/${categoryName.toLowerCase().replace(/\s+/g, "-")}/${newImageName}`;

              // Get price
              const price = getPrice(productName, categoryName);
              const comparePrice = Math.round(price * 1.4); // 40% markup for compare price
              const costPrice = Math.round(price * 0.6); // 40% margin

              // Create product
              product = await Product.create({
                name: productName,
                shortdescription: `${productName} - ${subCategory}`,
                description: `High quality ${productName} from IoT Robotics collection. Perfect for ${categoryName.toLowerCase()} projects.`,
                price: price,
                compareprice: comparePrice,
                costprice: costPrice,
                stockquantity: Math.floor(Math.random() * 50) + 10,
                stockstatus: "In Stock",
                refundpolicy: "30 days money back guarantee",
                refund_days: 30,
                iscouponavailable: false,
                isrefundable_replacement: true,
                isfreedelivery: price > 1000 ? true : false,
                isreplaceable: true,
                category_id: category._id,
                thumbnail: imageUrl,
                images: [imageUrl],
                height: 10,
                width: 10,
                tags: [subCategory, categoryName],
                status: "active",
                is_feature: false,
              });

              console.log(`    ✅ Added: ${productName} - ₹${price}`);
            } else {
              console.log(`    ⏭️  Exists: ${productName}`);
            }
          }
        }
      }
    }

    console.log("\n🎉 Product import completed successfully!");
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();
    console.log(`Total Categories: ${totalCategories}`);
    console.log(`Total Products: ${totalProducts}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error importing products:", error.message);
    process.exit(1);
  }
}

importProducts();
