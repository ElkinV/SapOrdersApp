import express from 'express';
import odbc from 'odbc';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { encrypt, decrypt } from './encryptUtils.js';
import { loginToServiceLayer, logoutToServiceLayer, agent, serviceLayerUrl } from './SapLogin.js';


dotenv.config();

const app = express();
const port = 3001;
let token = null

app.use(cors());
app.use(express.json());

const connectionString = process.env.DB_CONNECTION_STRING;



// Endpoint para cifrar datos
app.post('/api/encrypt', (req, res) => {
  const { text, key } = req.body;
  if (!text || !key) {
    return res.status(400).json({ error: 'Text and encryption key are required' });
  }
  try {
    const encryptedText = encrypt(text, key);
    res.json({ encrypted: encryptedText });
  } catch (error) {
    res.status(500).json({ error: 'Encryption failed' });
  }
});

// Endpoint para descifrar datos
app.post('/api/decrypt', (req, res) => {
  const { encryptedText, key } = req.body;
  if (!encryptedText || !key) {
    return res.status(400).json({ error: 'Encrypted text and encryption key are required' });
  }
  try {
    const decryptedText = decrypt(encryptedText, key);
    res.json({ decrypted: decryptedText });
  } catch (error) {
    res.status(400).json({ error: 'Invalid encrypted text or key' });
  }
});

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
      ${search ? `AND (LOWER("ItemName") LIKE LOWER(REPLACE('${search}', '*', '%')) OR LOWER("ItemCode") = LOWER('${search}'))` : ''}
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

    const { cardCode, items, comments, user } = req.body;

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
      Series: 13,
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
    await connection.query('SET SCHEMA PRUEBA_20241101');

    const result = await connection.query('SELECT  "CardCode", "CardName", "CardType", "ListNum" FROM "OCRD" WHERE "CardType"=\'C\' ORDER BY "CardName"');
    console.log('Query executed successfully');

    const items = result.map(item => ({
      id: item.CardCode,
      name: item.CardName,
      priceList: item.ListNum
    }));
    
    res.json(items);
  } catch (error) {
    console.error('Error in /api/customers:', error);
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

app.get('/api/orderslist', async (req, res) => {
  let connection;
  const { userId } = req.query; // Capturamos el USERID del query string

  try {
    console.log('Attempting to connect to database...');
    connection = await odbc.connect(connectionString);
    console.log('Connected to database successfully');

    await connection.query('SET SCHEMA PRUEBA_20241101');
    const result = await connection.query('SELECT top 20 "CardCode", "CardName", "DocDate" FROM "ORDR" WHERE "U_RL_Origen"=\'WEBAPP\' and "U_RL_Usuario"=' + `\'${userId}\'`);

    const orders = result.map(item => ({
      cardCode: item.CardCode,
      cardName: item.CardName,
      date: item.DocDate,
    }));

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Error fetching orders', details: error.message });
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

app.get('/api/item-price', async (req, res) => {
  let connection;
  const { itemCode, priceList } = req.query; // Capturamos itemCode y priceList del query string

  try {
    console.log('Attempting to connect to database...');
    connection = await odbc.connect(connectionString);
    console.log('Connected to database successfully');

    console.log('Executing query...');
    await connection.query('SET SCHEMA RYLPHARMA');

    const query = `
      SELECT "Price" 
      FROM "ITM1" 
      WHERE "ItemCode" = ? AND "PriceList" = ?
    `;

    const result = await connection.query(query, [itemCode, priceList]);
    console.log('Query executed successfully');

    if (result.length > 0) {
      res.json({ price: result[0].Price });
    } else {
      res.status(404).json({ error: 'Price not found' });
    }
  } catch (error) {
    console.error('Error in /api/item-price:', error);
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

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  let connection;

  try{
    console.log('Attempting to connect to database...');
    connection = await odbc.connect(connectionString);
    console.log('Connected to database successfully');

    console.log('Executing query...');
    await connection.query('SET SCHEMA RYLPHARMA');

    let query = 'select "U_RL_ClaveWeb", "USER_CODE"  from OUSR where "USERID"=\'WEBAPP\' and "USERID"='+  `'${username}'`
    console.log(query)
    const result = await connection.query('select "U_RL_ClaveWeb", "USER_CODE"  from OUSR where "USER_CODE"=\''+username.toString()+"\'" );
    console.log(result[0])

    let credentials = result[0]
    let password1 = credentials.U_RL_ClaveWeb.toString()

    const password_decrypt = decrypt(password1, "RL")
    console.log("PASSWORD"+password_decrypt+"OTRA "+password);



    if (username === credentials.USER_CODE && password === password_decrypt) {

      const token = 'your_generated_token'; // Reemplaza esto con un token real
      res.json({password1, token });
    } else {
      res.status(401).json({ error: 'Credenciales inválidas' });
    }

  }catch(error){
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Error login', details: error.message });
  }


});

app.get('/api/get-userid', async (req, res) => {
  let connection;
  const { username } = req.query; // Capturamos el username del query string

  try {
    console.log('Attempting to connect to database...');
    connection = await odbc.connect(connectionString);
    console.log('Connected to database successfully');

    console.log('Executing query...');
    await connection.query('SET SCHEMA RYLPHARMA');

    const query = `
      SELECT "USERID" 
      FROM "OUSR" 
      WHERE "USER_CODE" = ?
    `;

    const result = await connection.query(query, [username]);
    console.log('Query executed successfully');

    if (result.length > 0) {
      res.json({ USERID: result[0].USERID });
    } else {
      res.status(404).json({ error: 'USERID not found' });
    }
  } catch (error) {
    console.error('Error in /api/get-userid:', error);
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








