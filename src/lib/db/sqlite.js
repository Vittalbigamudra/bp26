import { Database } from "bun:sqlite";

const db = new Database("app.db");

export default db;
