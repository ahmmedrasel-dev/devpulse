import app from "./app";
import { initDB } from "./db/db";
import config from "./config";

const main = async () => {
  try {
    initDB();
    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  } catch (error: any) {
    console.error('Failed to start server:', error);
  }
};

main();
