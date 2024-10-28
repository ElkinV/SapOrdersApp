import express from 'express';
import odbc from 'odbc';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
// Importar las funciones de SapLogin.js
import { loginToServiceLayer, logoutToServiceLayer, agent, serviceLayerUrl } from './SapLogin.js';


dotenv.config();

const app = express();
const port = 3001;
let token = null

app.use(cors());
app.use(express.json());

const connectionString = process.env.DB_CONNECTION_STRING;

app.get('/api/items', async (req, res) => {
  let connection;
  const search = req.query.search; // Capturamos el término de búsqueda del query string

  try {
    console.log('Attempting to connect to database...');
    connection = await odbc.connect(connectionString);
    console.log('Connected to database successfully');

    console.log('Executing query...');
    await connection.query('SET SCHEMA RYLPHARMA');

    // Modificamos la consulta para que incluya el filtro de búsqueda
    const query = `
      SELECT "ItemCode", "ItemName"
      FROM "OITM"
      WHERE "frozenFor" = 'N'
      ${search ? `AND (LOWER("ItemName") LIKE LOWER('%${search}%') OR LOWER("ItemCode") = LOWER('${search}'))` : ''}
      ORDER BY "ItemName"
    `;

    const result = await connection.query(query);
    console.log('Query executed successfully');

    const items = result.map(item => ({
      id: item.ItemCode,
      name: item.ItemName,
    }));

    res.json(items);
  } catch (error) {
    console.error('Error in /api/items:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('Database connection closed');
      } catch (closeError) {
        console.error('Error closing database connection:', closeError);
      }
    }
  }
});

app.post('/api/orders', async (req, res) => {
  try {


    token = await loginToServiceLayer();


    const { cardCode, items, comments } = req.body;

    let orderData = {
      DocDueDate: "20241024",
      CardCode: cardCode,
      DocCurrency: "$",
      Series: 13,
      Rate: 0.0,
      Comments: comments,
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

    console.log(response);
    console.log('Order created in SAP HANA:', response.data);

    // Realiza el logout después de crear el pedido
    await logoutToServiceLayer(token);


    res.status(201).json({ message: 'Order created successfully', sapOrderId: response.data.DocEntry });
  } catch (error) {
    console.error('Error creating order in SAP HANA:', error.message);
    res.status(500).json({ error: 'Error creating order', details: error });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Database connection string:', connectionString);
});


app.get('/api/customers', async (req, res) => {
  let connection;
  try {
    console.log('Attempting to connect to database...');
    connection = await odbc.connect(connectionString);
    console.log('Connected to database successfully');

    console.log('Executing query...');
    await connection.query('SET SCHEMA PRUEBA_20240715');

    const result = await connection.query('SELECT   "CardCode" , "CardName", "CardType"  FROM "OCRD" where "CardType"=\'C\' ORDER BY "CardName"');
    console.log('Query executed successfully');
    //console.log(result);

    const items = result.map(item => ({
      id: item.CardCode,
      name: item.CardName,
      //price: parseFloat(item.ItemPrice)
    }));
    
    res.json(items);
  } catch (error) {
    console.error('Error in /api/items:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('Database connection closed');
      } catch (closeError) {
        console.error('Error closing database connection:', closeError);
      }
    }
  }
});








