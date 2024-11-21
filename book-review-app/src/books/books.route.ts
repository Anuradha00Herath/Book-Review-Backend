import { Request, Response } from "express";
import Reviews from "../reviews/reviews.model";
import Books from "./books.model";
import verifyToken from "../middleware/verifyToken";
const express = require("express");
const router = express.Router();

interface CustomRequest extends Request {
  userId?: string;
}

//get featured books
router.get("/recent-books", async (req: Request, res: Response) => {
  try {
    const recentBooks = await Books.find().sort({ createdAt: -1 }).limit(2);
    res.status(200).json(recentBooks || []);
  } catch (error) {
    console.error("Error fetching recent books:", error);
    res.status(500).json({ message: "Error fetching recent books", error });
  }
});

// Create a book
router.post("/post-book", verifyToken,async (req: CustomRequest, res: Response) => {
    try {
      const { title, author, rating, comment, addedOn } = req.body;
      console.log(req.body);
      if (!title || !author || !rating || !comment || !addedOn) {
        return res.status(400).json({ message: "All fields are required." });
      }
      const userId = req.userId;
      if (!userId) {
        return res
          .status(401)
          .json({ message: "Unauthorized. User ID not found." });
      }
const newBook = new Books({title,author,rating,comment,userId,addedOn});

await newBook.save();

      const newReview = new Reviews({comment,rating,userId,bookId: newBook._id,});

      await newReview.save();

      res.status(201).json({
        message: "Book and review added successfully",
        book: newBook,
        review: newReview,
      });
    } catch (error) {
      console.error("Error adding book and review:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Fget books by user id
router.get("/user-books", verifyToken, async (req: CustomRequest, res: Response) => {
    try {
      const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized. User ID not found." });
      }
      const books = await Books.find({ userId });
      res.status(200).json(books);
    } catch (error) {
      console.error("Error fetching user's books:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

//get book by id
router.get("/book/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const book = await Books.findById(id);

    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }
    res.status(200).json(book);
  } catch (error) {
    console.error("Error fetching book by ID:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

// get all books
router.get("/all-books", async (req: Request, res: Response) => {
  try {
    const allBooks = await Books.find();
    res.status(200).json(allBooks);
  } catch (error) {
    console.error("Error fetching all books:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update a book review (rating and opinion)
router.put("/update-book/:id",verifyToken, async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.userId;

    if (!rating || !comment) {
      return res.status(400).send({ message: "Rating and opinion are required." });
    }
    const book = await Books.findById(id);
    if (!book) {
      return res.status(404).send({ message: "Book not found." });
    }
    book.rating = rating;
    book.comment = comment;

    const existingReview = await Reviews.findOne({ bookId: id, userId: userId });
    if (!existingReview) {
      return res.status(404).send({ message: "Review not found." });
    }
    existingReview.rating = rating;
    existingReview.comment = comment;
    await existingReview.save();
    await book.save();

    res.status(200).json({
      message: "Review updated successfully.",
      review: existingReview,
      book: book,
    });
  } catch (error) {
    console.error("Error updating review", error);
    res.status(500).send({ message: "Failed to update review." });
  }
});


// Delete a book and its reviews
router.delete("/delete-book/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const book = await Books.findByIdAndDelete(id);

    if (!book) {
      return res.status(404).send({ message: "Book not found." });
    }

    await Reviews.deleteMany({ bookId: id });

    res
      .status(200)
      .send({ message: "Book and associated reviews deleted successfully." });
  } catch (error) {
    console.error("Error deleting book", error);
    res.status(500).send({ message: "Failed to delete book." });
  }
});

module.exports = router;
