import { google } from "googleapis";
import { Readable } from "stream";
import { logger } from "@/utils";
import { myEnvironment } from "@/configs";

// Only initialise Google Auth if credentials are present.
// This service is optional — missing creds means upload silently no-ops.
function getDrive() {
  const email = (myEnvironment as any).GOOGLE_CLIENT_EMAIL;
  const key = (myEnvironment as any).GOOGLE_PRIVATE_KEY;

  if (!email || !key) {
    logger.warn(
      "drive.service: GOOGLE_CLIENT_EMAIL / GOOGLE_PRIVATE_KEY not set — Drive upload disabled"
    );
    return null;
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: email,
      private_key: key.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });

  return google.drive({ version: "v3", auth });
}

export const uploadSubmissionToDrive = async (
  fileName: string,
  content: string
): Promise<string | null> => {
  const drive = getDrive();
  if (!drive) return null;

  try {
    const fileMetadata = {
      name: `${fileName}.txt`,
      mimeType: "text/plain",
    };

    const media = {
      mimeType: "text/plain",
      body: Readable.from([content]),
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: "id",
    });

    return file.data.id ?? null;
  } catch (error) {
    logger.error("Error uploading to Google Drive:", error);
    throw error;
  }
};
