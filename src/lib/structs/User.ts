import {
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
  updateXPQuery,
} from "../database";
import {Character, CharacterType} from "./Character";

type UserType = {
  id: string;
  xp?: number;
};

export class User {
  public id: string;
  public xp = 0;

  constructor(data: UserType) {
    this.id = data.id;
    this.xp = data.xp || 0;
  }

  public static isUser = (user: unknown): user is UserType =>
    typeof user === "object" && user !== null && "id" in user && "xp" in user;

  public static async create(id: string) {
    createNewUserQuery.run({$id: id, $xp: 0});
    return new User({id: id});
  }

  public static async get(id: string) {
    const userRow = getUserQuery.get({$id: id});
    if (this.isUser(userRow)) {
      return new User(userRow);
    }

    return null;
  }

  public static async getAll(limit?: number) {
    const users = getUsersQuery.all({$limit: limit || 1000});
    return users.filter(this.isUser).map((user) => new User(user));
  }

  public async delete() {
    return deleteUserQuery.run({$id: this.id});
  }

  public async addXP(amount: number) {
    return updateXPQuery.run({$id: this.id, $amount: amount});
  }

  public async subtractXP(amount: number) {
    return updateXPQuery.run({$id: this.id, $amount: -amount});
  }

  public async createCharacter(character: Omit<CharacterType, "id">) {
    const characters = await this.getCharacters();
    if (characters.some((character) => character.isPending)) {
      return null;
    }

    const createdCharacter = createCharacterQuery.get({
      $name: character.name || "",
      $surname: character.surname || "",
      $personality: character.personality || "",
      $appearance: character.appearance || "",
      $imageUrl: character.imageUrl || "",
      $backstory: character.backstory || "",
      $age: character.age || "0",
      $height: character.height || "0",
      $gender: character.gender || "",
      $weight: character.weight || "0",
      $isPending: true,
      $userId: this.id,
    });
    if (Character.isCharacter(createdCharacter)) {
      return new Character(createdCharacter);
    }
  }

  public setCharacterField(id: number, field: string, value: string | number | boolean) {
    return setCharacterFieldQuery(field).get({$id: id, $value: value});
  }

  public async getCharacter(id: number) {
    const character = getCharacterQuery.get({$id: id});
    if (Character.isCharacter(character)) {
      return new Character(character);
    }
    return null;
  }

  public async getPendingCharacters(limit?: number) {
    const characters = getPendingCharactersQuery.all({$isPending: true, $limit: limit || 1000});
    return characters.filter(Character.isCharacter).map((character) => new Character(character));
  }

  public async getCharacters(limit?: number) {
    const characters = getCharactersQuery.all({$userId: this.id, $limit: limit || 1000});
    return characters.filter(Character.isCharacter).map((character) => new Character(character));
  }

  public async deleteCharacter(id: number) {
    return deleteCharacterQuery.run({$id: id});
  }

  public async deletePendingCharacters() {
    return deletePendingCharacterQuery.run({$isPending: true, $userId: this.id});
  }
}
