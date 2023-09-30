import {PrismaClient} from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({data: {id: "969062359442280548"}});
  const faction = await prisma.faction.create({
    data: {
      name: "Conclave do Fortíssimo",
      description: "...",
      imageUrl: "https://cdn.discordapp.com/attachments/1150285916204703784/1155217482177577030/FortissimoConclaveBanner.png",
      emoji: "<:FortissimoConclaveIconMini:1155222333477367850>",
    },
  });

  const instrument = await prisma.instrument.create({
    data: {
      name: "Violoncelo Leve",
      description: "Uma arma-instrumento para quem gosta de mobilidade, mas de artilharia pesada também.",
      imageUrl: "https://i.imgur.com/ZZRCahf.png",
    },
  });

  const race = await prisma.race.create({data: {name: "Staccatos", description: "...", imageUrl: "https://i.imgur.com/pSArSXg.png"}});

  const character = await prisma.character.create({
    data: {
      userId: user.id,
      name: "Moe",
      surname: "Ey",
      age: "23",
      appearance: "...",
      isBeingUsed: true,
      isPending: false,
      backstory: "...",
      factionId: faction.id,
      imageUrl: "https://i.imgur.com/sEeWlHf.jpg",
      gender: "Feminino",
      weight: "65KG",
      height: "180cm",
      personality: "...",
      raceId: race.id,
      instruments: {create: {instrumentId: instrument.id, quantity: 1}},
    },
  });

  console.log({user, faction, instrument, race, character});
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
