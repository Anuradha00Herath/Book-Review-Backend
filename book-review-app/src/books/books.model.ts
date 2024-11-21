import { Schema, model, Types, Document } from 'mongoose';

export interface IBook extends Document {
  title: string;
  author: string;
  rating: number; 
  comment: string;
  userId: Types.ObjectId;
  addedOn: Date;
}

const BookSchema = new Schema<IBook>({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default:0
  },
  comment:{
    type:String,
    required:true
  },
  userId:{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  addedOn: {
    type:Date,
    required:true
  }
});

const Books = model<IBook>('Book', BookSchema);

export default Books;
