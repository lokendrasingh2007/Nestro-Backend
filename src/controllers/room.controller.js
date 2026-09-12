import RoomModel from "../models/room.model.js"
import { sendBadRequest, sendConflict, sendCreated, sendNotFound, sendServerError, sendSuccess } from "../utils/response.js"

const get = async (req, res) => {
    try {
        const query = req.query;
        const filter = {};
        if (query.status) filter.status = query.status === "true";

        const rooms = await RoomModel.find(filter);
        return res.status(200).json({
            success: true,
            message: "Data find",
            rooms: rooms,
            total: rooms.length
        })

    } catch (error) {
        sendServerError(res, "Internal Server Error")
    }

}
const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const rooms = await RoomModel.findById(id);
        return res.status(200).json({
            success: true,
            message: "Data find",
            rooms: rooms,
            total: rooms.length
        })

    } catch (error) {
        console.log(error)
        sendServerError(res, "Internal Server Error")
    }

}

const create = async (req, res) => {
    try {

        const { name, slug } = req.body;
        const room_type = await RoomModel.findOne({ name });
        if (room_type) return sendConflict(res);
        await RoomModel.create({ name, slug });
        sendCreated(res)

    } catch (error) {
        sendServerError(res, "Internal Server Error")
    }

}

const deleteById = async (req, res) => {
    try {
        const { id } = req.params;
        const room_type = await RoomModel.findById({ _id: id });
        if (!room_type) return sendNotFound(res);
        await RoomModel.findByIdAndDelete(id)

        sendSuccess(res, "Delete Sucessfully")

    } catch (error) {
        sendServerError(res, "Internal Server Error")
    }

}

const StatusUpdate = async (req, res) => {
    try {
        const { id } = req.params;
        const room_type = await RoomModel.findById({ _id: id });
        if (!room_type) return sendNotFound(res);
        await RoomModel.findByIdAndUpdate(
            { _id: id },
            {
                $set: {
                    status: !room_type.status
                }
            }

        )

        sendSuccess(res, "Data Update Sucessfully")

    } catch (error) {
        sendServerError(res, "Internal Server Error")
    }

}

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug } = req.body;
        const room = await RoomModel.findById(id);
        if (!room) return sendNotFound(res, "Room type not found");
        if (name) room.name = name;
        if (slug) room.slug = slug;
        await room.save();
        return sendSuccess(res, "Room type updated successfully");
    } catch (error) {
        console.log(error);
        sendServerError(res, "Internal Server Error");
    }
};

export {
    get,
    create,
    update,
    StatusUpdate,
    deleteById,
    getById
}