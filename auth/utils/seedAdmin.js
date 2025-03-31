import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../model/User.js";
import bcrypt from "bcryptjs";

dotenv.config();

const seedAdminUser = async () => {
  let connection = null;

  try {
    if (mongoose.connection.readyState !== 1) {
      connection = await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB connected for admin seeding");
    }

    const adminExists = await User.findOne({ role: "admin" });

    if (adminExists) {
      console.log("Admin user already exists. Skipping creation.");
      if (connection) await mongoose.disconnect();
      return;
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME;
    const adminPhone = process.env.ADMIN_PHONE;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const adminUser = new User({
      email: adminEmail,
      password: hashedPassword,
      name: adminName,
      phone: adminPhone,
      role: "admin",
      status: "active",
      verified: true,
    });

    await User.collection.insertOne(adminUser);

    console.log(`Admin user created successfully: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log("You can now login with these credentials.");

    if (connection) {
      await mongoose.disconnect();
      console.log("MongoDB disconnected");
    }
  } catch (error) {
    console.error("Error seeding admin user:", error);
    if (connection) await mongoose.disconnect();

    if (process.argv[1] === new URL(import.meta.url).pathname) {
      process.exit(1);
    }
  }
};

if (process.argv[1] === new URL(import.meta.url).pathname) {
  console.log("Seeding admin user...");
  seedAdminUser()
    .then(() => {
      console.log("Admin seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Admin seeding failed:", error);
      process.exit(1);
    });
}

export default seedAdminUser;
