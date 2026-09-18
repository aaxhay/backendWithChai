import "dotenv/config";

import { dbConnect } from "./db/index.js";
import { app } from "./app.js";
dbConnect()
  .then(
    app.listen(process.env.PORT || 8000),
    console.log(`Server is listening to Port: ${process.env.PORT}`)
  )
  .catch((err) => console.log("ERROR CONNECTING DATABASE : ",err));
