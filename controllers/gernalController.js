const db = require("../models");
const myRes = require("../utils/responseHandler");

exports.insertData = async (req, res) => {
    try {
      const { table } = req.body;
  
      if (!table) {
        return myRes.errorResponse(res, "Table name not provided.");
      }
  
      const fieldsToInsert = req.body || {};
      const validFields = Object.keys(fieldsToInsert).filter(field => field !== "table");
  
      if (!validFields.length) {
        return myRes.errorResponse(res, "No valid fields provided for insert.");
      }
  
      const dynamicModel = db[table];
  
      if (!dynamicModel) {
        return myRes.errorResponse(res, "Table Not Found");
      }
  
      const newRecord = dynamicModel.build();
  
      validFields.forEach((field) => {
        newRecord[field] = fieldsToInsert[field];
      });
  
      var resd = await newRecord.save();
  
      myRes.successResponse(res, { msg: `${table} data inserted successfully.`, id: resd });
    } catch (error) {
      myRes.errorResponse(res, error.message);
    }
  };

exports.updateData = async (req, res) => {
    try {
        const { table, id } = req.body;

        if (!table || !id) {
            return myRes.errorResponse(res, "Table or ID not provided.");
        }

        const dynamicModel = db[table];

        if (!dynamicModel) {
            return myRes.errorResponse(res, "Table Not Found");
        }

        let existingData = await dynamicModel.findByPk(id);

        if (!existingData) {
            return myRes.errorResponse(res, "Data not found.");
        }

        const fieldsToUpdate = req.body || {};
        const validFields = Object.keys(fieldsToUpdate).filter(field => !(field === "table" || field === "id"));

        if (!validFields.length) {
            return myRes.errorResponse(res, "No valid fields provided for update.");
        }

        // Update the fields
        await existingData.update(fieldsToUpdate);

        // Return the updated record
        existingData = await dynamicModel.findByPk(id);
        myRes.successResponse(res, existingData);
    } catch (error) {
        myRes.errorResponse(res, error.message);
    }
};


exports.getData = async (req, res) => {
    try {
        const { table, filters } = req.body;

        if (!table) {
            return myRes.errorResponse(res, "Table name not provided.");
        }

        const dynamicModel = db[table];

        if (!dynamicModel) {
            return myRes.errorResponse(res, "Table Not Found");
        }

        // Construct the query options
        const queryOptions = {};

        if (filters) {
            queryOptions.where = filters;
        }

        // Fetch records based on filters
        const records = await dynamicModel.findAll(queryOptions);

        myRes.successResponse(res, records);
    } catch (error) {
        myRes.errorResponse(res, error.message);
    }
};


exports.deleteData = async (req, res) => {
    try {
        const { table, id } = req.body;

        if (!table || !id) {
            return myRes.errorResponse(res, "Table name or ID not provided.");
        }

        const dynamicModel = db[table];

        if (!dynamicModel) {
            return myRes.errorResponse(res, "Table not found.");
        }

        const record = await dynamicModel.findByPk(id);

        if (!record) {
            return myRes.errorResponse(res, "Record not found.");
        }

        await record.destroy();

        myRes.successResponse(res, { success: true, message: 'Record deleted successfully.' });
    } catch (error) {
        console.error('Error deleting record:', error);
        myRes.errorResponse(res, error.message);
    }
};
