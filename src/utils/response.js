// success response
const sendSuccess = (res, message = "Success") => {
    return res.status(200).json({
        success: true,
        message
    });
}
// created response
const sendCreated = (res, message = "Created Successfully") => {
    return res.status(201).json({
        success: true,
        message
    });
}

// bad request response (validation errors)
const sendBadRequest = (res, message = "Bad Request") => {
    return res.status(400).json({
        success: false,
        message
    });
}

// not found response
const sendNotFound = (res, message = "Resource not Found") => {
    return res.status(404).json({
        success: false,
        message
    });
}
// conflict response (already exists)
const sendConflict = (res, message = "Conflict") => {
    return res.status(409).json({
        success: false,
        message
    });
}

//server error 

const sendServerError = (res, error, message = "Internal Server Error") => {
    console.log(error);
    return res.status(500).json({
        success: false,
        message
    });
}

export {
    sendSuccess,
    sendCreated,
    sendBadRequest,
    sendNotFound,
    sendConflict,
    sendServerError,
};
