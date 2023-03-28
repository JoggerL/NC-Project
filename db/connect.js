const MongoClient = require('mongodb').MongoClient;

const databaseURL = process.env.MONGOURL || "";

// Create a new MongoClient instance.
const client = new MongoClient(databaseURL);

async function connectToDatabase() {
    let conn;
// Connect to MongoDB
    try {
        conn = await client.connect();
    } catch (e) {
        console.error(e);
    }

    let db = conn.db("NC");
    return db;

}

// export default connectToDatabase;
module.exports = connectToDatabase();