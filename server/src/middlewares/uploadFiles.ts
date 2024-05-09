import { File } from "buffer";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/temp");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + uuidv4() + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage,
});
