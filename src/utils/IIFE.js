// a short hand solution to connect the db with server via IIFE
// ;(async () => {
//   try {
//     // console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);
//     // console.log("DB_NAME:", DB_NAME);

//     const databaseConnection = await mongoose.connect(
//       `${process.env.MONGODB_URI}/${DB_NAME}`
//     );

//     console.log(
//       "Database connected Successfully with Host: ",
//       databaseConnection.connection.host
//     );
//   } catch (error) {
//     console.log("MONGODB CONNECTION FAILED", error);
//     process.exit(1);
//   }
// })();