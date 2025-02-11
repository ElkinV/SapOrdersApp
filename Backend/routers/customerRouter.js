import express from "express";
import sapQuery from "../utils/odbcSap.js";
import {expressjwt} from "express-jwt";
import dotenv from "dotenv";
dotenv.config();

let customerRouter = express.Router();
const connectionString = process.env.DB_CONNECTION_STRING;
const schema = process.env.SAP_COMPANY_DB;
const secret = process.env.JWT_KEY;

customerRouter.get('/list', expressjwt ({ secret, algorithms: ['HS256'] }),async (req, res) => {
    try {
        const result= await sapQuery(connectionString, schema,'SELECT  "CardCode", "CardName", "CardType", "ListNum" FROM "OCRD" WHERE "CardType"=\'C\' ORDER BY "CardName"' );
        console.log(result);

        const items = result.map(item => ({
            id: item.CardCode,
            name: item.CardName,
            priceList: item.ListNum
        }));

        res.json(items);
    } catch (error) {
        console.error('Error in /api/customers:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

export default customerRouter;