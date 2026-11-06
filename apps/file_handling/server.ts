import express from "express";
import multer from "multer";

const app = express();

const inMemoryStorage = multer.memoryStorage();

export const uploadInMemory = multer({
  storage: inMemoryStorage,
});

// file stored in buffer in-memory
app.post(
  "/upload-in-memory",
  uploadInMemory.single("profilePicture"),
  (req, res) => {
    try {
      const file = req.file;

      console.log("file", file);

      if (!file) {
        return res.status(400).json({
          message: "No file uploaded",
        });
      }

      return res.status(200).json({
        message: "File received successfully",

        file: {
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
);

import path from "node:path";
import crypto, { randomUUID } from "node:crypto";

// configure the multer to stroe in the nodejs disk
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueName = crypto.randomUUID();

    const extension = path.extname(file.originalname);

    cb(null, `${uniqueName}${extension}`);
  },
});

export const uploadOnDisk = multer({
  storage: diskStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

app.post(
  "/upload-on-disk",
  uploadOnDisk.single("profilePicture"),
  (req, res) => {
    try {
      const file = req.file;

      console.log("file", file);

      if (!file) {
        return res.status(400).json({
          message: "No file uploaded",
        });
      }

      return res.status(200).json({
        message: "File received successfully",

        file: {
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
);

// could upload files using supabase

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

console.log("SUPABASE_URL", process.env.SUPABASE_URL);
console.log("SUPABASE_SECRET_KEY", process.env.SUPABASE_SECRET_KEY);

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
);

export const getStorageBuckets = async () => {
  const { data, error } = await supabase.storage.listBuckets();

  if (error) {
    throw error;
  }

  return data;
};

const buckets = await getStorageBuckets();

console.log(buckets);

const BUCKET_NAME = "file-upload";

export const uploadFileToSupabase = async (req, res) => {
  const file = req.file;

  const generateUniqueFileName = () => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${file.originalname}`;
  };

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(generateUniqueFileName(), file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  console.log("data", data);
  console.log("error", error);

  if (error) {
    throw error;
  }

  return data;
};

app.post(
  "/upload-on-supabase",
  uploadInMemory.single("profilePicture"),
  uploadFileToSupabase,
);

app.listen(3000, () => {
  console.log("Server is running");
});
