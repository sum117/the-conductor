export const ptBr = {
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
  },
  buttons: {
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
    beginnerInstrument: "Iniciante",
    characterList: {
      footer: "Personagem {currentIndex} de {characterCount}",
    },
  },
  modals: {
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
    poll: {
      name: "enquete",
      description: "Cria uma enquete.",
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
      },
    },
  },
  errors: {
    setCharacter: "Erro ao definir personagem. Tente novamente mais tarde.",
    noCharacters: "Esse usuário não tem nenhum personagem.",
    somethingWentWrong: "Algo deu errado, tente novamente.",
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
      submitted: "✅ Personagem enviado para aprovação.",
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
    editingNotice:
      "{user}, você tem 30 minutos para editar sua mensagem. Qualquer mensagem que você enviar editará a mensagem com a reação de edição. Para cancelar a edição, remova a reação de edição.",
    editingCancelled: "Edição cancelada.",
  },
};
