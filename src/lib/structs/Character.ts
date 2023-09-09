export type CharacterType = {
  id: number;
  name?: string;
  surname?: string;
  personality?: string;
  appearance?: string;
  imageUrl?: string;
  backstory?: string;
  age?: string;
  height?: string;
  gender?: string;
  weight?: string;
  isPending?: boolean;
  userId?: string;
};

export class Character {
  public id = 0;
  public name = "";
  public surname = "";
  public personality = "";
  public appearance = "";
  public backstory = "";
  public age = "";
  public height = "";
  public gender = "";
  public weight = "";
  public isPending = true;
  public userId = "";

  public static isCharacter = (character: unknown): character is CharacterType =>
    typeof character === "object" && character !== null && "id" in character && "userId" in character;

  constructor(character?: CharacterType) {
    Object.assign(this, character);
  }
}
