import { connect } from "mongoose";
const connectDatabase = async () => {
  try {
    const dbInstance = await connect(
      `${process.env.DATABASE_URI}/${process.env.DB_NAME}`
    );
    console.log(
      `Mongodb connection successful!! \nHost: ${dbInstance.connection.host}`
    );
  } catch (error) {
    console.error(`Mongodb connection error: ${error}`);
    process.exit(1);
  }
};

export default connectDatabase;
