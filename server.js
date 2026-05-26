import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import { createServer } from "node:http";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

const PORT = Number(process.env.PORT || 3001);
const DB_DIR = process.env.DB_DIR || "data";
const DB_PATH = process.env.DB_PATH || join(DB_DIR, "stroykompas.sqlite");
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

if (!existsSync(DB_DIR)) mkdirSync(DB_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const json = (res, status, payload) => {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "http://localhost:5173",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(body);
};

const readBody = (req) => new Promise((resolve, reject) => {
  let raw = "";
  req.on("data", (chunk) => {
    raw += chunk;
    if (raw.length > 1_000_000) {
      req.destroy();
      reject(new Error("Body is too large"));
    }
  });
  req.on("end", () => {
    try {
      resolve(raw ? JSON.parse(raw) : {});
    } catch {
      reject(new Error("Invalid JSON"));
    }
  });
});

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const normalizePhone = (phone) => String(phone || "").replace(/\D/g, "");
const publicUser = (user) => user && ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  createdAt: user.created_at,
});

const hashPassword = (password) => {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
};

const verifyPassword = (password, stored) => {
  const [salt, hash] = String(stored || "").split(":");
  if (!salt || !hash) return false;
  const actual = Buffer.from(scryptSync(password, salt, 64).toString("hex"), "hex");
  const expected = Buffer.from(hash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
};

const base64url = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
const sign = (data) => createHmac("sha256", JWT_SECRET).update(data).digest("base64url");

const createToken = (userId) => {
  const header = base64url({ alg: "HS256", typ: "JWT" });
  const payload = base64url({ sub: userId, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 });
  const data = `${header}.${payload}`;
  return `${data}.${sign(data)}`;
};

const verifyToken = (token) => {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;
  const data = `${header}.${payload}`;
  if (sign(data) !== signature) return null;
  const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  if (!parsed.sub || parsed.exp < Math.floor(Date.now() / 1000)) return null;
  return parsed.sub;
};

const getAuthUser = (req) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const userId = verifyToken(token);
  if (!userId) return null;
  return db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
};

const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") return json(res, 204, {});

  try {
    if (req.method === "POST" && req.url === "/api/auth/register") {
      const body = await readBody(req);
      const name = String(body.name || "").trim() || "Пользователь";
      const email = normalizeEmail(body.email);
      const phone = normalizePhone(body.phone);
      const password = String(body.password || "");

      if (!email && !phone) return json(res, 400, { error: "Укажите email или телефон" });
      if (email && !/^\S+@\S+\.\S+$/.test(email)) return json(res, 400, { error: "Некорректный email" });
      if (phone && phone.length < 10) return json(res, 400, { error: "Некорректный телефон" });
      if (password.length < 6) return json(res, 400, { error: "Пароль должен быть минимум 6 символов" });

      const existing = db.prepare("SELECT id FROM users WHERE email = ? OR phone = ?").get(email || null, phone || null);
      if (existing) return json(res, 409, { error: "Такой пользователь уже существует" });

      const result = db.prepare(`
        INSERT INTO users (name, email, phone, password_hash)
        VALUES (?, ?, ?, ?)
      `).run(name, email || null, phone || null, hashPassword(password));
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
      return json(res, 201, { token: createToken(user.id), user: publicUser(user) });
    }

    if (req.method === "POST" && req.url === "/api/auth/login") {
      const body = await readBody(req);
      const login = String(body.login || "").trim();
      const password = String(body.password || "");
      const email = normalizeEmail(login);
      const phone = normalizePhone(login);
      const user = db.prepare("SELECT * FROM users WHERE email = ? OR phone = ?").get(email || null, phone || null);

      if (!user || !verifyPassword(password, user.password_hash)) {
        return json(res, 401, { error: "Неверный логин или пароль" });
      }

      return json(res, 200, { token: createToken(user.id), user: publicUser(user) });
    }

    if (req.method === "GET" && req.url === "/api/auth/me") {
      const user = getAuthUser(req);
      if (!user) return json(res, 401, { error: "Нужно войти в аккаунт" });
      return json(res, 200, { user: publicUser(user) });
    }

    return json(res, 404, { error: "Route not found" });
  } catch (error) {
    console.error(error);
    return json(res, 500, { error: "Ошибка сервера" });
  }
});

server.listen(PORT, () => {
  console.log(`Auth API started on http://localhost:${PORT}`);
  console.log(`SQLite database: ${DB_PATH}`);
});
