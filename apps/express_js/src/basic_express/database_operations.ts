import { Pool } from "pg";

import dotenv from "dotenv";

// working express with postresql
// by manually and using thrid pary like prisma,sequlize etc...

// by manual
// we need a driver library to commmunication with our database for that postgresql have pg package that handshake with express and postresql so we can query them

// manual - we need to install postgresql
// create a database user used to work with that database examples
// CREATE ROLE express_user
// WITH LOGIN PASSWORD 'your_secure_password';

// config the env details
dotenv.config();

// establishing connections
let pool: any;
try {
  pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
} catch (error) {
  console.log(error);
}

pool.on("connect", () => {
  console.log("Connected to PostgreSQL");
});

pool.on("error", (error: any) => {
  console.error("Unexpected database error:", error);
});

async function testConnection() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log(result.rows);
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}

async function createDemoTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS demo (
        demo_id SERIAL PRIMARY KEY,
        demo_text TEXT NOT NULL,
        demo_age INTEGER,
        demo_email TEXT UNIQUE NOT NULL
      )
    `);
    console.log("Demo table created successfully");
  } catch (error) {
    console.error("Error creating demo table:", error);
  }
}

async function insertDemoData() {
  try {
    await pool.query(`
      INSERT INTO demo (demo_text, demo_age, demo_email)
      VALUES ('This is demo data', 30, 'demo@example.com'),
      ('Another demo data', 25, 'another@example.com'),
      ('Third demo data', 28, 'third@example.com'),
      ('Fourth demo data', 32, 'fourth@example.com')
    `);
    console.log("Demo data inserted successfully");
  } catch (error) {
    console.error("Error inserting demo data:", error);
  }
}
async function deleteTable() {
  try {
    await pool.query("DROP TABLE IF EXISTS demo");
    console.log("Demo table deleted successfully");
  } catch (error) {
    console.error("Error deleting demo table:", error);
  }
}

async function getDemoData() {
  try {
    const result = await pool.query("SELECT * FROM demo");
    console.log("Demo data retrieved successfully:", result.rows);
  } catch (error) {
    console.error("Error retrieving demo data:", error);
  }
}

// testConnection();
// createDemoTable();
// insertDemoData();
// deleteTable();
// getDemoData();

// ORM - Object relational mapping which i used to commincate to the database in the effecient and robust way
// various package can be used like prisma,sequelize etc...
// current using prisma

// creating model in the folder structure prisma/schema.prisma

// connection establishing

import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

export const prisma = new PrismaClient({
  adapter,
});

// Insert user
export async function createUser() {
  const userData = {
    name: "Abdulrahim",
    email: "abdulrahim@123",
  };
  const user = await prisma.user.create({
    data: userData,
  });

  return user;
}

export async function getUsers() {
  const users = await prisma.user.findMany();
  console.log(users);

  return users;
}

// createUser();
// getUsers();

// TypeORM
import "reflect-metadata";

import { DataSource } from "typeorm";
import { Product } from "../entities/product.entity.js";
import knex from "knex";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,

  entities: [Product],

  synchronize: true,
  logging: true,
} as any);

await AppDataSource.initialize();

export async function createProduct() {
  const data = [
    {
      name: "iPhone 17",
      description: "Apple smartphone",
      price: 79999,
      stock: 50,
      category: "Electronics",
    },
    {
      name: "iPhone 17",
      description: "Apple smartphone",
      price: 79999,
      stock: 50,
      category: "Electronics",
    },
    {
      name: "iPhone 17",
      description: "Apple smartphone",
      price: 79999,
      stock: 50,
      category: "Electronics",
    },
  ];
  const productRepository = AppDataSource.getRepository(Product);

  // Create a Product entity instance
  const product = productRepository.create(data);

  // Insert the product into the database
  return await productRepository.save(product);
}

export async function getProducts() {
  const productRepository = AppDataSource.getRepository(Product);

  // Retrieve all products
  const products = await productRepository.find();
  console.log(products);

  return products;
}

// createProduct();
// getProducts();

// Query builder - instead of using high level layers like ORM we just use a query builder that used our code that build the query using the code

export const db = knex({
  client: "pg",
  connection: process.env.DATABASE_URL,
} as any);

const products = await db("products").select("*").where("price", ">", 50000);

console.log(products);
