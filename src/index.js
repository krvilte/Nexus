import "dotenv/config";
import connectDatabase from "./db";
import app from "./app";

const port = process.env.PORT || 8000;

// Connect to the database
connectDatabase()
  .then(() => {
    app.on("error", (error) => {
      console.error("Server error: ", error);
      throw error;
    });

    app.listen(port, () => {
      console.log(`Server is running at port: ${port}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed: ", error);
    process.exit(1);
  });
