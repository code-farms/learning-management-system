import mongoose, { Model, Schema } from "mongoose";
import {
  CommentInterface,
  CourseDataInterface,
  CourseInterface,
  LinkInterface,
  ReviewInterface,
} from "../interfaces/course.interfaces";

const reviewSchema = new Schema<ReviewInterface>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    rating: {
      type: Number,
      default: 0,
    },
    comment: {
      type: String,
    },
  },
  { timestamps: true }
);

const linkSchema = new Schema<LinkInterface>({
  title: String,
  url: String,
});

const commentSchema = new Schema<CommentInterface>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  comment: {
    type: String,
  },
  commentReplies: [Object],
});

const courseDataSchema = new Schema<CourseDataInterface>({
  title: String,
  description: String,
  videoUrl: String,
  videoThumbnail: Object,
  videoSection: String,
  videoLength: Number,
  videoPlayer: String,
  category: String,
  links: {
    type: Schema.Types.ObjectId,
    ref: "Link",
  },
  suggestion: String,
  questions: { Object },
});

const courseSchema = new Schema<CourseInterface>({
  name: {
    type: String,
    required: [true, "Please enter course name."],
  },
  description: {
    type: String,
    required: [true, "Please enter course description."],
  },
  price: {
    type: Number,
    required: [true, "Please enter course price."],
  },
  estimatedPrice: Number,
  thumbnail: {
    public_id: {
      type: String,
      required: [true, "Thumbnail id is not available."],
    },
    url: {
      type: String,
      required: [true, "Thumbnail url is not available."],
    },
  },
  tags: {
    type: String,
    required: [true, "Please enter course tag."],
  },
  lavel: {
    type: String,
    required: [true, "Please enter course lavel."],
  },
  demoUrl: {
    type: String,
    required: [true, "Please enter demo URL."],
  },
  benifits: {
    type: [{ title: String }],
  },
  preRequisites: {
    type: [{ title: String }],
  },
  reviews: [reviewSchema],
  courseData: [courseDataSchema],
  ratings: {
    type: Number,
    default: 0,
  },
  purchased: {
    type: Number,
    default: 0,
  },
});

const Course: Model<CourseInterface> = mongoose.model("Course", courseSchema);

export default Course;
