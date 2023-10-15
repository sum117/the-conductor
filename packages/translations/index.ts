import {credentials} from "utilities";

export default {
  routes: {
    home: "Início",
    characters: "Personagens",
    wiki: "Wiki",
    wikiCharacters: "Wiki/Personagens",
  },
  website: {
    back: "Voltar",
    summary: "Sumário",
    title: "Maestro Obscuro",
    description: "Um servidor de RP de música.",
    image: "https://i.imgur.com/eXZ4n76.png",
    url: "https://maestro-obscuro.com.br",
    navigation: "Navegue entre as páginas do servidor.",
  },
  welcomeCard: {
    loggedIn: "Você está logado no website, use o menu para navegar!",
    title: "Bem vindo ao Website do Maestro Obscuro!",
    description: "Você só pode acessar esse website se estiver dentro do servidor e ele não tem muita utilidade até o momento se você não possuir personagens.",
    loginHelp: "Para fazer login utilize o botão de login no canto superior direito da tela, na barra de navegação.",
    tip: "Clique na Siih para entrar no servidor!",
  },
  login: "Login",
  npc: {
    prefix: "Prefixo",
    owners: "Usuários com Acesso",
    rarity: {common: "NPC Comum", uncommon: "NPC Incomum", rare: "NPC Raro", epic: "NPC Épico", legendary: "NPC Lendário"},
  },
  none: "Nenhum",
  noneF: "Nenhuma",
  characterDetails: {
    playerMade: "Feito por Jogador",
    characteristics: "Características",
    affiliations: "Afiliações",
  },
  form: {
    delete: {
      confirmation: "Tem certeza que deseja deletar esse personagem?",
    },
    searchChar: "Pesquisar personagem",
    createCharDescription: "Crie seu novo personagem aqui e pressione enviar quando terminar.",
    createChar: "Criar personagem",
    sendChar: "Enviar personagem",
    character: {
      name: {description: "O nome do seu personagem.", placeholder: "Anastasia"},
      surname: {description: "O sobrenome do seu personagem.", placeholder: "Romanov"},
      personality: {description: "A personalidade do seu personagem.", placeholder: "Alegre, extrovertida, etc."},
      backstory: {description: "A história do seu personagem.", placeholder: "Nascida em 1901, etc."},
      age: {description: "A idade do seu personagem.", placeholder: "20"},
      faction: {description: "A facção do seu personagem.", placeholder: "Facção dos Magos"},
      appearance: {description: "A aparência do seu personagem.", placeholder: "Cabelos loiros, olhos azuis, etc."},
      race: {description: "A raça do seu personagem.", placeholder: "Humano"},
      instrument: {description: "O instrumento do seu personagem.", placeholder: "Harpa Atiradora"},
      height: {description: "A altura do seu personagem.", placeholder: "1.70 (Use esse formato)"},
      gender: {description: "O gênero do seu personagem.", placeholder: "Feminino"},
      weight: {description: "O peso do seu personagem.", placeholder: "60KG (Use esse formato)"},
      imageUrl: {description: "A URL da imagem do seu personagem.", placeholder: "Link que termina com .png, .jpg, etc."},
    },
  },
  character: {
    name: "Nome",
    surname: "Sobrenome",
    personality: "Personalidade",
    backstory: "História",
    age: "Idade",
    faction: "Facção",
    appearance: "Aparência",
    race: "Raça",
    instrument: "Instrumento Inicial",
    height: "Altura",
    gender: "Gênero",
    weight: "Peso",
    userId: "ID do usuário",
    imageUrl: "URL da imagem",
    lastSeen: "Última vez Visto(a) em",
    instruments: "Instrumentos",
  },
  pagination: {
    previous: "Anterior",
    next: "Próximo",
    start: "Início",
    end: "Fim",
  },
  submission: {
    title: "Criação de personagem",
    description: "Clique no botão abaixo para criar um personagem.",
    footerText: "Caso tenha alguma dúvida, entre em contato com um dos moderadores.",
  },
  createCharacter: {
    title: "Você está criando seu personagem!",
    description: "Preencha as seções clicando nos botões abaixo.\n\nQuando terminar, clique em **ENVIAR**.",
    footerText: "É comum que hajam erros nessa etapa,\nentão não se contenha em pedir ajuda.",
    websiteCharFooterText: "Esse personagem foi criado através do website, que legal!",
  },
  buttons: {
    dismiss: "Descartar",
    displayCharacterProfile: "Ver perfil Completo",
    essentials: "Essenciais",
    appearance: "Aparência",
    send: "Enviar",
    createCharacter: "Criar personagem",
    approve: "Aprovar",
    reject: "Rejeitar",
  },
  selectMenus: {
    race: {
      placeholder: "Selecione uma raça",
    },
    instrument: {
      placeholder: "Selecione um instrumento",
    },
    faction: {
      placeholder: "Selecione uma facção",
    },
  },
  embeds: {
    noDescriptionProvided: "Nenhuma descrição foi fornecida.",
    beginnerInstrument: "Iniciante",
    characterList: {
      footer: "Personagem {currentIndex} de {characterCount}",
    },
  },
  modals: {
    rpChannelEditor: {
      title: "Editor de Canal de RP",
      name: {label: "Nome do canal", placeholder: "Nome do canal"},
      description: {label: "Descrição do canal", placeholder: "Descrição do canal"},
      imageUrl: {label: "URL da imagem", placeholder: "URL da imagem"},
    },
    aboutMe: {
      title: "Sobre mim",
      newAboutMe: {
        placeholder: "Escreva sobre você.",
        label: "Sobre mim",
      },
    },
    essentials: {
      title: "Campos Essenciais",
      name: {
        placeholder: "Anastasia",
        label: "Nome",
      },
      surname: {
        placeholder: "Romanov",
        label: "Sobrenome",
      },
      personality: {
        placeholder: "Alegre, extrovertida, etc.",
        label: "Personalidade",
      },
      backstory: {
        placeholder: "Nascida em 1901, etc.",
        label: "História",
      },
      age: {
        placeholder: "20",
        label: "Idade",
      },
    },
    appearance: {
      title: "Aparência",
      height: {
        placeholder: "1.70 (Use esse formato)",
        label: "Altura",
      },
      gender: {
        placeholder: "Feminino",
        label: "Gênero",
      },
      weight: {
        placeholder: "60KG (Use esse formato)",
        label: "Peso",
      },
      appearance: {
        placeholder: "Cabelos loiros, olhos azuis, etc.",
        label: "Aparência",
      },
      imageUrl: {
        placeholder: "Link que termina com .png, .jpg, etc.",
        label: "URL da imagem",
      },
    },
    entityCreator: {
      race: {
        title: "Criador de Raças",
        name: {
          label: "Nome",
          placeholder: "O nome da raça.",
        },
        description: {
          label: "Descrição",
          placeholder: "A descrição da raça.",
        },
        imageUrl: {
          label: "URL da imagem da Raça",
          placeholder: "Link que termina com .png, .jpg, etc.",
        },
      },
      faction: {
        title: "Criador de Facções",
        name: {
          label: "Nome da Facção",
          placeholder: "Facção dos Magos",
        },
        description: {
          label: "Descrição da Facção",
          placeholder: "A facção dos magos é...",
        },

        imageUrl: {
          label: "URL da imagem da Facção",
          placeholder: "Link que termina com .png, .jpg, etc.",
        },
        emoji: {
          label: "Emoji da Facção",
          placeholder: "<:emoji:123456789012345678>",
        },
      },
      instrument: {
        title: "Criador de Instrumentos",
        name: {
          label: "Nome do Instrumento",
          placeholder: "Harpa Atiradora",
        },
        description: {
          label: "Descrição do Instrumento",
          placeholder: "Uma harpa que atira notas afiadas.",
        },
        imageUrl: {
          label: "URL da imagem do Instrumento",
          placeholder: "Link que termina com .png, .jpg, etc.",
        },
      },
    },
  },
  commands: {
    listNPCs: {name: "listar-npcs", description: "Lista todos os NPCs do servidor."},
    help: {
      name: "ajuda",
      description: "Mostra todos os comandos.",
    },
    delete: {
      name: "deletar",
      description: "Deleta uma quantidade de mensagens.",
      options: {amount: {name: "quantidade", description: "A quantidade de mensagens para deletar."}},
    },
    assignNPC: {
      name: "atribuir-npc",
      description: "Atribui um NPC para um usuário.",
      options: {
        user: {name: "usuario", description: "O usuário para atribuir o NPC."},
        npc: {name: "npc", description: "O NPC para atribuir ao usuário."},
      },
    },
    deleteNPC: {
      name: "deletar-npc",
      description: "Deleta um NPC.",
      options: {name: {name: "nome", description: "O nome do NPC."}},
    },
    createNPC: {
      name: "criar-npc",
      description: "Cria um NPC.",
      options: {
        prefix: {name: "prefixo", description: "O prefixo do NPC."},
        iconUrl: {name: "url-do-icone", description: "A URL do ícone do NPC."},
        imageUrl: {name: "url-da-imagem", description: "A URL da imagem do NPC."},
        rarity: {name: "raridade", description: "A raridade do NPC."},
        name: {name: "nome", description: "O nome do NPC."},
        description: {name: "descricao", description: "A descrição do NPC."},
        title: {name: "titulo", description: "O título do NPC."},
      },
    },
    toggleNPCMode: {name: "alternar-modo-npc", description: "Ativa o modo NPC."},
    editRpChannel: {
      name: "editar-canal-de-rp",
      description: "Edita um canal de RP com novas configurações.",
      options: {channel: {name: "canal", description: "O canal para editar."}},
    },
    poll: {
      name: "enquete",
      description: "Cria uma enquete.",
      options: {
        title: {name: "titulo", description: "O título da enquete e uma barra `|`."},
        options: {name: "opcoes", description: "As opções da enquete separadas por ;."},
      },
    },
    setCharacter: {
      description: "Define um personagem para jogar.",
      name: "setar-personagem",
      options: {
        character: {
          name: "personagem",
          description: "O personagem para definir.",
        },
      },
    },
    charactersList: {
      description: "Lista todos os personagens de um jogador.",
      name: "listar-personagens",
      options: {
        user: {
          name: "usuário",
          description: "O usuário para listar os personagens.",
        },
      },
    },
    repSomeone: {
      description: "Dá um ponto de reputação para alguém a cada 24 horas.",
      name: "elogiar",
      options: {
        user: {
          name: "usuário",
          description: "O usuário para dar reputação.",
        },
      },
    },
    profile: {
      description: "Mostra seu perfil ou o perfil de um usuário.",
      name: "perfil",
      options: {
        user: {
          name: "usuário",
          description: "O usuário para mostrar o perfil.",
        },
      },
    },
    setAboutMe: {
      description: "Define sua seção sobre mim.",
      name: "setar-sobre-mim",
    },
    submission: {
      name: "criar-modal-de-personagem",
      description: "Cria um modal de personagem",
    },
    entityCreator: {
      name: "criador-de-entidades",
      description: "Cria uma entidade nova no servidor.",
      options: {
        entityType: {
          name: "tipo-de-entidade",
          description: "O tipo de entidade a ser criada.",
        },
      },
      autocomplete: {
        race: "Raça",
        instrument: "Instrumento",
        faction: "Facção",
        npc: "NPC",
      },
    },
  },
  errors: {
    listNPCs: "Erro ao listar NPCs. Tente novamente mais tarde.",
    helpMessage: "Erro ao enviar mensagem de ajuda. Tente novamente mais tarde.",
    assignNPC: "Erro ao atribuir NPC. Tente novamente mais tarde.",
    createNPC: "Erro ao criar NPC. Tente novamente mais tarde.",
    toggleNPCMode: "Erro ao alternar o modo NPC. Tente novamente mais tarde.",
    nPCnotFound:
      "⚠️ Você está usando o modo de NPC, mas não foi encontrado nenhum NPC registrado no seu usuário OU com esse prefixo. Saia do modo NPC para usar seu personagem padrão.",
    editingChannel: "Erro ao editar o canal. Tente novamente mais tarde.",
    updatingChannel: "Erro ao atualizar o canal. Tente novamente mais tarde.",
    setCharacter: "Erro ao definir personagem. Tente novamente mais tarde.",
    noCharacters: "Esse usuário não tem nenhum personagem.",
    somethingWentWrong: "Algo deu errado, tente novamente.",
    somethingWentWrongDescription: "Se o erro persistir, entre em contato com um moderador.",
    aboutMe: "Erro ao definir sobre mim. Tente novamente.",
    entityCreationError: "Erro ao criar entidade. Tente novamente.",
    tooManyInstruments: "Você já escolheu um instrumento. Estamos resetando para que você possa escolher outro.",
    imageLinkError: "O link da imagem não é válido. Tente com um link que termina com .png, .jpg,etc.",
    raceAlreadySelected: "Você já escolheu uma raça. Estamos resetando para que você possa escolher outra.",
    factionAlreadySelected: "Você já escolheu uma facção. Estamos resetando para que você possa escolher outra.",
    generatingProfile: "Erro ao gerar esse perfil. Tente novamente mais tarde.",
    reputation: "Erro ao dar reputação. Tente novamente mais tarde.",
    listCharacters: "Erro ao listar personagens. Tente novamente mais tarde.",
  },
  profile: {
    aboutMe: {
      title: "SOBRE",
      nowUsing: "Atualmente cenando com",
      placeholder: "Esse usuário não preencheu essa seção.",
    },
    stats: {
      totalXp: "XP Total",
      totalPosts: "Posts",
      totalCharacters: "Personagens",
    },
  },
  feedback: {
    mentorRequest:
      "Seja bem vindo, {user}! Você foi atribuido a(o) mentor(a) {mentor}. Entre em contato com ela(a) sempre que tiver uma dúvida. Ele(a) irá se apresentar para você em breve. Agradecemos a paciência! 💗",
    helpMessage: `# Ajuda do {botName}:\n⚠️ Você só está vendo comandos que tem permissão para utilizar.\n\n## Comandos de Slash\n{commands}\n\n## Comandos de Chat\n{simpleCommands}\n\n## Extras: \n\n**{botName}** tem funcionalidades de reação também:\n- 😍 para enviar uma mensagem para o <#${credentials.channels.roleplayStarboard}>\n- ❌ para deletar uma mensagem que você enviou com seu personagem ou ✏️ para editá-la.\n\n## Observações\nMensagens de RP só se tornam mensagens de personagens dentro das categorias de RP ou no canal <#${credentials.channels.randomRoleplay}>.`,
    deleteBulkLimit: "Você só pode deletar até 100 mensagens por vez.",
    assignedNPC: "✅ NPC {name} atribuído com sucesso para {user}!",
    deleteNPC: "✅ NPC {name} deletado com sucesso!",
    createNPC: "NPC {name} criado com sucesso!",
    toggleNPCMode: {true: "Modo NPC ativado.", false: "Modo NPC desativado."},
    sentToStarboard: "😍 Esse post foi enviado para o {channel}, parabéns {user}!",
    starboardMessage: "**{count}x** 😍 Esse post de {user} está em destaque. Muita gente gostou! Ele vem do canal {channel}",
    channelNotFound: "Canal não encontrado no banco de dados.",
    notAnEditableChannel: "Esse canal não pode ser editado.",
    loadingDone: "✅ Carregado, {user}!",
    loading: "⏲️ Carregando...",
    levelUp: "🎉 {user} subiu para o nível **{level}**, parabéns!",
    clubChatCleared:
      "🧹 Esse canal é completamente limpo todos os dias às 00:00. Escreva nele suas confissões, desabafos, ou o que quiser (dentro das regras do servidor).",
    setCharacter: {
      submitted: "{factionEmoji} Personagem **{name}** definido(a) com sucesso para RP.",
    },
    reputation: {
      self: "Você não pode dar reputação para si mesmo.",
      tooEarly: "Você já deu reputação para um usuário nas últimas 24 horas.",
      success: "Você deu +1 reputação para {user}!",
    },
    essentials: {
      submitted: "Campos essenciais enviados, continue preenchendo os outros campos.",
    },
    aboutMe: {
      submitted: "Sobre mim modificado com sucesso.",
    },
    appearance: {
      submitted: "Aparência enviada. Se não houver mais nenhuma mudança, clique em **ENVIAR**.",
    },
    send: {
      submitted: "Personagem enviado para aprovação.",
      submittedDescription: "Você pode clicar no botão ao lado para ser redirecionado para o canal de aprovação.",
      submittedAction: "Ir",
      alt: "Ir para o canal de aprovação",
    },
    evaluation: {
      waiting: "Ficha de {user} está aguardando aprovação, {mention}!",
      threadName: "Avaliação de {characterName}",
      approved: "Ficha de {user} foi aprovada por {mention}!",
      rejected: "Ficha de {user} foi rejeitada por {mention}!",
    },
    entityCreated: {
      race: "Raça {name} criada com sucesso!",
      instrument: "Instrumento {name} criado com sucesso!",
      faction: "Facção {name} criada com sucesso!",
    },
    editingNotice: "{user}, você tem 30 minutos para editar sua mensagem. Qualquer mensagem que você enviar editará a mensagem com a reação de edição.",
    editingCancelled: "Edição cancelada.",
  },
};
