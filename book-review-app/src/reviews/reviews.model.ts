import { Schema, model, Document, Types } from 'mongoose';

export interface IReview extends Document {
  comment: string;
  rating: number;
  userId: Types.ObjectId;
  bookId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?:Date;
}

const ReviewSchema = new Schema<IReview>({
  comment: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min:1,
    max:5
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bookId: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  }
},
{timestamps:true}
);

const Reviews = model<IReview>('Review', ReviewSchema);

export default Reviews;
