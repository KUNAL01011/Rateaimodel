import type { Request, Response } from "express";
import { asyncHandler, ApiResponse, ApiError } from "@/utils";
import { uploadImage, deleteLocalFile } from "@/configs/cloudinary.config";

/** POST /api/v1/uploads/image — admin. multipart field "image". → Cloudinary. */
export const uploadImageHandler = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) throw new ApiError(400, "No image file provided");
    try {
      const folderRaw = (req.query.folder as string) || "rateai";
      const folder = `rateai/${folderRaw.replace(/[^a-z0-9/_-]/gi, "")}`;
      const result = await uploadImage(req.file.path, folder);
      return res.status(200).json(
        new ApiResponse(
          200,
          { url: result.secure_url, width: result.width, height: result.height },
          "Image uploaded"
        )
      );
    } finally {
      deleteLocalFile(req.file.path);
    }
  }
);
