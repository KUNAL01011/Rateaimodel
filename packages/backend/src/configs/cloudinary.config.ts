import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { myEnvironment } from "./env.config";
import { ApiError, logger } from "@/utils";

cloudinary.config({
  cloud_name: myEnvironment.CLOUDINARY_CLOUD_NAME,
  api_key: myEnvironment.CLOUDINARY_API_KEY,
  api_secret: myEnvironment.CLOUDINARY_API_SECRET,
});

export const extractPublicIdFromUrl = (url: string): string | null => {
  try {
    if (!url) return null;

    const match = url.match(
      /\/(?:image|video|raw)\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/
    );

    if (match && match[1]) {
      return match[1];
    }

    return null;
  } catch (error) {
    logger.error("Error extracting public_id from URL:", error);
    return null;
  }
};

export const deleteLocalFile = (filePath:string):void => {
  try {
    if (fs.existsSync(filePath)){
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    logger.warn("failed to delete local file:", error);
  }
}

export const uploadImage = async (
  imagePath: string,
  folder?: string
): Promise<{
  url: string;
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
}> => {
  try {
    const baseDir = path.resolve(process.cwd(), "public", "image");

    const fullPath = path.resolve(baseDir, imagePath);

    if (fullPath !== baseDir && !fullPath.startsWith(baseDir + path.sep)) {
      throw new ApiError(
        400,
        `Security Error: Path traversal attempt detected for path: ${imagePath}`
      );
    }

    if (!fs.existsSync(fullPath)) {
      throw new ApiError(400, `Image not found at path: ${fullPath}`);
    }

    const result = await cloudinary.uploader.upload(fullPath, {
      resource_type: "image",
      type: "upload",
      folder: folder || "uploads",
    });

    return {
      url: result.url,
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    logger.error("Error uploading image to Cloudinary: ", error);
    throw error;
  }
};

export const deleteImage = async (
  publicId: string
): Promise<{result:string}> => {
  try {
    if (!publicId) {
      throw new ApiError(400, "Public Id is required for deletion");
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image"
    });

    if (result.result !== "ok") {
      throw new ApiError(404, `failed to delete image: ${result.result}`);
    }

    return {result: result.result};
  } catch (error) {
    logger.error("Error deleting image from Cloudinary: ", error);
    throw error;
  }
}