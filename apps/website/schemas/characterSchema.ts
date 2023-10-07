import {z} from "zod";

export const characterSchema = z.object({
  name: z.string({required_error: "O nome é obrigatório."}),
  surname: z.string({required_error: "O sobrenome é obrigatório."}),
  personality: z.string({required_error: "A personalidade é obrigatória."}),
  appearance: z.string({required_error: "A aparência é obrigatória."}),
  backstory: z.string({required_error: "A história é obrigatória."}),
  imageUrl: z.string({required_error: "A URL da Imagem é obrigatória"}).url({message: "O URL da imagem não é válido."}),
  age: z.string({required_error: "A idade é obrigatória."}),
  height: z.string({required_error: "A altura é obrigatória."}),
  gender: z.string({required_error: "O gênero é obrigatório."}),
  weight: z.string({required_error: "O peso é obrigatório."}),
  race: z.string({required_error: "A raça é obrigatória."}),
  faction: z.string({required_error: "A facção é obrigatória."}),
});
