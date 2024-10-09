const { json } = require("body-parser");

exports.successResponse = ( res, data) => {
  const response = {
    "errorStatus":false,
    "data":data
  }
  res.status(200).json(response);
}

exports.errorResponse = (res, data) => {
    const response = {
      "errorStatus":true,
      "msg":data
    }
    res.status(200).json(response);
}

exports.errorParamResponse = (res, data) => {
    const response = {
      "errorStatus":true,
      "msg":data
    }
    res.status(400).json(response);
}


exports.errorTokenResponse = (res) => {
    const response = {
      "errorStatus":true,
      "msg":"Unauthorized Access"
    }
    res.status(401).json(response);
}



