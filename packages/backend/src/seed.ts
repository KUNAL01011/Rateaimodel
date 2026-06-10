import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { Tool } from "./models/tool.model";
import { Provider } from "./models/provider.model";
import { connectDB, disconnectDB } from "./configs/database.config";
import fs from "fs";
import path from "path";

// Mapping from excel format to our enum formats
const parseToolType = (type: string) => {
  type = String(type || "")
    .toLowerCase()
    .trim();
  switch (type) {
    case "llm":
      return "llm_model";
    case "chat":
      return "chat_product";
    case "search":
      return "search_product";
    case "code":
      return "coding_tool";
    case "image":
      return "image_model";
    case "video":
      return "video_model";
    case "audio":
      return "audio_model";
    case "agent":
      return "agent_framework";
    default:
      return "chat_product"; // default
  }
};

const parsePricingType = (type: string) => {
  type = String(type || "")
    .toLowerCase()
    .trim();
  if (type.includes("free") && type.includes("open")) return "open_source_free";
  if (type.includes("free")) return "free";
  if (type.includes("paid")) return "subscription";
  return "freemium";
};

const main = async () => {
  try {
    await connectDB();
    console.log("Connected to database for seeding.");

    // Read JSON data
    const dataPath = path.resolve(__dirname, "../../../tools_data.json");
    if (!fs.existsSync(dataPath)) {
      console.error("tools_data.json not found at", dataPath);
      process.exit(1);
    }
    const rawData = JSON.parse(fs.readFileSync(dataPath, "utf8"));

    console.log(`Loaded ${rawData.length} tools from JSON.`);

    // Clear existing tools and providers
    await Tool.deleteMany({});
    await Provider.deleteMany({});
    console.log("Cleared existing tools and providers.");

    const providerCache: { [key: string]: mongoose.Types.ObjectId } = {};

    for (const item of rawData) {
      const providerName = item["Provider"] || "Unknown Provider";
      if (!providerCache[providerName]) {
        const pSlug = providerName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const newP = await Provider.create({
          name: providerName,
          slug: pSlug,
          isOpenSource: item["Open Source"] === "Yes",
        });
        providerCache[providerName] = newP._id;
      }

      const slug =
        item["Slug"] || item["Name"].toLowerCase().replace(/[^a-z0-9]+/g, "-");

      const newTool = {
        slug,
        name: item["Name"] || "Unknown Tool",
        shortDescription: item["Short Description"]
          ? item["Short Description"].substring(0, 160)
          : "No description",
        fullDescription: item["Short Description"] || "",
        toolType: parseToolType(item["Tool Type"]),
        providerId: providerCache[providerName],
        hasApi: item["Has API"] === "Yes",
        isOpenSource: item["Open Source"] === "Yes",
        isSelfHostable: item["Self-Hostable"] === "Yes",
        hasFreeTier: item["Has Free Tier"] === "Yes",
        supportsFunctionCalling: item["Function Calling"] === "Yes",
        supportsStreaming: item["Streaming"] === "Yes",
        supportsFineTuning: item["Fine-Tuning"] === "Yes",
        supportsMultimodal: item["Multimodal"] === "Yes",
        pricingType: parsePricingType(item["Pricing Type"]),
        websiteUrl: item["Website"] || "",
        githubUrl:
          item["GitHub / HuggingFace"] &&
          String(item["GitHub / HuggingFace"]).includes("github")
            ? item["GitHub / HuggingFace"]
            : undefined,
        huggingFaceUrl:
          item["GitHub / HuggingFace"] &&
          String(item["GitHub / HuggingFace"]).includes("huggingface")
            ? item["GitHub / HuggingFace"]
            : undefined,
        modelFamily: item["Model Family"] || undefined,
        parameterCount: item["Parameter Count"] || undefined,
        isFeatured: item["Featured"] === "Yes",
        verificationStatus:
          item["Verification"] === "verified" ? "verified" : "unverified",
      };

      await Tool.create(newTool);
    }

    console.log("Successfully seeded tools.");
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    await disconnectDB();
    process.exit(1);
  }
};

main();
