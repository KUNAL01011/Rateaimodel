import dotenv from "dotenv";
dotenv.config();

import { connectDB, disconnectDB } from "@/configs/database.config";
import { User } from "@/models";

const ADMIN_USER = {
  email: "admin@rateai.com",
  username: "admin",
  displayName: "RateAI Admin",
  password: "123456",
  role: "admin" as const,
};

async function seedAdmin() {
  await connectDB();

  console.log("🔐 Seeding admin user...");

  const existingAdmin = await User.findOne({
    email: ADMIN_USER.email,
  });

  if (!existingAdmin) {
    await User.create(ADMIN_USER);
    console.log(`✓ Admin created`);
  } else {
    console.log(`✓ Admin already exists`);
  }

  await disconnectDB();
}

seedAdmin().catch(console.error);
