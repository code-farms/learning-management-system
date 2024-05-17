interface CommentInterface extends Document {
  user: object;
  comment: string;
  commentReplies: CommentInterface[];
}

interface ReviewInterface extends Document {
  user: object;
  rating: number;
  comment: string;
  commentReplies: CommentInterface[];
}

interface LinkInterface extends Document {
  title: string;
  url: string;
}

interface CourseDataInterface extends Document {
  title: string;
  description: string;
  videoUrl: string;
  videoThumbnail: object;
  videoSection: string;
  videoLength: number;
  videoPlayer: string;
  category: string;
  //   links: LinkInterface[];
  suggestion: string;
  questions: CommentInterface[];
}

interface CourseInterface extends Document {
  name: string;
  description: string;
  price: number;
  estimatedPrice?: number;
  thumbnail: string;
  tags: string;
  lavel: string;
  demoUrl: string;
  benifits: { title: string }[];
  preRequisites: { title: string }[];
  reviews: ReviewInterface[];
  courseData: CourseDataInterface[];
  ratings?: number;
  purchased?: number;
}

export {
  CommentInterface,
  ReviewInterface,
  LinkInterface,
  CourseDataInterface,
  CourseInterface,
};
