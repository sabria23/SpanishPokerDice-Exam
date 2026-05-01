
// Global error handler - catches any unhandled errors and sends a clean response

export function errorHandler(err, req, res, next) {
    // error stack trace
    console.error(err.stack);

    // Use the error's status code if it has one, otherwise default to 500
    res.status(err.status || 500).json({
        msg: err.message || "Internal server error"
    });
}

export default {
    errorHandler
};