import express from "express";
import {expressjwt} from "express-jwt";
import sapQuery from "../utils/odbcSap.js";

let itemRouter = express.Router();
const connectionString = process.env.DB_CONNECTION_STRING;
const schema = process.env.SAP_COMPANY_DB;
const secret = process.env.JWT_KEY;

itemRouter.get('/', expressjwt ({ secret, algorithms: ['HS256'] }),async (req, res) => {
    const search = req.query.search; // Capturamos el término de búsqueda del query string

    try {
        const query = `SELECT "ItemCode", "ItemName" FROM "OITM" 
                              WHERE "frozenFor" = 'N' ${search ? `AND (LOWER("ItemName") LIKE LOWER(REPLACE('${search}', '*', '%')) OR LOWER("ItemCode") = LOWER('${search}'))` : ''}
                              ORDER BY "ItemName"`;

        const result = await sapQuery(connectionString, schema, query);
        console.log('Query executed successfully');

        const items = result.map(item => ({
            itemCode: item.ItemCode,
            name: item.ItemName,
        }));

        res.json(items);
    } catch (error) {
        console.error('Error in /api/items:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

itemRouter.get('/price',  expressjwt ({ secret, algorithms: ['HS256'] }), async (req, res) => {
    const { itemCode, priceList } = req.query; // Capturamos itemCode y priceList del query string

    try {
        const result = await sapQuery(connectionString, schema,`SELECT "Price" FROM "ITM1" WHERE "ItemCode" = ? AND "PriceList" = ?`, [itemCode, priceList] );
        console.log('Query executed successfully');

        if (result.length > 0) {
            res.json({ price: result[0].Price });
        } else {
            res.status(404).json({ error: 'Price not found' });
        }

    } catch (error) {
        console.error('Error in /api/item-price:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});
export default itemRouter;