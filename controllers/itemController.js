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
                // Subquery for total assigned items
                [
                    db.Sequelize.literal(`
                        (
                            SELECT COUNT(*)
                            FROM itemass_masters AS assigned
                            WHERE assigned.pId = pradesh_master.pId
                        )
                    `),
                    'totalAssigned'
                ],
                // Subquery for total received items, including "other" items
                [
                    db.Sequelize.literal(`
                        (
                            SELECT 
                                COUNT(DISTINCT received.itemId) + 
                                (SELECT COUNT(*) 
                                 FROM others 
                                 WHERE others.pId = pradesh_master.pId)
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
                    'totalReceived'
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
        // Step 1: Fetch all Pradesh data with received items and item names
        const pradeshData = await db.pradesh.findAll({
            attributes: ['pId', 'newNameEng', 'pSantEng', 'contPerson', 'contPersonNo'],
            include: [
                {
                    model: db.itemRec,
                    as: 'receivedItems',
                    attributes: ['itemId', 'createdAt',],
                    include: [
                        {
                            model: db.item, // Assuming your item table is named 'items'
                            as: 'itemDetails',
                            attributes: ['nameEng','nameGuj'] // Fetch the item name
                        }
                    ]
                }
            ]
        });

        // Step 2: Create a new Excel workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Pradesh Received Items');

        // Step 3: Define columns for the worksheet
        worksheet.columns = [
            { header: 'Pradesh ID', key: 'pId', width: 15 },
            { header: 'Pradesh Name', key: 'newNameEng', width: 30 },
            { header: 'Sant Name', key: 'pSantEng', width: 25 },
            { header: 'Contact Person', key: 'contPerson', width: 25 },
            { header: 'Contact No', key: 'contPersonNo', width: 15 },
            // { header: 'Item ID', key: 'itemId', width: 15 },
            { header: 'Item Eng', key: 'nameEng', width: 25 },
            { header: 'Item Guj', key: 'nameGuj', width: 25 },
            { header: 'Received Date', key: 'receivedDate', width: 20 }
        ];

        // Step 4: Populate the worksheet with data
        pradeshData.forEach(pradesh => {
            pradesh.receivedItems.forEach(item => {
                worksheet.addRow({
                    pId: pradesh.pId,
                    newNameEng: pradesh.newNameEng,
                    pSantEng: pradesh.pSantEng,
                    contPerson: pradesh.contPerson,
                    contPersonNo: pradesh.contPersonNo,
                    itemId: item.itemId,
                    nameEng: item.itemDetails?.nameEng || 'N/A', // Use item name from association
                    nameGuj: item.itemDetails?.nameGuj || 'N/A', // Use item name from association
                    receivedDate: item.createdAt.toISOString().split('T')[0] // Format date to YYYY-MM-DD
                });
            });
        });

        // Step 5: Set response headers to trigger Excel download
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename="Pradesh_Received_Items.xlsx"'
        );

        // Step 6: Write the workbook to the response stream
        await workbook.xlsx.write(res);
        res.end(); // End the response after streaming the file
    } catch (error) {
        console.error('Error generating Excel file:', error);
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong while generating the Excel file.'
        });
    }
};

exports.addReceiveItem = async (req, res) => {
    const { pId, dePerson, dePerCont, reference, remark, items, unit} = req.body;

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
                    dePerson,
                    dePerCont,
                    reference,
                    remark,
                    unit
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
                    remark
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
