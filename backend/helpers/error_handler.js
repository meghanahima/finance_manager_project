const processRequest = (err, data, res) =>{
    if (err){
        return res
        .status(400)
        .json({
            success: false,
            message: err?.message ? err.message : "Something went wrong"
        });
    }
    if (!data){
        return res
        .status(404)
        .json({
            success: false,
            message: "Data not found"
        });
    }
    return res
    .status(200)
    .json({
        success: true,
        data: data,
        message: data?.message
    });
}

module.exports = {processRequest};