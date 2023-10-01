import {Prisma, PrismaClient} from "@prisma/client";
import dedent from "dedent";

const prisma = new PrismaClient();

const factionsData = new Array<Prisma.FactionCreateInput>();
factionsData.push({
  name: "Ordem do Crescendo",
  description: dedent(`
  # :CrescendoOrderIconMini: Ordem do Crescendo

  Chamar a Ordem do Crescendo de Facção para eles é um insulto. Eles se consideram, a verdadeira "Ordem", ou seja, o pilar de [Solasí](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156624640240779275>) erguido através do estudo da música, da perseverança e da exploração dos limites das notas e de todo o conhecimento. 

  Os integrantes da Ordem do Crescendo são acompanhados de perto por [Siih](<https://discord.com/channels/1149824330507767869/1152263280002351125/1152263718147719249>), a representante deles, e são incentivados a extrair o que há de melhor de todas as outras facções, ao mesmo tempo descartando tudo o que existe por doutrina ou que seja fruto de uma mente fechada. O lema de [Siih](<https://discord.com/channels/1149824330507767869/1152263280002351125/1152263718147719249>) é claro: "Crescendo, Crescendo e apenas Crescendo! Nunca diminuindo!"

  Talvez não seja possível dizer a mesma coisa do tamanho dela, já que [Lullabies](<https://discord.com/channels/1149824330507767869/1155233901153894430/1155249147197276170>) são bem pequenos, mas a mensagem que essa discípulo tem para passar reverbera nos integrantes do Crescendo como algo que vai além da alcunha de bordão. É uma mantra.

  A Ordem do Crescendo foi a primeira a se erguer contra a rebelião de [Tacet](<https://discord.com/channels/1149824330507767869/1152263280002351125/1152280491727274067>). [Siih](<https://discord.com/channels/1149824330507767869/1152263280002351125/1152263718147719249>) e seus seguidores levantaram o primeiro estandarte contra o que se tornaria uma tirania do silêncio. Apesar de se posarem como um inimigo respeitável para a [Legião Silente](<https://discord.com/channels/1149824330507767869/1150285916204703784/1155204653219328191>), o que verdadeiramente os tornou relevantes nas derrotas do silêncio foram as estratégias que eram capazes de desenvolver. Ganharam, mesmo com menores números várias vezes, humilhando a força bruta com o improviso e o desbravamento de limites.

  Os participantes da Ordem do Crescendo possuem uma obsessão por experimentação. Adoram tentar coisas novas e, na maioria das vezes, perigosas. Realmente não se controlam quando o assunto é crescer, tanto no poder, quanto no conhecimento, o que é perigoso para uma grande maioria deles, mesmo assim, a postura deles tem grande influência na imagem do Maestro Armado para os habitantes comuns de [Solasí](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156624640240779275>), engrandecendo a importância daqueles que lutam e se arriscam pelo bem da Terra Musical.

  Como um estudante, Maestro Armado ou professor da Ordem do Crescendo, uma série de obrigações que mais parecem desilusões utópicas devem ser seguidas (e surpreendentemente, funcionam):

  - Se tiver a oportunidade de fazer algo arriscado, mas GRANDE, que você acredita que vai funcionar, faça. É melhor morrer sem lamentações do que viver em arrependimentos.
  - Não hesite em praticar tudo o que lhe engrandeça. Não demonstre preconceito perante a nota ou maestro algum, pois tudo o que trás crescimento tem seu valor em [Solasí](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156624640240779275>).
  - Se estiver cercado, lembre-se: você não está sozinho contra eles. *Eles* estão sozinhos contra você. Um Maestro Crescendo é, por si só, um forte.
  - Usar outros Maestros para experimentos musicais não é antiético se der certo. Foi assim que inventaram as explosões das criaturas do [Obscuro](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156630757205348352>)!
  `),
  imageUrl: "https://media.discordapp.net/attachments/1150285916204703784/1150288801038602290/OrdemCrescendoBanner.png",
  emoji: "<:CrescendoOrderIconMini:1155222330570723422>",
});
factionsData.push({
  name: "Legião Silente",
  description: dedent(`
  # :SilentiLegionIconMini: Legião Silente

  Os incompreendidos; pobres coitados; causadores de tragédias. É assim que são vistos os integrantes da Legião Silente por muitos habitantes de [Solasí](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156624640240779275>), mesmo depois de diversos discursos de paz entre os discípulos os engrandecendo e falando da importância da existência deles. Infelizmente, [Solasí](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156624640240779275>) possui muitos Maestros rancorosos e apesar de todos merecerem uma segunda chance, a Legião Silente arca até os dias de hoje com os erros do passado.

  [Tacet](<https://discord.com/channels/1149824330507767869/1152263280002351125/1152280491727274067>), o representante deles é o único discípulo das [Notas Mestras](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156624664307712160>) que realmente trata seus seguidores como filhos. Isso é, presumidamente o motivo da Legião Silente ainda existir, resistindo a diversas tentativas de abolição por protesto público ou até infiltração e assassinato de representantes importantes.

  Você colhe o que planta. É isso que diz o universo. É isso que diz [Solasí](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156624640240779275>) e as notas. Mesmo com os esforços da Legião Silente para melhorar a imagem de seus estudantes, Maestros Armados e professores, não é possível apagar anos de sangue com movimentos sociais. De qualquer forma, eles permanecem sendo a facção mais unida de todas as outras, quebrando até as barreiras do profissionalismo impostas pela [Capela Láurea](<https://discord.com/channels/1149824330507767869/1150285916204703784/1155219361548734614>).

  Mesmo apresentando dificuldade em compor músicas longas ou canções intensas, a maioria dos integrantes da Legião Silente, se não todos, são ótimos guerreiros e assassinos. Eles aprendem a lutar sem armas-instrumento e desenvolvem a técnica de causar dano com os Tacets, as notas de pausa. Sem contar que com a ajuda deles, qualquer composição, independente da proveniência se torna uma obra-prima, pois como uma vez disse o [Grande Condutor](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156624677070979112>): "o silêncio é uma parte da música, e a música é uma parte do silêncio".

  Como um Maestro Armado, estudante ou professor da Legião Silente, existem algumas doutrinas que são importantes manter em vigor:

  - Abrace a opinião de seus irmãos, mas nunca daqueles que não entendem o poder do silêncio;
  - Ame o silêncio, mas não se torne ele. Use-o ao seu favor, para intensificar suas músicas, não para destruí-las;
  - Seja paciente. Seja calculista. Você deve entender o momento certo de parar melhor do que qualquer um que não foi tocado pela sabedoria de [Tacet](<https://discord.com/channels/1149824330507767869/1152263280002351125/1152280491727274067>). Uma retirada estratégica não é uma desistência, é um sinal de inteligência.
  - Não seja narcisista. Demonstre força através da sua humildade. Reconheça os erros do emblema que você carrega e siga de cabeça erguida em meio ao preconceito, pois sem você, esse mundo é incompleto.
  `),
  emoji: "<:SilentiLegionIconMini:1155222340699963503>",
  imageUrl: "https://cdn.discordapp.com/attachments/1150285916204703784/1155204652967665664/SilentiLegionBanner.png",
});
factionsData.push({
  name: "Conclave do Fortíssimo",
  description: dedent(`
  # :FortissimoConclaveIconMini: Conclave do Fortíssimo

  As notas pesadas são uma grande parte da [Orquestra Primordial](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156624694544441434>). É isso que [Dorehn](<https://discord.com/channels/1149824330507767869/1152263280002351125/1155198957337718886>) passa horas repetindo para seus discípulos e para si mesmo. Mesmo com um espírito orgulhoso e as vezes exagerado, ele não está errado.

  O [Grande Condutor](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156624677070979112>) tinha um motivo para gostar tanto de [Dorehn](<https://discord.com/channels/1149824330507767869/1152263280002351125/1155198957337718886>) e de seus aprendizes: as notas mais exuberantes e vaidosas adoram segui-los, como se fizessem parte da aura deles. É justo dizer que depois de um tempo, todos do Conclave do Fortíssimo se acostumam com uma camada nova em seus corpos - a de notas douradas que os rodeiam e os protegem de más influências e sinais de fraqueza.

  Durante a guerra dos discípulos, o Conclave do Fortíssimo foi o maior empecilho no caminho da [Legião Silente](<https://discord.com/channels/1149824330507767869/1150285916204703784/1155204653219328191>), pois em comparação com as outras notas mais tímidas, as que seguem esses Maestros são muito resistentes ao silêncio e as vezes até destroem a influência dele por completo, impedindo que seus Maestros fiquem expostos a ataques vindos de manipuladores das Tacets.

  Por conta das desavenças geradas pelos anos de guerra, a atmosfera competitiva e tóxica entre o Conclave do Fortíssimo e a [Legião Silente](<https://discord.com/channels/1149824330507767869/1150285916204703784/1155204653219328191>) ainda é presente entre os extremistas, mas [Dorehn](<https://discord.com/channels/1149824330507767869/1152263280002351125/1155198957337718886>) está trabalhando com [Tacet](<https://discord.com/channels/1149824330507767869/1152263280002351125/1152280491727274067>) para amenizar isso, só que infelizmente apenas palavras bonitas não fazem milagres.

  Vistos nas escolas e universidades como "elites", os Maestros do Conclave do Fortíssimo são muito bem prestigiados onde vão e comumente são indicados para compor em eventos grandes. É um boato comum entre [Solasí](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156624640240779275>) que eles não gostam de tocar em lugares sem luxo.

  Como um estudante, Maestro Armado ou professor do Conclave do Fortíssimo, existem algumas regras a serem seguidas:

  - Trabalhar com o Silêncio apenas quando for prudente e não deixá-lo sobrepor as notas douradas. O silêncio é necessário, mas a música pode acontecer sem ele;
  - Sempre buscar estar envolto das notas douradas e vaidosas. As notas que demonstrarem fraquezas ou timidez devem ser mandadas embora. Não há espaço para fracos quando o concerto vem de um integrante do Conclave do Fortíssimo;
  - Tratar bem quem lhe tratar bem e destruir quem estiver lhe impedindo de alcançar seus objetivos. Você não nasceu para ser um samaritano, mas sim um líder;
  - Mesmo diante da morte certa, não pare de compor e mostre o orgulho do Conclave do Fortíssimo até o seu último suspiro. Recuar não é uma opção. Volte com seu instrumento pesado nas mãos, ou morra nas mãos de seus próprios irmãos como desertor.
  `),
  imageUrl: "https://cdn.discordapp.com/attachments/1150285916204703784/1155217482177577030/FortissimoConclaveBanner.png",
  emoji: "<:FortissimoConclaveIconMini:1155222333477367850>",
});
factionsData.push({
  name: "Sindicato Ostinato",
  description: dedent(`
  # :OstinatoSindicateIconMini: Sindicato Ostinato

  Enquanto [Solasí](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156624640240779275>) se despedaçava em uma guerra musical sem sentido que até o Ostinato participou no começo, [Mifaah](<https://discord.com/channels/1149824330507767869/1152263280002351125/1155194608133881876>), a representante deles decidiu ouvir as histórias descredibilizadas dos imigrantes de [Soneto](<https://discord.com/channels/1149824330507767869/1156623996427718797/1156624378314899486>) - uma decisão da qual ela nunca vai se arrepender, pois transformou os integrantes da facção dela nos maiores heróis das Terras Músicais...
  
  O Sindicato Ostinato foi a segunda facção a se levantar contra o [Obscuro](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156630757205348352>), deixando a guerra musical para trás sem pensar duas vezes, sendo completamente alocada no hemisfério leste, onde ficou exposta a ataques da [Legião Silente](<https://discord.com/channels/1149824330507767869/1150285916204703784/1155204653219328191>) que não estava ciente da destituição deles da guerra e dos novos e desconhecidos inimigos: as criaturas do [Obscuro](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156630757205348352>).
  
  Com Maestria, o Sindicato Ostinato resistiu, enquanto ao mesmo tempo defendia [Solasí](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156624640240779275>) da destruição completa pelo [Obscuro](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156630757205348352>). Os integrantes dessa facção não são apenas vistos como heróis, como também são respeitados por todos os Maestros que passam por eles, e as histórias dos dois mensageiros do Sindicato Ostinato que levaram o pedido de ajuda para [Dorehn](<https://discord.com/channels/1149824330507767869/1152263280002351125/1155198957337718886>), enfrentando o [Obscuro](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156630757205348352>) de cabeça, virou uma lenda e atração principal de [Solasí](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156624640240779275>) em todos os hemisférios, que é repetida para crianças e em histórias épicas para aumentar o espírito de força de todos os amantes da música.
  
  Eles possuem um estilo musical muito imponente, que utiliza todos os tipos de notas sem escolher a proveniência delas. Sejam selvagens, tímidas ou vaidosas, um membro do Sindicato Ostinato não discrimina e não julga, pois para eles, tudo o que existe tem seu propósito, assim como [Lírico](<https://discord.com/channels/1149824330507767869/1156623928731648040/1156624256302579742>) foi construída para proteger [Solasí](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156624640240779275>) do [Obscuro](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156630757205348352>), como acredita [Mifaah](<https://discord.com/channels/1149824330507767869/1152263280002351125/1155194608133881876>), que afirma com propriedade que estava tudo dentro dos planos do [Grande Condutor](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156624677070979112>).
  
  Os estudantes, Maestros Armados e professores do Ostinato não possuem nenhuma regra específica para seguir, mas carregam um consenso de valores entre eles que é referência para qualquer habitante de [Solasí](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156624640240779275>):
  
  - Não se deixe abalar por motivos triviais. Mesmo que não saiba, pode haver alguém se apoiando na sua força de vontade e motivação. Se você cair, essa pessoa também caíra. Seja forte;
  - Não subestime seus inimigos e respeite o espaço de seus aliados. Se um Maestro tentar criar um conflito com você, derrote-o construtivamente;
  - Só ajude quem realmente quiser seu auxílio. Não se anule por ninguém.
  `),
  emoji: "<:OstinatoSindicateIconMini:1155222338699264132>",
  imageUrl: "https://media.discordapp.net/attachments/1150285916204703784/1155215287566745680/OstinatoSindicateBanner.png",
});
factionsData.push({
  name: "Capela Láurea",
  description: dedent(`
  # :LaureaChapelIconMini:  Sobreviventes da Capela Láurea

  Com a fama de desenvolver as melhores composições que a Terra Musical já viu, a Capela Láurea manteve o exemplo da disciplina na música e o respeito às notas que compartilham espaço com os Maestros... até a tragédia de [Soneto](<https://discord.com/channels/1149824330507767869/1156623996427718797/1156624378314899486>).
  
  Eles não se envolveram nas guerras sangrentas promovidas pelos discípulos, mas fizeram questão de auxiliar os feridos de ambos os lados enquanto ainda existiam em grandes números, o que apenas aumentou o reconhecimento deles como os verdadeiros obstáculos do caos total.
  
  Quando o [Obscuro](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156630757205348352>) atacou [Soneto](<https://discord.com/channels/1149824330507767869/1156623996427718797/1156624378314899486>) e levou [Soolas](<https://discord.com/channels/1149824330507767869/1152263280002351125/1155201639284752424>), os Maestros de renome da Capela Láurea desapareceram junto do discípulo e depois da fuga da população para [Lírico](<https://discord.com/channels/1149824330507767869/1156623928731648040/1156624256302579742>), os integrantes dessa facção se tornaram raríssimos.
  
  Ver o emblema da Capela Láurea em alguém ainda é sinal de sorte e benção. Quer dizer que você está bem acompanhado e seguro, desde que a música fale por você, pois está diante de não apenas um Maestro excelente, mas um que provavelmente já enfrentou as criaturas que estão destruindo [Solasí](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156624640240779275>) por inteiro.
  
  Em algumas escolas de [Solasí](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156624640240779275>) ainda existem professores, já velhos, espalhando a sabedoria de [Soolas](<https://discord.com/channels/1149824330507767869/1152263280002351125/1155201639284752424>) e mantendo a chama da Capela Láurea acesa. Todas as outras facções trabalham sem parar para mantê-los em segurança. Infelizmente, a graduação de integrantes para essa facção, apesar do número crescente de interesse é exageradamente pequena por conta das exigências ao corpo, a alma e as notas.
  
  Verdade seja dita: O equilíbrio não foi feito para todos.
  
  Como um estudante, professor ou Maestro Armado da Capela Láurea, as responsabilidades são extensas:
  
  - Promover a proteção dos Maestros acima da sua, sempre. Como um herdeiro da iluminação de [Soolas](<https://discord.com/channels/1149824330507767869/1152263280002351125/1155201639284752424>), o seu trabalho é enfrentar a escuridão que apenas a luz verdadeira pode revelar;
  - Demonstrar compaixão e empatia ao invés de orgulho, independente de sua proveniência. Quem compõe suas músicas não são seus dedos, mas seu coração;
  - Respeitar as notas da atmosfera como irmãs. Elas são sua fonte de vida e o motivo de tudo existir. Precisam de você tanto quanto você precisa delas;
  - Jamais abandonar um Maestro, mesmo que esse esteja assimilado pelo [Obscuro](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156630757205348352>): a esperança só se perde quando a Capela Láurea não está mais presente. Se você estiver de pé, não há motivo para temer.
  `),
  emoji: "<:LaureaChapelIconMini:1155222335020867594>",
  imageUrl: "https://media.discordapp.net/attachments/1150285916204703784/1155219360995082341/LaureaChapelBanner.png",
});
const instrumentsData = new Array<Prisma.InstrumentCreateInput>();
instrumentsData.push({
  name: "Violoncelo Leve",
  description: "Uma arma-instrumento para quem gosta de mobilidade, mas de artilharia pesada também.",
  imageUrl: "https://i.imgur.com/ZZRCahf.png",
  isBeginner: true,
});
instrumentsData.push({
  name: "Harpa Marreta",
  description: "Uma arma-instrumento para quem gosta de música delicada, mas uma boa briga.",
  imageUrl: "https://i.imgur.com/KvTSqyP.png",
  isBeginner: true,
});
instrumentsData.push({
  name: "Flauta Seringa",
  description: "Uma arma-instrumento para quem gosta de fluidez e medicina. É normalmente usada como uma pequena lança também",
  imageUrl: "https://i.imgur.com/5v1WZ2j.png",
  isBeginner: true,
});
instrumentsData.push({
  name: "Guitarra-Machado",
  description: "Uma arma-instrumento para quem gosta de música pesada e destruição. É a arma padrão de vários cadentes da linha de frente de Solasí.",
  imageUrl: "https://i.imgur.com/LsmttLd.png",
  isBeginner: true,
});
instrumentsData.push({
  name: "Violão de Éter",
  description:
    "É de surpreender qualquer vibrato um Maestro comum conseguir utilizar uma dessas. É uma arma-instrumento muito poderosa, mas que exige um grande domínio da música.",
  imageUrl: "https://i.imgur.com/5Y6xMSb.png",
  isBeginner: true,
});
instrumentsData.push({
  name: "Lira Ágil",
  description: "Uma arma-instrumento para aqueles que valorizam a destreza e rapidez. Sua melodia encanta enquanto confunde inimigos.",
  imageUrl: "https://i.imgur.com/nTKUDqd.png",
  isBeginner: true,
});
instrumentsData.push({
  name: "Trompa Frequente",
  description: "Perfeita para guerreiros que desejam manter o ritmo constante em batalha, sua frequência sonora pode ser ensurdecedora.",
  imageUrl: "https://i.imgur.com/REeC5DC.png",
  isBeginner: true,
});
instrumentsData.push({
  name: "Cimbalo da Escuridão",
  description: "Com tons profundos, esta arma-instrumento tem o poder de invocar as sombras e controlar a escuridão.",
  imageUrl: "https://i.imgur.com/6hjLs3T.png",
  isBeginner: true,
});
instrumentsData.push({
  name: "Harpa-Arco de Éter",
  description: "Seu som parece vir de outra dimensão, e dizem que quem a toca pode se comunicar com seres do éter.",
  imageUrl: "https://i.imgur.com/sx5bmSp.png",
  isBeginner: true,
});
instrumentsData.push({
  name: "Percurssão de Quantum",
  description: "Para aqueles que buscam controlar as leis da física com música. Cada batida ressoa através do espaço-tempo.",
  imageUrl: "https://i.imgur.com/uwnRBiN.png",
  isBeginner: true,
});
instrumentsData.push({
  name: "Zímbalo do Vácuo",
  description: "Sua melodia é quase silenciosa, mas tem o poder de sugar tudo ao seu redor, criando um vácuo poderoso.",
  imageUrl: "https://i.imgur.com/zmN7T1e.png",
  isBeginner: true,
});
instrumentsData.push({
  name: "Violino de Notas Cortantes",
  description: "Cada nota tocada é tão afiada que pode cortar o ar, ideal para Maestros que buscam atacar à distância.",
  imageUrl: "https://i.imgur.com/9IqK5vS.png",
  isBeginner: true,
});
instrumentsData.push({
  name: "Triângulos Sencientes",
  description: "Estes triângulos possuem vontade própria e são perfeitos para distrair inimigos com suas melodias imprevisíveis.",
  imageUrl: "https://i.imgur.com/EdnPnQw.png",
  isBeginner: true,
});
instrumentsData.push({
  name: "Harpa Atiradora",
  description: "Além de criar belas melodias, suas cordas podem ser disparadas como flechas letais.",
  imageUrl: "https://i.imgur.com/8tGhWeP.png",
  isBeginner: true,
});
instrumentsData.push({
  name: "Violão Iluminado",
  description: "Emana uma luz brilhante enquanto é tocado, sendo tanto uma fonte de inspiração quanto uma arma luminosa.",
  imageUrl: "https://i.imgur.com/XXH2ade.png",
  isBeginner: true,
});
instrumentsData.push({
  name: "Violoncelo Grave",
  description: "Seus tons graves têm a capacidade de causar tremores no chão, desequilibrando os adversários.",
  imageUrl: "https://i.imgur.com/MmdhFMo.png",
  isBeginner: true,
});
instrumentsData.push({
  name: "Piano de Notas Reforçadas",
  description: "Cada tecla é uma fortaleza, e sua música é tão robusta quanto uma muralha de defesa.",
  imageUrl: "https://i.imgur.com/8KhEAbS.png",
  isBeginner: true,
});
instrumentsData.push({
  name: "Clarim Desalinhado",
  description: "Sua melodia desorienta e confunde, tornando-o uma arma valiosa em emboscadas.",
  imageUrl: "https://i.imgur.com/X4FRW1d.png",
  isBeginner: true,
});
instrumentsData.push({
  name: "Pianos Translucidos",
  description: "Quase invisíveis, mas sua melodia é claramente poderosa. Perfeitos para emboscadas sonoras.",
  imageUrl: "https://i.imgur.com/xGf1jPO.png",
  isBeginner: true,
});
instrumentsData.push({
  name: "Contrafagote Cego",
  description: "Não se deixe enganar pela sua aparência simples, sua música pode cegar temporariamente quem o escuta.",
  imageUrl: "https://i.imgur.com/CpsQpc5.png",
  isBeginner: true,
});
instrumentsData.push({
  name: "Flauta da Destreza",
  description: "Perfeita para movimentos rápidos e ataques ágeis, sua melodia eleva a destreza de quem a ouve.",
  imageUrl: "https://i.imgur.com/T3PU2PX.png",
  isBeginner: true,
});
instrumentsData.push({
  name: "Citara Imperativa",
  description: "Quem ouve sua melodia se sente compelido a obedecer, tornando-se uma ferramenta valiosa de comando.",
  imageUrl: "https://i.imgur.com/K9TW4us.png",
  isBeginner: true,
});
instrumentsData.push({
  name: "Guitarra dos Vultos",
  description: "Seu som invoca sombras que dançam e atacam ao ritmo da música, perfeita para ataques surpresa.",
  imageUrl: "https://i.imgur.com/8XdTJpY.png",
  isBeginner: true,
});

const racesData = new Array<Prisma.RaceCreateInput>();
racesData.push({
  name: "Cadentes",
  description: dedent(`
  # Cadentes

  > Harmonia da Cadência
  
  Altura Mínima: 170cm
  Altura Máxima: 185cm
  Instrumentos Favoritos: 
  - Lira Ágil
  - Trompa Frequente
  - Cimbalo da Escuridão
  
  Olhos vermelhos, orelhas pontudas e um olhar intimidador acompanhado de movimentos simétricos e infalíveis, armados com um coração que nunca perde a sintonia com os seus instrumentos. Esses são os Cadentes, a linha de frente de [Solasí](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156624640240779275>) contra o [Obscuro](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156630757205348352>).
  
  De todos os Maestros que nascem em [Solasí](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156624640240779275>), os Cadentes são rapidamente identificados pelas suas características únicas e agilidade. É impossível olhar para um Cadente e ter dúvidas sobre sua procedência.
  
  Geralmente portam uma personalidade mais reclusa e são facilmente atraídos por músicas com um badalar constante e poucas pausas. Não é incomum vê-los fazendo dinheiro extra em bares e apresentações ao ar livre com um semblante oposto ao que geralmente estão acostumados para si mesmos.
  
  Eles não apenas são assassinos furtivos maravilhosos, como também possuem habilidades inacreditáveis, como:
  
  - Mesclar a si mesmos com as notas que atiram, permitindo teleporte até onde a nota for;
  - Formar instrumentos de notas caídas: podem reparar e criar armas de notas derrubadas ou arremessadas por outros maestros;
  - Controlar elementos da escuridão com as notas: capazes de criar sombras para confundir inimigos e despistar perseguidores utilizando o poder da música.
  `),
  imageUrl: "https://i.imgur.com/sb69Xyp.png",
});
racesData.push({
  name: "Vibratos",
  description: dedent(`
  # Vibratos
  > Ser e Não Ser
  
  Altura Mínima: Indefinida
  Altura Máxima: Indefinida
  Instrumentos Favoritos:
  - Harpa de Éter
  - Percurssão de Quantum
  - Zímbalo do Vácuo
  
  Antes dos [Cadentes](<https://discord.com/channels/1149824330507767869/1155233901153894430/1155247361287782500>) assumirem a responsabilidade pelas linhas de frente de [Solasí](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156624640240779275>) contra o [Obscuro](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156630757205348352>), os Vibratos já estavam há meses lutando contra as criaturas malignas enviadas por ele, defendendo [Lírico](<https://discord.com/channels/1149824330507767869/1156623928731648040/1156624256302579742>), a capital da maioria dos integrantes dessa espécie de Maestro.
  
  Eles são extremamente corajosos e são capazes de alternar entre uma forma física e etérea, que apesar de também ser tangível e alvejável, é muito poderosa quando ganha tamanho, já que pode ser usada para esmagar muitos inimigos de uma vez só.
  
  Os olhos deles brilham em um dourado forte e em suas formas etéreas se parecem com sombras cósmicas tomadas por estrelas e constelações que não tem limite de tamanho.
  
  As habilidades dos Vibratos estão relacionadas com as suas capacidades que transcendem o físico, e se diversificam bastante:
  - São os únicos capazes de utilizarem instrumentos etéreos, que não podem ser alvejados pelo [Obscuro](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156630757205348352>) e também podem ser mesclados com o corpo de um Vibrato, desde que ele seja experiente o suficiente pra aguentar uma simbiose dessa.
  - Podem absorver notas benéficas no ambiente para ganhar tamanho em suas formas etéreas e usar dessa força para esmagar inimigos ou simplesmente assustar o que tiver no caminho deles.
  - O corpo deles pode expandir o suficiente para se tornar um escudo esférico para os aliados, com o obvio custo de se machucarem caso atacados. Sem contar que, em suas formas etéreas, eles podem voar livremente.
  `),
  imageUrl: "https://i.imgur.com/TL1jKSp.png",
});
racesData.push({
  name: "Lullabies",
  description: dedent(`
  # Lullabies
  > Canções de Ninar
  
  Altura Mínima: 40cm
  Altura Máxima: 80cm
  Instrumentos Favoritos: 
  - Violino de Notas Cortantes
  - Triângulos Sencientes
  - Harpa Atiradora
  
  Pequeninos e em geral facilmente irritáveis, os Lullabies são a obra-prima do [Grande Condutor](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156624677070979112>). Dizem as escrituras que quando foram criados os céus de [Solasí](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156624640240779275>) permaneceram abertos por meses e uma grande época de fartura tomou as Terras Musicais por conta da paz que as canções deles traziam para as plantações.
  
  Diferente do que a aparência adorável tenta transparecer, eles não são tão inofensivos e também são os Maestros que vivem por mais tempo entre todos os outros que existem em [Solasí](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156624640240779275>). [Siih](<https://discord.com/channels/1149824330507767869/1152263280002351125/1152263718147719249>), a primeira Lullaby tem pelo menos duzentos anos registrados.
  
  Os cabelos deles são bem coloridos e seus olhos portam pequenas estrelas, quase invisíveis, mas estão lá. Essas estrelas mudam de forma de acordo com o que estão sentindo e também controlam a intensidade da cor de seus cabelos ao girar. Isso acontece quando o Lullaby experiencia emoções.
  
  As habilidades deles são tão notáveis quanto a falta de tamanho, e impressionam qualquer um que não é habituado a eles:
  - Como esperado, podem induzir sono muito rapidamente em qualquer coisa viva. Se o alvo não estiver preparado, irá dormir em poucos segundos, talvez pela última vez...
  - São extremamente fortes em suas pernas e braços, o que os torna em ótimos escaladores. Eles não tem absolutamente nenhuma dificuldade em se locomover verticalmente.
  - Se estiverem muito focados em suas composições, podem literalmente flutuar. 
  `),
  imageUrl: "https://i.imgur.com/gVoxUeF.png",
});
racesData.push({
  name: "Prestos",
  description: dedent(`
  # Prestos
  > Eficiência Musical
  
  Altura Mínima: 170cm
  Altura Máxima: 195cm
  Instrumentos Favoritos:
  - Violão Iluminado
  - Violoncelo Grave
  - Piano de Notas Reforçadas
  
  Vindos diretamente de um conto de fadas, como dizem os outros Maestros, os Prestos são seres de luz. É muito raro, se não praticamente impossível vê-los verdadeiramente entristecidos - possuem tanto otimismo que as vezes é irritante.
  
  Estão sempre entre os seus iguais, é difícil vê-los isolados; trabalham muito bem em equipe, principalmente quando há vínculos entre os participantes de uma composição e se adequam bem com instrumentos exóticos e difíceis de usar, sem contar que suas canções naturalmente curam aliados próximos e revitalizam o ambiente ao redor.
  
  Além de serem os mais altos entre todos os habitantes de [Solasí](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156624640240779275>), suas vozes reverberam mesmo quando estão falando casualmente, como se sempre houvesse ruídos de brilhos embutidos em suas cordas vocais. Eles brilham em uma aura dourada que se intensifica quando cantam ou tocam e são considerados por  [Solasí](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156624640240779275>) como os Maestros mais bonitos por voto democrático.
  
  Além da fama dos Prestos, eles possuem grande importância nas linhas de frente contra o [Obscuro](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156630757205348352>):
  - Quando uma batalha é vencida pelos Maestros de [Solasí](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156624640240779275>), um grande batalhão de Prestos é enviado para revitalizar as zonas perdidas e recuperar o que um dia foi das Terras Musicais. A música deles também é utilizada na medicina, até mesmo em primeiros socorros urgentes. 
  - Junto com os [Lullabies](<https://discord.com/channels/1149824330507767869/1155233901153894430/1155249147197276170>), os Prestos podem compor músicas que literalmente explodem as Criaturas do [Obscuro](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156630757205348352>) após fazê-las dormir.
  - Os animais de  [Solasí](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156624640240779275>) os adoram. Eles tem uma afinidade instantânea com todos eles, só precisam abrir a boca ou mover os dedos e deixar as notas fazerem seu trabalho. 
  `),
  imageUrl: "https://i.imgur.com/lGRo1j2.png",
});
racesData.push({
  name: "Dissonas",
  description: dedent(`
  # Dissonas
  > Imprevisibilidade Instrumental
  
  Altura Mínima: 145cm
  Altura Máxima: 175cm
  Instrumentos Favoritos:
  - Clarim Desalinhado
  - Pianos Translucidos
  - Contrafagote Cego
  
  Decidir acreditar que os Dissonas são cegos é a melhor forma de mentir para si mesmo. É justo dizer, na verdade, que eles enxergam muito mais do que todos os outros Maestros de [Solasí](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156624640240779275>), mesmo sendo incapazes de visualizar seus semelhantes.
  
  Mais lentos que os outros Maestros, os Dissonas trabalham com músicas calmas e tomam seu tempo ao compor.
  
  Os cabelos deles possuem cores frias e seguem a cor de seus olhos. A personalidade da maioria deles segue o mesmo semblante que é expressado através das suas melancólicas composições. É uma característica de todos eles, apesar da diversidade, uma voz pausada e calma.
  
  Normalmente estão vendados, já que seus olhos não funcionam como os dos outros, mas quando não estão, expõem uma luz intensa através deles que se assemelha a que é vista nos olhos das criaturas do [Obscuro](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156630757205348352>).
  
  Eles geralmente tomam o lugar de suporte em pelotões, mas podem ser extremamente mortíferos quando querem, pois são capazes de:
  - Drenar as notas de um Maestro ou a energia do [Obscuro](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156630757205348352>) com suas canções e melodias, de forma lenta e cruel, sugando a energia para que possam usá-las para alimentar maestros aliados ou converter em notas nocivas para retribuir o ataque.
  - Gerar notas apenas com a canção: Os Dissonas são os únicos capazes de gerar notas no ambiente sem a necessidade de uma arma-instrumento. Isso é extremamente poderoso se eles estiverem sozinhos e desarmados, pois ainda assim podem se defender.
  - São completamente imunes a qualquer habilidade de ilusão e não podem ser enganados com sombras ou desaparecimentos estratégicos, pois enxergam a essência do que quer que estejam enfrentando - suas ondas internas e sua força vital, não a forma física.
  `),
  imageUrl: "https://i.imgur.com/6ra83qz.png",
});
racesData.push({
  name: "Staccatos",
  description: dedent(`
  # Staccatos
  > A Navalha Musical
  
  Altura Mínima: 160cm
  Altura Máxima: 190cm
  Instrumentos Favoritos:
  - Flauta da Destreza
  - Citara Imperativa
  - Guitarra dos Vultos
  
  Representados majoritariamente pela [Legião Silente](<https://discord.com/channels/1149824330507767869/1150285916204703784/1155204653219328191>), os Staccatos, mesmo depois da proposta de paz alcançada com a união dos discípulos contra o [Obscuro](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156630757205348352>) sofrem um preconceito absurdo por conta da fama do primeiro deles - [Tacet](<https://discord.com/channels/1149824330507767869/1152263280002351125/1152280491727274067>), o discípulo do silêncio.
  
  Eles são caracterizados por várias tatuagens ao redor de seu corpo e rosto, de diversos formatos e significados. Não é incomum ouvir lendas épicas sobre como o [Grande Condutor](<https://discord.com/channels/1149824330507767869/1156624610830340196/1156624677070979112>) desenhou elas à mão, com um carinho único para cada Staccato que existe. Ao redor deles, uma aura verde se acumula, acentuando a cor peculiar da pele deles, que flutua de acordo com a textura do ambiente, como a de camaleões.
  
  Eles se camuflam muito bem e com a ajuda das notas, podem controlar tudo o que depende da fotossíntese, como árvores e jardins inteiros.
  
  A melancolia é um ponto forte neles. Não tanto quanto nos [Dissonas](<https://discord.com/channels/1149824330507767869/1155233901153894430/1155252434621431819>), mas mesmo com uma personalidade muito diversa entre esses Maestros, o dueto romântico e entristecido é bem popular.
  
  O semblante geral que portam é de desconfiança, dada a forma que cresceram nas capitais - enfrentando preconceito constante, mas há quem diga que, de longe, eles são os maestros mais humildes que alguém pode ter o prazer de encontrar.
  
  Por terem uma afinidade maior com o silêncio do que os outros Maestros, muitos acreditam que os Staccatos se limitam a apenas ele, mas essa é uma assunção muito errada. As habilidades deles se diversificam fortemente:
  - Suas notas podem envenenar seus inimigos sem que eles percebam, bem lentamente. Quando menos esperarem, já estão nos chãos, sem forças e indefesos.
  - Podem usar suas habilidades de camuflagem em Maestros aliados também, à custo de notas e força vital.
  - São mestres no combate corpo-a-corpo e podem usar notas da atmosfera como lâminas, desde que consigam alcançá-las para apanhá-las.
  `),
  imageUrl: "https://i.imgur.com/pSArSXg.png",
});
async function main() {
  const [user, factions, instruments, races] = await Promise.all([
    prisma.user.create({data: {id: "969062359442280548"}}),
    Promise.all(factionsData.map((faction) => prisma.faction.create({data: faction}))),
    Promise.all(instrumentsData.map((instrument) => prisma.instrument.create({data: instrument}))),
    Promise.all(racesData.map((race) => prisma.race.create({data: race}))),
  ]);

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
      factionId: factions[0].id,
      imageUrl: "https://i.imgur.com/sEeWlHf.jpg",
      gender: "Feminino",
      weight: "65KG",
      height: "180cm",
      personality: "...",
      raceId: races[4].id,
      instruments: {create: {instrumentId: instruments[0].id, quantity: 1}},
    },
  });

  console.log({user, factions, instruments, races, character});
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
