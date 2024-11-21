import express, { Request, Response } from "express";
import mongoose from 'mongoose';
const cors = require('cors');
const app = express();
require('dotenv').config();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const port = process.env.PORT || 3000;
const dbUrl = process.env.DB_URL || "mongodb+srv://admin:H5UcWElVBrm5pCa4@book-review-project.dakbp.mongodb.net/?retryWrites=true&w=majority&appName=Book-Review-Project";

// middleware setup
app.use(express.json({limit: '25mb'}));
app.use((express.urlencoded({limit: '25mb'})));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

// all routes
const authRoutes = require('./users/user.route');
const booksRoutes = require('./books/books.route');
const reviewsRoutes = require('./reviews/reviews.route');

app.use('/api/auth', authRoutes);
app.use('/api/books',booksRoutes);
app.use('/api/reviews',reviewsRoutes);



main()
.then(()=>console.log("Mongodb is successfully connected."))
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);

  app.get("/", (req: Request, res: Response) => {
    res.send("Express + TypeScript Server");
  });
}



app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});