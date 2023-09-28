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
  modals: {
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
    somethingWentWrong: "Algo deu errado, tente novamente.",
    entityCreationError: "Erro ao criar entidade. Tente novamente.",
    tooManyInstruments: "Você já escolheu um instrumento. Estamos resetando para que você possa escolher outro.",
    imageLinkError: "O link da imagem não é válido. Tente com um link que termina com .png, .jpg,etc.",
    raceAlreadySelected: "Você já escolheu uma raça. Estamos resetando para que você possa escolher outra.",
    factionAlreadySelected: "Você já escolheu uma facção. Estamos resetando para que você possa escolher outra.",
  },
  feedback: {
    essentials: {
      submitted: "Campos essenciais enviados, continue preenchendo os outros campos.",
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
  },
};
