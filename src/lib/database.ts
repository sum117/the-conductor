import {Database} from "bun:sqlite";

const database = new Database("database.sqlite");

database.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    xp INTEGER DEFAULT 0
)`);

database.run(`CREATE TABLE IF NOT EXISTS characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    surname TEXT,
    personality TEXT,
    appearance TEXT,
    imageUrl TEXT,
    backstory TEXT,
    age TEXT,
    height TEXT,
    gender TEXT,
    weight TEXT,
    userId TEXT,
    isPending INTEGER DEFAULT 1,
    FOREIGN KEY (userId) REFERENCES users(id)
)`);

database.run(`CREATE TABLE IF NOT EXISTS instruments (
    id INTEGER PRIMARY KEY,
    name TEXT,
    description TEXT,
    type TEXT,
    characterId INTEGER,
    FOREIGN KEY (characterId) REFERENCES characters(id)
)`);

const createCharacterQuery = database.prepare(`INSERT INTO characters (
    name,
    surname,
    personality,
    appearance,
    imageUrl,
    backstory,
    age,
    height,
    gender,
    weight,
    isPending,
    userId
) VALUES (
    $name,
    $surname,
    $personality,
    $appearance,
    $imageUrl,
    $backstory,
    $age,
    $height,
    $gender,
    $weight,
    $isPending,
    $userId
) RETURNING *`);

const createNewUserQuery = database.prepare(`INSERT INTO users (
    id,
    xp
) VALUES (
    $id,
    $xp
)`);

const getUserQuery = database.prepare(`SELECT * FROM users WHERE id = $id`);
const getUsersQuery = database.prepare(`SELECT * FROM users LIMIT $limit`);
const deleteUserQuery = database.prepare(`DELETE FROM users WHERE id = $id`);

const updateXPQuery = database.prepare(`UPDATE users SET xp = xp + $amount WHERE id = $id`);

const setPendingCharacterQuery = database.prepare(
  `UPDATE characters SET isPending = $isPending WHERE id = $id RETURNING *`,
);

const getPendingCharactersQuery = database.prepare(
  `SELECT * FROM characters WHERE isPending = $isPending LIMIT $limit`,
);

const deletePendingCharacterQuery = database.prepare(
  `DELETE FROM characters WHERE isPending = $isPending  AND userId = $userId`,
);

const setCharacterFieldQuery = (field: string) =>
  database.query(`UPDATE characters SET ${field} = $value WHERE id = $id RETURNING *`);

const getCharacterQuery = database.prepare(`SELECT * FROM characters WHERE id = $id`);
const getCharactersQuery = database.prepare(`SELECT * FROM characters WHERE userId = $userId LIMIT $limit`);
const deleteCharacterQuery = database.prepare(`DELETE FROM characters WHERE id = $id`);

export {
  createCharacterQuery,
  createNewUserQuery,
  deleteCharacterQuery,
  deletePendingCharacterQuery,
  deleteUserQuery,
  getCharacterQuery,
  getCharactersQuery,
  getPendingCharactersQuery,
  getUserQuery,
  getUsersQuery,
  setCharacterFieldQuery,
  setPendingCharacterQuery,
  updateXPQuery,
};
