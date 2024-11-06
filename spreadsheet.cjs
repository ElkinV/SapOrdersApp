const {google} = require("googleapis");
const spreadsheetId = "1LsEV6F2kZ__LrfVySL_gWEzsrW3MuV-p-bpIRUVFNUQ"
const range = "ORDENES!A:E"


const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
});
const client =  auth.getClient()
const googleSheets = google.sheets({ version: "v4", auth: client });



/*const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range,
})*/


/*await googleSheets.spreadsheets.values.append({
    auth,spreadsheetId,
    range: "ORDENES!A1",
    valueInputOption: "USER_ENTERED",
    resource:{
        values: [
            [1,2,3,4,5]
        ]
    },
})*/

module.exports= {
    auth,
    spreadsheetId,
    googleSheets
}