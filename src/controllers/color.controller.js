import ColorModel from "../models/color.model.js";
import {
    sendConflict,
    sendCreated,
    sendNotFound,
    sendServerError,
    sendSuccess
} from "../utils/response.js";

// GET all colors
const get = async (req, res) => {
    try {
        const query = req.query;
        const filter = {};
        const limit = query.limit ? parseInt(query.limit) : 0;

        if (query.status !== undefined) filter.status = query.status === "true";

        const colors = await ColorModel.find(filter).limit(limit).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Data found",
            colors
        });
    } catch (error) {
        console.log(error);
        sendServerError(res, "Internal Server Error");
    }
};

// GET by ID
const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const color = await ColorModel.findById(id);
        if (!color) return sendNotFound(res, "Color not found");

        return res.status(200).json({
            success: true,
            message: "Data found",
            color
        });
    } catch (error) {
        sendServerError(res, "Internal Server Error");
    }
};

// CREATE
const create = async (req, res) => {
    try {
        const { name, hex } = req.body;

        const existing = await ColorModel.findOne({ name });
        if (existing) return sendConflict(res, "Color already exists");

        await ColorModel.create({ name, hex });
        sendCreated(res, "Color created successfully");
    } catch (error) {
        console.log(error);
        sendServerError(res, "Internal Server Error");
    }
};

// UPDATE
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, hex } = req.body;

        const color = await ColorModel.findById(id);
        if (!color) return sendNotFound(res, "Color not found");

        await ColorModel.findByIdAndUpdate(id, { name, hex }, { returnDocument: 'after' });
        sendSuccess(res, "Color updated successfully");
    } catch (error) {
        console.log(error);
        sendServerError(res, "Internal Server Error");
    }
};

// DELETE
const deleteById = async (req, res) => {
    try {
        const { id } = req.params;
        const color = await ColorModel.findById(id);
        if (!color) return sendNotFound(res, "Color not found");

        await ColorModel.findByIdAndDelete(id);
        sendSuccess(res, "Color deleted successfully");
    } catch (error) {
        sendServerError(res, "Internal Server Error");
    }
};

// STATUS TOGGLE
const statusUpdate = async (req, res) => {
    try {
        const { id } = req.params;
        const color = await ColorModel.findById(id);
        if (!color) return sendNotFound(res, "Color not found");

        await ColorModel.findByIdAndUpdate(id, {
            $set: { status: !color.status }
        });
        sendSuccess(res, "Status updated successfully");
    } catch (error) {
        sendServerError(res, "Internal Server Error");
    }
};

export { get, getById, create, update, deleteById, statusUpdate };
