//module.exports=Router;
const express = require('express');
const categoryRouter = express.Router();
const Category = require('../models/category');
const { userAuth } = require('../authentication/middleWares/auth');

//categorry api building

categoryRouter.post('/v1/admin/user/:userId/category', userAuth, async (req, res) => {
    const { userId } = req.params;
    let { name } = req.body;

    // Validate the category name
    if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ message: 'Category name is required and must be a valid string.' });
    }

    // Normalize the name
    name = name.toLowerCase().trim().replace(/\s+/g, ' ');

    // Validate the name for allowed characters
    const isValidName = /^[a-zA-Z0-9 ]+$/.test(name);
    if (!isValidName) {
        return res.status(400).json({ message: 'Invalid category name! Only alphanumeric characters and single spaces are allowed.' });
    }

    try {
        // Ensure the authenticated user's ID matches the provided userId
        if (!req.user || req.user._id.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized access: User ID does not match the authenticated user." });
        }

        // Check if the category name already exists for the user
        const existingCategory = await Category.findOne({ userId: req.user._id, name });
        if (existingCategory) {
            return res.status(400).json({ message: "Category name already exists for this user." });
        }

        // Create and save the new category
        const category = new Category({
            name,
            userId: req.user._id // Assign userId from authenticated user
        });

        await category.save();
        res.status(201).json({ message: "Category created successfully!", category });
    } catch (err) {
        // Log error for debugging
        console.error("Error saving category:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

categoryRouter.get('/v1/user/:userId/category', userAuth, async (req, res) => {
    const { userId } = req.params;
    try {
        // Ensure the authenticated user's ID matches the provided userId
        if (!req.user || req.user._id.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized access: User ID does not match the authenticated user." });
        }

        // Find all categories associated with the authenticated user
        const categories = await Category.find({ userId: req.user._id });
        res.status(200).json(categories);
    } catch (err) {
        console.error("Error retrieving categories:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

categoryRouter.delete('/v1/user/:userId/category', userAuth, async (req, res) => {
    const { userId } = req.params;
    try {
        // Ensure the authenticated user's ID matches the provided userId
        if (!req.user || req.user._id.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized access: User ID does not match the authenticated user." });
        }

        const result = await Category.deleteMany({ userId: req.user._id });
        res.status(200).json(result);


    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message })
    }
});

categoryRouter.get('/v1/user/:userId/category/:id', userAuth, async (req, res) => {
    const { userId, id } = req.params;
    try {
        // Ensure the user in params matches the authenticated user
        if (userId !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized access to this user's categories" });
        }

        // Find category that belongs to the authenticated user
        const category = await Category.findOne({ _id: id, userId: req.user._id });

        if (!category) {
            return res.status(404).json({ message: "Category not found or doesn't belong to the user!" });
        }

        res.status(200).json(category);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

categoryRouter.delete('/v1/user/:userId/category/:id', userAuth, async (req, res) => {
    const { userId, id } = req.params;
    try {
        // Ensure the user in params matches the authenticated user
        if (userId !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized access to this user's categories" });
        }

        const match = await Category.findOneAndDelete({ _id: id, userId: req.user._id });
        if (!match) {
            return res.status(404).json({ message: "Category not found or doesn't belong to the user!!!" });
        }
        res.status(200).json({
            message: "Category Deleted Successfully!!!",
            data: match
        });

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message })
    }
});

//----------------------------------------------------------------------------------------------------------------------------------------------------------

categoryRouter.post('/v1/user/:userId/category/:id/item', userAuth, async (req, res) => {
    const { userId, id } = req.params;
    const { name, description, instructions, frequency, serviceDate } = req.body;

    // Validate serviceDate
    if (!serviceDate) {
        return res.status(400).json({ message: "serviceDate is required" });
    }

    // Convert serviceDate to UTC
    const serviceDateUTC = new Date(serviceDate);

    // Validate the serviceDate format
    if (isNaN(serviceDateUTC.getTime())) {
        return res.status(400).json({ message: "Invalid service date format" });
    }

    try {
        // Ensure the authenticated user's ID matches the provided userId
        if (!req.user || req.user._id.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized access: User ID does not match the authenticated user." });
        }

        // Check if the category exists and belongs to the authenticated user
        const category = await Category.findOne({ _id: id, userId: req.user._id });
        if (!category) {
            return res.status(404).json({ message: "Category not found or access denied" });
        }

        // Create a new item object
        const newItem = {
            name,
            description,
            instructions,
            workFinish: false,
            frequency,
            serviceDate: serviceDateUTC, // Store in UTC format
        };

        // Add the new item to the category
        category.items.push(newItem);
        await category.save();

        res.status(201).json({ message: "Item added successfully!", item: newItem });
    } catch (err) {
        console.error("Error adding item:", err); // Log the error for debugging
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

categoryRouter.put('/v1/user/:userId/category/:categoryId/item/:itemId', userAuth, async (req, res) => {
    const { userId, categoryId, itemId } = req.params;

    try {
        // Ensure the authenticated user's ID matches the provided userId
        if (!req.user || req.user._id.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized access: User ID does not match the authenticated user." });
        }

        // Check if the category exists and belongs to the authenticated user
        const category = await Category.findOne({ _id: categoryId, userId: req.user._id });
        if (!category) {
            return res.status(404).json({ message: "Category not found or access denied" });
        }

        // Find the specific item within the category
        const item = category.items.id(itemId);
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        // Toggle the workFinish status
        item.workFinish = !item.workFinish;
        await category.save();

        res.status(200).json({ message: "Item updated successfully!", item });
    } catch (error) {
        console.error("Error updating item:", error); // Log the error for debugging
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

categoryRouter.get('/v1/user/:userId/category/:categoryId/item', userAuth, async (req, res) => {
    const { userId, categoryId } = req.params;
    try {
        // Ensure the authenticated user's ID matches the provided userId
        if (!req.user || req.user._id.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized access: User ID does not match the authenticated user." });
        }

        // Find the category for the specific user
        const category = await Category.findOne({ _id: categoryId, userId: req.user._id });
        if (!category) {
            return res.status(404).json({ message: "Category not found!" });
        }

        // Respond with the items in the category
        res.status(200).json({ message: "Category found successfully", items: category.items });

    } catch (err) {
        console.error("Error fetching items:", err); // Log the error for debugging
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

categoryRouter.get('/v1/user/:userId/category/:categoryId/item/:itemId', userAuth, async (req, res) => {
    const { userId, categoryId, itemId } = req.params;

    try {
        // Ensure the authenticated user's ID matches the provided userId
        if (!req.user || req.user._id.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized access: User ID does not match the authenticated user." });
        }

        // Find the category associated with the user
        const category = await Category.findOne({ _id: categoryId, userId: req.user._id });
        if (!category) {
            return res.status(404).json({ message: "Category not found!" });
        }

        // Find the specific item within the category
        const item = category.items.id(itemId);
        if (!item) {
            return res.status(404).json({ message: "Item not found in this category!" });
        }

        res.status(200).json({ message: "Item found successfully", item });

    } catch (err) {
        console.error("Error fetching item:", err); // Log error for debugging
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

categoryRouter.delete('/v1/user/:userId/category/:categoryId/items', userAuth, async (req, res) => {
    const { userId, categoryId } = req.params;

    try {
        // Ensure the authenticated user's ID matches the provided userId
        if (req.user._id.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized access: User ID does not match the authenticated user." });
        }

        // Find the category for the specific user
        const category = await Category.findOne({ _id: categoryId, userId: req.user._id });
        if (!category) {
            return res.status(404).json({ message: "Category not found!" });
        }

        // Clear all items in the category
        category.items = [];
        await category.save();

        res.status(200).json({ message: "All items in the category have been deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

categoryRouter.delete('/v1/user/:userId/category/:categoryId/item/:itemId', userAuth, async (req, res) => {
    const { userId, categoryId, itemId } = req.params;

    try {
        // Ensure the authenticated user's ID matches the provided userId
        if (req.user._id.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized access: User ID does not match the authenticated user." });
        }

        // Find the category by ID and ensure it belongs to the authenticated user
        const category = await Category.findOne({ _id: categoryId, userId: req.user._id });
        if (!category) {
            return res.status(404).json({ message: "Category not found!" });
        }

        // Find the index of the item within the category's items array
        const itemIndex = category.items.findIndex(item => item._id.toString() === itemId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: "Item not found in this category!" });
        }

        // Remove the item from the array
        category.items.splice(itemIndex, 1);

        // Save the updated category
        await category.save();

        res.status(200).json({ message: "Item deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// PATCH request to update the serviceDate of an item in a category
categoryRouter.patch('/v1/user/:userId/category/:categoryId/item/:itemId', userAuth, async (req, res) => {
    const { userId, categoryId, itemId } = req.params;
    const { serviceDate } = req.body;

    console.log(`Received request to update service date for user: ${userId}, category: ${categoryId}, item: ${itemId}`);

    try {
        if (req.user._id.toString() !== userId) {
            console.log("Unauthorized access attempt");
            return res.status(403).json({ message: "Unauthorized access: User ID does not match the authenticated user." });
        }

        const category = await Category.findOne({ _id: categoryId, userId: req.user._id });
        if (!category) {
            console.log("Category not found");
            return res.status(404).json({ message: "Category not found" });
        }

        const item = category.items.id(itemId);
        if (!item) {
            console.log("Item not found");
            return res.status(404).json({ message: "Item not found" });
        }

        if (!item.workFinish) {
            console.log("Item is not marked as finished. Cannot update service date.");
            return res.status(400).json({ message: "Item is not marked as finished. Cannot update service date." });
        }

        if (serviceDate) {
            console.log(`Updating service date to: ${serviceDate}`);
            item.serviceDate = new Date(serviceDate);
        } else {
            console.log("Service date not provided in request");
            return res.status(400).json({ message: "Service date is required" });
        }

        await category.save();
        console.log("Service date updated and category saved successfully");
        return res.status(200).json({ message: "Service date updated successfully", item });

    } catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
});

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

categoryRouter.post('/v1/user/:userId/category/:categoryId/item/:itemId', userAuth, async (req, res) => {
    const { lastServiced } = req.body;
    const { userId, categoryId, itemId } = req.params;

    try {
        // Ensure the authenticated user's ID matches the provided userId
        if (req.user._id.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized access: User ID does not match the authenticated user." });
        }

        // Find the category by its ID, ensuring it belongs to the authenticated user
        const category = await Category.findOne({ _id: categoryId, userId: req.user._id });

        if (!category) {
            return res.status(404).json({ message: "Category not found!" });
        }

        // Find the specific item within the category
        const item = category.items.id(itemId);

        if (!item) {
            return res.status(404).json({ message: "Item not found in this category!" });
        }

        // Validate lastServiced data
        if (!lastServiced) {
            return res.status(400).json({ message: "Last serviced date is required." });
        }

        // Update the existing item's maintenance data
        const ItemMaintenance = { lastServiced: new Date(lastServiced) };

        // Push the new maintenance data to the item's ItemMaintainance array
        item.ItemMaintainance.push(ItemMaintenance);

        // Save the updated category with the modified item
        await category.save();

        res.status(201).json({ message: "Item Maintenance added successfully!" });

    } catch (err) {
        console.error("Error adding item maintenance:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

module.exports = categoryRouter;