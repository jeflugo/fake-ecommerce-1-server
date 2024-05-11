import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";

const app = express();
const PORT = process.env.PORT | 3000;

app.use(morgan("tiny"));

app.listen(PORT, () => console.log(`Running on port: ${PORT}`));
