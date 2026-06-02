import { google } from "googleapis";
import { Readable } from "stream";
import { logger } from "@/utils";
import { myEnvironment } from "@/configs";

// Setup Google Auth using a Service Account
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: myEnvironment.GOOGLE_CLIENT_EMAIL,
    private_key: myEnvironment.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});

const drive = google.drive({ version: "v3", auth });

export const uploadSubmissionToDrive = async (
  fileName: string,
  content: string
) => {
  try {
    const fileMetadata = {
      name: `${fileName}.txt`,
      mimeType: "text/plain",
      // Optional: Add a specific Folder ID here if you want it saved in a designated Drive folder
      // parents: ['YOUR_DRIVE_FOLDER_ID']
    };

    const media = {
      mimeType: "text/plain",
      body: Readable.from([content]),
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
    });

    return file.data.id;
  } catch (error) {
    logger.error("Error uploading to Google Drive:", error);
    throw error;
  }
};
