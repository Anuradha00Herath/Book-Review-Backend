import { Request, Response } from "express";
import Reviews from "./reviews.model";
import Books from "../books/books.model";
import User from "../users/user.model";
import verifyToken from "../middleware/verifyToken";
const express = require('express');
const router = express.Router();

interface CustomRequest extends Request {
  userId?: string;
}

// Post a review
router.post('/post-review/:bookId', verifyToken, async (req: CustomRequest, res: Response) => {
  try {
    const { comment, rating } = req.body;
    const { bookId } = req.params;
    const userId = req.userId;

    if (!comment || !rating || !userId || !bookId) {
      return res.status(400).json({
        message: "All fields are required: comment, rating, userId, bookId.",
      });
    }
    const existingReview = await Reviews.findOne({ userId, bookId });

    if (existingReview) {
      existingReview.comment = comment;
      existingReview.rating = rating;

      await existingReview.save();

      return res.status(200).json({message: "Review updated successfully",review: existingReview});
    } else {
      const newReview = new Reviews({
        comment,
        rating,
        userId,
        bookId,
      });

      await newReview.save();

      return res.status(201).json({message: "Review created successfully",review: newReview});
    }
  } catch (error) {
    console.error("Error handling review:", error);
    res.status(500).json({ message: "Error handling review." });
  }
});


// Get all reviews for a book
router.get('/get-review/:bookId', verifyToken, async (req: CustomRequest, res: Response) => {
  const userId = req.userId;
  try {
    const { bookId } = req.params;
    if(!bookId){
      return res.status(400).json({message: "Book id not found."});
    }
    recalculateBookRating(bookId);
    const reviews = await Reviews.find({ bookId });

    const otherUsersReviews = reviews.filter(review => review.userId.toString() !== userId);

    const reviewsWithUsernames = await Promise.all(
      otherUsersReviews.map(async (review) => {
        const username = await getUserbyId(review.userId.toString());
        return {
          ...review.toObject(), 
          username: username || "Unknown User",
        };
      })
    );

    res.status(200).json(reviewsWithUsernames);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Error fetching reviews", error });
  }
});


//get user review
router.get('/get-my-review/:bookId', verifyToken, async (req: CustomRequest, res: Response) => {
 
  try {
    const { bookId } = req.params;
    const userId = req.userId;

    if (!bookId || !userId) {
      return res.status(400).json({ message: "Book or userId id not found." });
    }

    const userReview = await Reviews.findOne({ bookId, userId });

    if (!userReview) {
      return res.status(404).json({ message: "No review found for this book by the logged-in user" });
    }

    const username = await getUserbyId(userId);
    const reviewWithUsername = {
      ...userReview.toObject(),
      username: username || "Unknown User",
    };

    res.status(200).json(reviewWithUsername);
  } catch (error) {
    console.error("Error fetching user review:", error);
    res.status(500).json({ message: "Error fetching user review", error });
  }
});


// Delete a review
router.delete('/delete-review', async (req: Request, res: Response) => {
  try {
    const {reviewId} = req.body;
    if (!reviewId) {
      return res.status(400).json({ message: "Invalid reviewId format." });
    }
    const review = await Reviews.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    const bookId = review.bookId.toString();
    await Reviews.findByIdAndDelete(reviewId);

    res.status(200).json({message: "Review deleted successfully.",bookId});
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Error deleting review.", error });
  }
});

export default router;


// Recalculate book's average rating
const recalculateBookRating = async (bookId: string) => {
  const reviews = await Reviews.find({ bookId });
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
  await Books.findByIdAndUpdate(bookId, { rating: averageRating });
};

// get username by id
const getUserbyId = async(userId:string)=>{
  const user = await User.findById(userId);
  if(!user){
    return null
  }
  return user.username
}

module.exports = router
