import express from "express";
import dotenv from "dotenv";
import {agent, loginToServiceLayer, logoutToServiceLayer, serviceLayerUrl} from "../utils/sapLogin.js";
import axios from "axios";
import sapQuery from "../utils/odbcSap.js";
import {expressjwt} from "express-jwt";
dotenv.config();


let orderRouter = express.Router();
let token = null
const connectionString = process.env.DB_CONNECTION_STRING;
const schema = process.env.SAP_COMPANY_DB;
const secret = process.env.JWT_KEY;


orderRouter.post('/', expressjwt ({ secret, algorithms: ['HS256'] }),async (req, res) => {
    try {
        token = await loginToServiceLayer();

        const { cardCode, items, comments, user ,series} = req.body;

        // Función para formatear la fecha en formato yyyymmdd
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses son 0-indexados
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}${month}${day}`;
        };

        let orderData = {
            TaxDate: formatDate(new Date()), // Usar la función para obtener la fecha formateada
            DocDueDate: formatDate(new Date()),
            CardCode: cardCode,
            DocCurrency: "$",
            Series: series,
            Rate: 0.0,
            Comments: comments,
            U_RL_Origen: "WEBAPP",
            U_RL_Usuario: user,
            DocumentLines: items.map(item => ({
                ItemCode: item.itemCode,
                Quantity: item.quantity,
                UnitPrice: item.unitPrice,
                COGSCostingCode: "2",
                CostingCode2: "2.1"
            }))
        };

        console.log(JSON.stringify(orderData));
        orderData = JSON.stringify(orderData);

        const response = await axios.post(`${serviceLayerUrl}Orders/`, orderData, {
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `B1SESSION=${token}`,
                'Accept': '*/*'
            },
            httpsAgent: agent
        });

        console.log("POST: " + response);
        console.log('Order created in SAP HANA:', response.data);

        // Realiza el logout después de crear el pedido
        await logoutToServiceLayer(token);

        res.status(201).json({ message: 'Order created successfully', sapOrderId: response.data.DocEntry });
    } catch (error) {
        console.error('Error creating order in SAP HANA:', error.response.data.error );

        // Manejo de errores para extraer detalles del Service Layer
        let errorMessage = 'Error creating order';
        if (error.response && error.response.data) {
            // Si hay un mensaje de error del Service Layer, usarlo
            errorMessage = error.response.data.error || errorMessage;
        }

        res.status(500).json({ error: errorMessage, details: error.message });
    }
});


orderRouter.get('/list',expressjwt ({ secret, algorithms: ['HS256'] }), async (req, res) => {
    const { userId } = req.query; // Capturamos el USERID del query string

    try {
        const result = await sapQuery(connectionString, schema,'SELECT top 20 "CardCode", "CardName" AS "CustomerName" , "DocDate", "DocNum" FROM "ORDR" WHERE "U_RL_Origen"=\'WEBAPP\'  and "U_RL_Usuario"=' + `\'${userId}\'`+'ORDER BY "DocDate" desc ' )
        const orders = result.map(item => ({
            cardCode: item.CardCode,
            customerName: item.CustomerName,
            date: item.DocDate,
            docNum: item.DocNum,
        }));

        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Error fetching orders', details: error.message });
    }
});

orderRouter.get('/details',expressjwt ({ secret, algorithms: ['HS256'] }), async (req, res) => {
    const {orderId} = req.query;
    const query = `SELECT PaymentInfo."PymntGroup", OCRD."U_RL_DIASCOTIZA" "VigenciaOrdr", RDR1."ItemCode",RDR1."VatPrcnt", ORDR."Comments",OITM."U_RL_Cod_Cum" "Cum", TO_DATE(OITM."U_RL_FV_Inv") "FV",OITM."U_RL_Reg_Inv" "Invima", TO_DATE(ORDR."DocDate") "DocDate", RDR1."Dscription", RDR1."Quantity", RDR1."U_RL_Margen", RDR1."U_RL_Vence", RDR1."U_RL_VenceMes", ORDR."DocNum", ORDR."U_RL_Origen", OCRD."U_HBT_MailRecep_FE", ORDR."CardName", ORDR."LicTradNum", OCRD."City", OCRD."Address", OCRD."E_Mail" email, OCRD."Phone1", OSLP."SlpName", CASE WHEN ORDR."Series" = 13 THEN 'PediClie' WHEN ORDR."Series" = 83 THEN 'Cotiza' ELSE 'NA' END AS "Series", ITM1."Price" AS "Precio", ORDR."VatSum", ORDR."DocTotal", (ORDR."DocTotal" - ORDR."VatSum") AS "TotalAntesDeImpuestos", (SELECT top 1 "U_NAME" from OUSR a INNER JOIN ORDR b ON b."U_RL_Usuario" = a."USERID") as "NombreUsuario" FROM RDR1 INNER JOIN ORDR ON ORDR."DocEntry" = RDR1."DocEntry" INNER JOIN OCRD ON OCRD."CardCode" = ORDR."CardCode" AND OCRD."CardType" = 'C' INNER JOIN ITM1 ON ITM1."ItemCode" = RDR1."ItemCode" AND ITM1."PriceList" = OCRD."ListNum" INNER JOIN OSLP ON OSLP."SlpCode" = RDR1."SlpCode" INNER JOIN OITM  on OITM."ItemCode" = RDR1."ItemCode" LEFT JOIN(SELECT ORDR."DocNum", OCTG."PymntGroup" from OCTG INNER JOIN ORDR ON ORDR."GroupNum" = OCTG."GroupNum") as PaymentInfo ON PaymentInfo."DocNum" = ORDR."DocNum" WHERE ORDR."DocNum" = ${orderId}`;


    try {
        const result = await sapQuery(connectionString, schema, query )
        const details = result.map(item => ({
            cardCode: item.CardCode,
            cardName: item.CardName,
            itemCode: item.ItemCode,
            description: item.Dscription,
            quantity: item.Quantity,
            price: item.Precio,
            margen: item.U_RL_Margen,
            total: parseInt(item.Quantity) * (item.Precio),
            vence: item.U_RL_Vence,
            venceMes: item.U_RL_VenceMes,
            series: item.Series,
            totalAntesDeImpuestos: item.TotalAntesDeImpuestos,
            impuesto: item.VatSum,
            totalOrdn: item.DocTotal,
            direccion: item.Address,
            email: item.EMAIL,
            vendedor: item.SlpName,
            nit: item.LicTradNum,
            city: item.City,
            telefono: item.Phone1,
            u_name: item.NombreUsuario,
            comments: item.Comments,
            docNum: item.DocNum,
            docDate: item.DocDate,
            cum: item.Cum,
            fechaVence: item.FV,
            regInvima: item.Invima,
            IVA: item.VatPrcnt,
            formaDePago: item.PymntGroup,
            vigenciaOrdr: item.VigenciaOrdr
        }));

        res.json(details);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Error fetching orders', details: error.message });
    }

})
export default orderRouter;