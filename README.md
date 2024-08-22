# Translation-Machine

## Overview
A simple web application that translates text from one language to another using a MongoDB database. This was built using the [Google Translate API](https://rapidapi.com/googlecloud/api/google-translate1).
Try it for yourself at https://translationmachine.onrender.com/ (may take a while to load).

## Requirements
- Node.js
- npm
- MongoDB

## Setup
1. Clone the repository: `git clone https://github.com/your-username/translation-application.git`
2. Install dependencies: `npm install`
3. Update the `.env` file in the root directory and add your MongoDB credentials:
```
MONGO_DB_USERNAME = "your-mongodb-username"
MONGO_DB_PASSWORD = "your-mongodb-password"
MONGO_DB_NAME = "your-mongodb-database-name"
MONGO_COLLECTION = "translations"
MONGO_CONNECTION_STRING = "your-mongodb-connection-string"
```
4. Update the options in the `translationMachine.ejs` file in the root directory and add you `X-RapidAPI-Key` for Google Translate. You can obtain this at https://rapidapi.com/googlecloud/api/google-translate1
```
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
```

## Running the Application
1. Start the server: `node app.js`
2. Open a web browser and navigate to `http://localhost:5000`

## Usage
- Select a language from the dropdown menus to specify the input and output.
- Enter text to translate in the input field.
- Click the "Translate" button to see the translation result.

## License
This project is licensed under the MIT License. See LICENSE.md for details
