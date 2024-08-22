"use strict";
// load modules
const express = require("express");
const { argv } = require("process");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, '.env') }) 

const uri = process.env.MONGO_CONNECTION_STRING;
const mg_db_name = process.env.MONGO_DB_NAME;
const mg_colletion = process.env.MONGO_COLLECTION;
 /* Our database and collection */
 const databaseAndCollection = {db: mg_db_name, collection: mg_colletion};

/****** DO NOT MODIFY FROM THIS POINT ONE ******/
const { MongoClient, ServerApiVersion } = require('mongodb');
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// read input
if (argv.length != 2) {
  console.log("Usage translationMachine.js");
}
const portNumber = process.env.PORT || 5000;

const axios = require('axios');

const encodedParams = new URLSearchParams();

const options = {
  method: 'POST',
  url: 'https://google-translate1.p.rapidapi.com/language/translate/v2',
  headers: {
    'content-type': 'application/x-www-form-urlencoded',
    'Accept-Encoding': 'application/gzip',
    'X-RapidAPI-Key': 'ENTER_API_KEY_HERE',
    'X-RapidAPI-Host': 'google-translate1.p.rapidapi.com'
  },
  data: encodedParams,
};



// setup server
const app = express();
app.set("views", "templates");


function consoleVer() {
  process.stdin.setEncoding("utf8"); /* encoding */
  
  process.stdin.on('readable', () => {  /* on equivalent to addEventListener */
  
    let dataInput = process.stdin.read();  
	if (dataInput !== null) {
		let command = dataInput.trim();
		switch (command) {
      case "stop":
        console.log("Shutting down the server");
        process.exit(0);
      default:
        console.log("Invalid command: " + command);
        process.stdout.write("Type stop to shutdown the server: ");
    }
    }
});
process.stdin.on('readable', () => {  /* on equivalent to addEventListener */
  
let dataInput = process.stdin.read();  
if (dataInput !== null) {
let command = dataInput.trim();
switch (command) {
  case "stop":
    console.log("Shutting down the server");
    process.exit(0);
  default:
    console.log("Invalid command: " + command);
    process.stdout.write("Type stop to shutdown the server: ");
}
}
});
}
const homeLink = `http://localhost:${portNumber}`;
const procTranslation = homeLink + '/processTranslation';

async function translate(input, source='en',target='es') {
encodedParams.set('q', input);
encodedParams.set('source', source);
encodedParams.set('target', target);

try {
	const response = await axios.request(options);

  let translation = response.data.data.translations[0].translatedText ?? 'Error';
  try {
    await client.connect();
    await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne({input:input, output:translation});
  } catch (e) {
  console.error(e);
  } finally {
  await client.close();
  }
	return translation;
} catch (error) {
	console.error(error);
	return 'Error';
}
}

async function getPastTranslations() {
  try {
    await client.connect();
    let filter = {};
    const cursor = client.db(databaseAndCollection.db)
      .collection(databaseAndCollection.collection)
      .find(filter);

    const result = await cursor.toArray();
    result.reverse();
    let output = result.reduce((output, element) => output += `<li>${element.input} => ${element.output}</li>`, '<ul>');
    output += '</ul>';
    return [output, result.length];
  } catch (error) {
    console.error("Error fetching past translations:", error);
    return ['', 0];
  }
}

function serverVer() {
  
  app.get("/", async (request, response) => {
    let [pastTranslations, totalTranslations] = await getPastTranslations();
    response.render("index.ejs", {formAction: procTranslation, pastTranslations: pastTranslations, totalTranslations: totalTranslations});
  });

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.post("/processTranslation", async (request, response) => {
    let { input, langIn, langOut } = request.body;
    input = input.trim();
    if (input && langIn && langOut) {
      let output = await translate(input, langIn, langOut);
      response.render("processTranslation.ejs", {
        input: input,
        output: output, 
        home: homeLink
      });
    } else {
      let output = "Error:<br><ul>";
      if (!input) {
        output +="<li>No text provided to translate.</li>";
      }
      if (!langIn) {
        output +="<li>No language selected for input.</li>";
      }
      if (!langOut){
        output +="<li>No language selected for output.</li>";
      }
      output += `</ul><br><a href="${homeLink}">Return</a>`;
      response.status(400).send(output);
    }
  });
 
  app.listen(portNumber, () => {
    console.log(`Web server started and running at ${homeLink}`);
    process.stdout.write("Type stop to shutdown the server: ");
  });
}


async function main() {
  serverVer();
  consoleVer();
}
main();
