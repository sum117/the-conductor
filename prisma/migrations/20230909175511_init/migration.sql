-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "xp" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Character" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "surname" TEXT,
    "personality" TEXT,
    "appearance" TEXT,
    "imageUrl" TEXT,
    "backstory" TEXT,
    "age" TEXT,
    "height" TEXT,
    "gender" TEXT,
    "weight" TEXT,
    "userId" TEXT NOT NULL,
    "isPending" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Character_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Instrument" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "characterId" INTEGER NOT NULL,
    CONSTRAINT "Instrument_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
