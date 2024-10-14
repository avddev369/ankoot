const jwt = require('jsonwebtoken');
const db = require("../models");
const myRes = require("../utils/responseHandler");



exports.dasboard = async (req, res) => {
    try {
        // Query all Pradesh masters along with total assigned and received items
        const pradeshData = await db.pradesh.findAll({
            attributes: [
                'pId',
                'newNameEng',
                'newNameGuj',
                'pSantEng',
                'pSantGuj',
                'area',
                'contPerson',
                'contPersonNo'
            ],
            include: [
                {
                    model: db.itemAss,
                    as: 'assignedItems',
                    attributes: [
                        [db.Sequelize.fn('COUNT', db.Sequelize.col('assignedItems.itemAssId')), 'totalAssigned']
                    ]
                },
                {
                    model: db.itemRec,
                    as: 'receivedItems',
                    attributes: [
                        [db.Sequelize.fn('COUNT', db.Sequelize.col('receivedItems.itemRecId')), 'totalReceived']
                    ]
                }
            ],
            group: ['pradesh_master.pId']
        });
    
        // Flatten the nested structure to bring counts to the top level
        const flattenedData = pradeshData.map(pradesh => {
            const totalAssigned = pradesh.assignedItems[0]?.dataValues.totalAssigned || 0;
            const totalReceived = pradesh.receivedItems[0]?.dataValues.totalReceived || 0;
    
            // Return a flat object with all necessary fields
            return {
                pId: pradesh.pId,
                newNameEng: pradesh.newNameEng,
                newNameGuj: pradesh.newNameGuj,
                pSantEng: pradesh.pSantEng,
                pSantGuj: pradesh.pSantGuj,
                area: pradesh.area,
                contPerson: pradesh.contPerson,
                contPersonNo: pradesh.contPersonNo,
                totalAssigned,
                totalReceived
            };
        });
    
        return res.status(200).json({
            status: 'success',
            data: flattenedData
        });
    
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return res.status(500).json({
            status: 'error',
            message: 'Something went wrong while fetching dashboard data.'
        });
    }    
};

exports.assignItemToPradesh = async (req, res) => {
    try {
        const { pId, itemId, qty } = req.body;
        const year = new Date().getFullYear(); // Get current year dynamically

        // Check if the Pradesh exists
        const pradesh = await db.pradesh.findByPk(pId);
        if (!pradesh) {
            return res.status(404).json({
                status: 'error',
                message: 'Pradesh not found'
            });
        }

        // Check if the Item exists
        const item = await db.item.findByPk(itemId);
        if (!item) {
            return res.status(404).json({
                status: 'error',
                message: 'Item not found'
            });
        }

        // Create a new item assignment record
        const newAssignment = await db.itemAss.create({
            pId,
            itemId,
            qty,
            year
        });

        return res.status(201).json({
            status: 'success',
            message: 'Item assigned to Pradesh successfully',
            data: newAssignment
        });

    } catch (error) {
        console.error("Error assigning item to Pradesh:", error);
        return res.status(500).json({
            status: 'error',
            message: 'Something went wrong while assigning the item to Pradesh'
        });
    }
};

exports.getPradeshItemsDetails = async (req, res) => {
    try {
        // Step 1: Get pradeshId from request parameters
        const { pradeshId } = req.body;

        // Step 2: Fetch specified Pradesh data
        const pradeshData = await db.pradesh.findOne({
            where: { pId: pradeshId },
            raw: true
        });

        // Check if pradeshData is found
        if (!pradeshData) {
            return res.status(404).json({
                status: 'error',
                message: 'Pradesh not found'
            });
        }

        // Step 3: Fetch assigned items with totals grouped by pId and itemId
        const assignedItems = await db.itemAss.findAll({
            attributes: [
                'itemId',
                [db.sequelize.fn('SUM', db.sequelize.col('qty')), 'totalAssigned']
            ],
            where: { pId: pradeshId }, // Filter by pradeshId
            group: ['itemId'],
            raw: true
        });

        // Step 4: Fetch received items with totals grouped by itemId
        const receivedItems = await db.itemRec.findAll({
            attributes: [
                'itemId',
                [db.sequelize.fn('SUM', db.sequelize.col('qty')), 'totalReceived']
            ],
            where: { pId: pradeshId }, // Filter by pradeshId
            group: ['itemId'],
            raw: true
        });

        // Step 5: Create a dictionary for received items
        const receivedDict = receivedItems.reduce((acc, item) => {
            acc[item.itemId] = item.totalReceived;
            return acc;
        }, {});

        // Step 6: Fetch item details for all assigned items
        const items = await db.item.findAll({
            attributes: ['itemId', 'nameEng', 'nameGuj'],
            where: {
                itemId: assignedItems.map(item => item.itemId)
            },
            raw: true
        });

        // Step 7: Combine data to reflect left outer join
        const itemsWithDetails = items.map(item => {
            const assigned = assignedItems.find(a => a.itemId === item.itemId) || { totalAssigned: 0 };
            const totalReceived = receivedDict[item.itemId] || 0;

            return {
                pId: pradeshData.pId,
                itemId: item.itemId,
                totalAssigned: assigned.totalAssigned,
                totalReceived,
                nameEng: item.nameEng,
                nameGuj: item.nameGuj
            };
        });

        // Step 8: Combine Pradesh data and items
        const finalData = {
            ...pradeshData,
            items: itemsWithDetails
        };

        // Step 9: Send the response
        return res.status(200).json({
            status: 'success',
            data: finalData
        });

    } catch (error) {
        console.error("Error fetching Pradesh items details:", error);
        return res.status(500).json({
            status: 'error',
            message: 'Something went wrong while fetching Pradesh items details'
        });
    }
};