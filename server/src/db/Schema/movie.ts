import { Schema } from 'mongoose'
import * as mongoose from 'mongoose'


const movieSchema = new Schema(
  {
    title: { type: String },
    year: { type: Number },
    runtime: { type: Number },
    cast: [{
      type: String
    }],
    poster: { type: String },
    plot: { type: String },
    fullplot: { type: String },
    lastupdated: { type: Date },
    type: { type: String },
    directors: [{
      type: String
    }],
    imdb: {
      rating: Number,
      votes: Number,
      id: Number
    },
    countries: [{
      type: String
    }],
    genres: [{
      type: String
    }],
    writers: [{
      type: String
    }],
    tomatoes: {
      viewer: {
        rating: Number,
        numReviews: Number
      },
      lastUpdated: Date
    },
    num_mflix_comments: { type: Number },
    comments: [{
      name: String,
      email: String,
      movie_id: String,
      text: String,
      date: Date
    }]
  },
  {
    // createdAt,updatedAt fields are automatically added into records
    timestamps: true
  }
);

export const Movies = mongoose.model("Movie", movieSchema);