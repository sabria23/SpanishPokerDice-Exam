/* this is the same code as the inclass code we've been doing in IDG2100 Fullstack 2026*/
import mongoose from "mongoose";

const { DB_HOSTNAME, DB_PORT, DB_NAME} = process.env;

const CONNECTION_URI = `mongodb://${DB_HOSTNAME}:${DB_PORT}/${DB_NAME}`;
console.log(CONNECTION_URI);

export async function connectDB() {
	if(DB_HOSTNAME && DB_PORT && DB_NAME) {
		mongoose.connection.on("error", err => {
			console.error("Unhandled Mongoose/MongoDB connection error:", err);
		});

		console.log("Connecting to MongoDB now", CONNECTION_URI);
		return mongoose.connect(
			CONNECTION_URI,
			{
				appName: DB_NAME,
				maxPoolSize: 100
			}
		);
	}

	throw new Error(`Missing env variables needed to connect to mongoDB: ${DB_HOSTNAME}, ${DB_PORT}, ${DB_NAME}`);
}

export async function disconnectDB(){
	return mongoose.disconnect();
}