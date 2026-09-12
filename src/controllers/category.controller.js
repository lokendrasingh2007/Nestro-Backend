import CategoryModel from "../models/category.model.js";
import { sendBadRequest, sendConflict, sendCreated, sendNotFound, sendServerError, sendSuccess } from "../utils/response.js"

const get = async (req, res) => {
    try {
        const query = req.query;
        const filter = {};
        const limit = query.limit ? parseInt(query.limit) : 0;
        if (query.status) filter.status = query.status === "true";
        
        const categories = await CategoryModel.find(filter).limit(limit);
        return res.status(200).json({
            success: true,
            message: "Data find",
            categories
        })
    } catch (error) {
        sendServerError(res, "Internal Server Error")
    }
}

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await CategoryModel.findById(id)
        return res.status(200).json({
            success: true,
            message: "Data find",
            category: category
        })

    } catch (error) {
        sendServerError(res, "Internal Server Error")
    }

}


const create = async (req, res) => {
    try {

        const { name, slug } = req.body;

        const image = req.file.path;
        console.log(image, "IMAGE")
        const category = await CategoryModel.findOne({ name });
        if (category) return sendConflict(res);
        await CategoryModel.create({ name, slug, image, image });
        sendCreated(res);

    } catch (error) {
        console.log(error, "error")
        sendServerError(res, "Internal Server Error")
    }

}


const update = async (req, res) => {

    try {

        const { id } = req.params;
        const { name, slug, roomId } = req.body;
        const oldCategory = await CategoryModel.findById(id);

        if (!oldCategory) {
            return sendNotFound(res, "Category not found");
        }

        const categoryExists = await CategoryModel.findOne({ name });

        if (categoryExists) {
            return sendConflict(res, "Category already exists");
        }

        const updateData = {
            name,
            slug,
            roomId
        };

        if (req.file) {

            // Cloudinary URL
            updateData.image = req.file.path;
        }

        await CategoryModel.findByIdAndUpdate(
            id,
            updateData,
            { returnDocument: 'after' }
        );

        return sendSuccess(
            res,
            "Category updated successfully"
        );

    }
    catch (error) {

        console.log(error);

        return sendServerError(
            res,
            "Internal Server Error"
        );
    }
};

//Wood



const deleteById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await CategoryModel.findById({ _id: id });
        if (!category) return sendNotFound(res);
        await CategoryModel.findByIdAndDelete(id)

        sendSuccess(res, "Delete Sucessfully")

    } catch (error) {
        sendServerError(res, "Internal Server Error")
    }

}

const StatusUpdate = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await CategoryModel.findById({ _id: id });
        if (!category) return sendNotFound(res);
        await CategoryModel.findByIdAndUpdate(
            { _id: id },
            {
                $set: {
                    status: !category.status
                }
            }

        )

        sendSuccess(res, "Data Update Sucessfully")

    } catch (error) {
        sendServerError(res, "Internal Server Error")
    }

}

export {
    get,
    create,
    StatusUpdate,
    deleteById,
    getById,
    update
}