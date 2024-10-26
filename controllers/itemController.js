const db = require("../models");
const ExcelJS = require('exceljs');



exports.dashboard = async (req, res) => {
    try {
        const pradeshData = await db.pradesh.findAll({
            attributes: [
                'pId',
                'newNameEng',
                'newNameGuj',
                'lastNameEng',
                'lastNameGuj',
                'pSantEng',
                'pSantGuj',
                'area',
                'contPerson',
                'contPersonNo',
                // Subquery for total assigned quantity
                [
                    db.Sequelize.literal(`
                        (
                            SELECT COUNT(*)
                            FROM itemass_masters AS assigned
                            WHERE assigned.pId = pradesh_master.pId
                        )
                    `),
                    'totalAssignedQty'
                ],
                // Subquery for total received quantity
                [
                    db.Sequelize.literal(`
                        (
                            SELECT COUNT(*)
                            FROM itemrecs AS received
                            WHERE received.pId = pradesh_master.pId
                              AND EXISTS (
                                  SELECT 1
                                  FROM itemass_masters AS assigned
                                  WHERE assigned.pId = pradesh_master.pId
                                    AND assigned.itemId = received.itemId
                              )
                        )
                    `),
                    'totalReceivedQty'
                ],
                // Subquery for percentage calculation
                [
                    db.Sequelize.literal(`
                        (
                            SELECT 
                                CASE 
                                    WHEN (SELECT SUM(assigned.qty) 
                                          FROM itemass_masters AS assigned 
                                          WHERE assigned.pId = pradesh_master.pId) = 0
                                    THEN 0
                                    ELSE 
                                        ROUND(
                                            (
                                                (SELECT SUM(received.qty) 
                                                 FROM itemrecs AS received 
                                                 WHERE received.pId = pradesh_master.pId
                                                   AND EXISTS (
                                                       SELECT 1 
                                                       FROM itemass_masters AS assigned 
                                                       WHERE assigned.pId = pradesh_master.pId 
                                                         AND assigned.itemId = received.itemId
                                                   )
                                                ) * 100.0
                                            ) / 
                                            (SELECT SUM(assigned.qty) 
                                             FROM itemass_masters AS assigned 
                                             WHERE assigned.pId = pradesh_master.pId),
                                            2
                                        )
                                END
                        )
                    `),
                    'receivedPercentage'
                ]
            ],
            raw: true, // Fetch plain JavaScript objects
        });

        return res.status(200).json({
            status: 'success',
            data: pradeshData
        });

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
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
        // Step 1: Get pradeshId from request body
        const { pradeshId } = req.body;

        // Step 2: Fetch specified Pradesh data
        const pradeshData = await db.pradesh.findOne({
            where: { pId: pradeshId },
            raw: true
        });

        if (!pradeshData) {
            return res.status(404).json({
                status: 'error',
                message: 'Pradesh not found'
            });
        }

        // Step 3: Fetch assigned items with totals
        const assignedItems = await db.itemAss.findAll({
            attributes: [
                'itemId',
                [db.sequelize.fn('SUM', db.sequelize.col('qty')), 'totalAssigned']
            ],
            where: { pId: pradeshId },
            group: ['itemId'],
            raw: true
        });

        // Step 4: Fetch received items with totals
        const receivedItems = await db.itemRec.findAll({
            attributes: [
                'itemId',
                [db.sequelize.fn('SUM', db.sequelize.col('qty')), 'totalReceived']
            ],
            where: { pId: pradeshId },
            group: ['itemId'],
            raw: true
        });

        const receivedDict = receivedItems.reduce((acc, item) => {
            acc[item.itemId] = item.totalReceived;
            return acc;
        }, {});

        // Step 5: Fetch item details (regular items)
        const items = await db.item.findAll({
            attributes: ['itemId', 'nameEng', 'nameGuj', 'unit'],
            where: {
                itemId: assignedItems.map(item => item.itemId)
            },
            raw: true
        });

        // Step 6: Fetch 'other' items for the Pradesh
        const otherItems = await db.other.findAll({
            where: { pId: pradeshId },
            raw: true
        });

        // Step 7: Map regular items with their details
        const itemsWithDetails = items.map(item => {
            const assigned = assignedItems.find(a => a.itemId === item.itemId) || { totalAssigned: 0 };
            const totalReceived = receivedDict[item.itemId] || 0;

            return {
                pId: pradeshData.pId,
                itemId: item.itemId,
                totalAssigned: assigned.totalAssigned,
                totalReceived,
                nameEng: item.nameEng,
                nameGuj: item.nameGuj,
                unit: item.unit,
                isOther: false // Regular item flag
            };
        });

        // Step 8: Map 'other' items with their details
        const otherItemsWithDetails = otherItems.map(other => ({
            pId: pradeshData.pId,
            itemId: null, // No itemId in 'other'
            totalAssigned: "0",
            totalReceived: other.qty,
            nameEng: other.itemName, // Assuming 'itemName' holds the name in 'other'
            nameGuj: other.itemName, // Same for Gujarati name if available
            unit: other.unit, // Or any default value
            isOther: true // Flag for 'other' items
        }));

        // Step 9: Combine both regular and 'other' items
        const allItems = [...itemsWithDetails, ...otherItemsWithDetails];

        // Step 10: Combine Pradesh data and items
        const finalData = {
            ...pradeshData,
            items: allItems
        };

        // Step 11: Send the response
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

exports.downloadPradeshReceivedItems = async (req, res) => {
    try {
        const pradeshData = await db.pradesh.findAll({
            attributes: ['pId', 'lastNameEng', 'pSantEng', 'contPerson', 'contPersonNo'],
            include: [
                {
                    model: db.itemRec,
                    as: 'receivedItems',
                    attributes: ['qty', 'createdAt', 'dePerson', 'dePerCont', 'reference', 'remark', 'createdBy'],
                    include: [
                        {
                            model: db.item,
                            as: 'itemDetails',
                            attributes: ['nameEng', 'nameGuj', 'unit']
                        },
                        {
                            model: db.user,
                            as: 'createdByname',
                            attributes: ['name']
                        }
                    ]
                }
            ]
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Pradesh Received Items');

        worksheet.columns = [
            { header: 'Pradesh Name', key: 'lastNameEng', width: 30 },
            { header: 'Sant Name', key: 'pSantEng', width: 25 },
            { header: 'Contact Person', key: 'contPerson', width: 25 },
            { header: 'Contact No', key: 'contPersonNo', width: 15 },
            { header: 'Item Name (Eng)', key: 'nameEng', width: 25 },
            { header: 'Item Name (Guj)', key: 'nameGuj', width: 25 },
            { header: 'Unit', key: 'unit', width: 15 },
            { header: 'Quantity', key: 'qty', width: 15 },
            { header: 'Received Date', key: 'receivedDate', width: 20 },
            { header: 'Delivered By', key: 'dePerson', width: 25 },
            { header: 'Contact', key: 'dePerCont', width: 15 },
            { header: 'Reference', key: 'reference', width: 20 },
            { header: 'Remarks', key: 'remark', width: 30 },
            { header: 'Created By', key: 'createdByname', width: 25 }
        ];

        pradeshData.forEach((pradesh) => {
            pradesh.receivedItems.forEach((item) => {
                worksheet.addRow({
                    pId: pradesh.pId,
                    lastNameEng: pradesh.lastNameEng,
                    pSantEng: pradesh.pSantEng,
                    contPerson: pradesh.contPerson,
                    contPersonNo: pradesh.contPersonNo,
                    nameEng: item.itemDetails?.nameEng || 'N/A',
                    nameGuj: item.itemDetails?.nameGuj || 'N/A',
                    unit: item.itemDetails?.unit || 'N/A',
                    qty: item.qty || 'N/A',
                    receivedDate: item.createdAt?.toISOString().split('T')[0] || 'N/A',
                    dePerson: item.dePerson || 'N/A',
                    dePerCont: item.dePerCont || 'N/A',
                    reference: item.reference || 'N/A',
                    remark: item.remark || 'N/A',
                    createdByname: item.createdByname?.name || 'N/A'
                });
            });
        });

        // Set response headers for Excel file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="Pradesh_Received_Items.xlsx"');

        // Write workbook directly to the response
        await workbook.xlsx.write(res);
        res.end();  // Ensure the response is properly closed

    } catch (error) {
        console.error('Error generating Excel file:', error);
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong while generating the Excel file.'
        });
    }
};


exports.addReceiveItem = async (req, res) => {
    const { pId, dePerson, dePerCont, reference, remark, items, unit, createdBy } = req.body;

    if (!pId || !dePerson || !dePerCont || !reference || !Array.isArray(items)) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid input. Please provide all required fields.'
        });
    }

    try {
        // Array for entries in both `itemRec` and `other` tables
        const itemRecEntries = [];
        const otherEntries = [];

        // Process each item in the request
        items.forEach(item => {
            if (item.isOther) {
                // Add to `other` table entries if item is marked as "other"
                otherEntries.push({
                    pId,
                    itemName: item.itemName,
                    qty: item.qty,
                    unit: item.unit,
                    dePerson,
                    dePerCont,
                    reference,
                    remark,
                    createdBy,
                });
            } else {
                // Add to `itemRec` table entries for existing items
                itemRecEntries.push({
                    pId,
                    itemId: item.itemId,
                    qty: item.qty,
                    dePerson,
                    dePerCont,
                    reference,
                    remark,
                    createdBy
                });
            }
        });

        // Insert records into `itemRec` if any exist
        if (itemRecEntries.length) {
            await db.itemRec.bulkCreate(itemRecEntries);
        }

        // Insert records into `other` if any exist
        if (otherEntries.length) {
            await db.other.bulkCreate(otherEntries);
        }

        return res.status(201).json({
            status: 'success',
            message: 'Items received successfully.'
        });
    } catch (error) {
        console.error('Error adding received items:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Something went wrong while adding received items.'
        });
    }
};
