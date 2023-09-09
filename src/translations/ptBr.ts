export const ptBr = {
  character: {
    name: "Nome",
    surname: "Sobrenome",
    personality: "Personalidade",
    backstory: "História",
    age: "Idade",
    appearance: "Aparência",
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
  },
  commands: {
    submission: {
      name: "criar-modal-de-personagem",
      description: "Cria um modal de personagem",
    },
  },
  errors: {
    somethingWentWrong: "Algo deu errado, tente novamente.",
    imageLinkError: "O link da imagem não é válido. Tente com um link que termina com .png, .jpg,etc.",
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
  },
};
