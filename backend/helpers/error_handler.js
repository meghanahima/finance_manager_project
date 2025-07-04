const processRequest = (err, data, res) =>{
    // error(bad request)
    if (err){
        return res
        .status(400)
        .json({
            success: false,
            message: err?.message ? err.message : "Something went wrong"
        });
    }

    // data not found
    if (!data){
        return res
        .status(404)
        .json({
            success: false,
            message: "Data not found"
        });
    }

    // success processing request
    return res
    .status(200)
    .json({
        success: true,
        data: data,
        message: data?.message
    });
}

module.exports = {processRequest};