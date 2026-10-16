import dotenv from "dotenv";
dotenv.config();

import { Tool } from "./models/tool.model";
import { Provider } from "./models/provider.model";
import { connectDB, disconnectDB } from "./configs/database.config";
import { importService } from "./services/import.service";
import fs from "fs";
import path from "path";

/**
 * Dev seed script: RESETS the tools + providers collections, then bulk-imports
 * every row from tools_data.json through the shared import mapper
 * (src/services/import.service.ts) — the same mapper the admin bulk-import
 * endpoint uses, so seeded data and imported data always have the same shape.
 *
 * ⚠️  Destructive — wipes all tools and providers. For local/dev use only.
 */
const main = async () => {
  try {
    await connectDB();
    console.log("Connected to database for seeding.");

    const dataPath = path.resolve(__dirname, "../../../tools_data.json");
    if (!fs.existsSync(dataPath)) {
      console.error("tools_data.json not found at", dataPath);
      process.exit(1);
    }
    const rawData = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    console.log(`Loaded ${rawData.length} tools from JSON.`);

    await Tool.deleteMany({});
    await Provider.deleteMany({});
    console.log("Cleared existing tools and providers.");

    const report = await importService.bulkImport(rawData);
    console.log(
      `Seed complete — created ${report.created}, updated ${report.updated}, failed ${report.failed}.`
    );

    if (report.failed > 0) {
      console.log("Failed rows:");
      for (const r of report.results.filter(x => x.status === "failed")) {
        console.log(`  Row ${r.row} (${r.name || r.slug}): ${r.error}`);
      }
    }

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    await disconnectDB();
    process.exit(1);
  }
};

main();
