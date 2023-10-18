import {z} from "zod";

export const characterSchema = z.object({
  name: z.string({required_error: "O nome é obrigatório."}).max(128, {message: "O nome não pode ter mais de 128 caracteres."}),
  surname: z.string({required_error: "O sobrenome é obrigatório."}).max(128, {message: "O sobrenome não pode ter mais de 128 caracteres."}),
  personality: z.string({required_error: "A personalidade é obrigatória."}).max(1024, {message: "A personalidade não pode ter mais de 1024 caracteres."}),
  appearance: z.string({required_error: "A aparência é obrigatória."}).max(1024, {message: "A aparência não pode ter mais de 1024 caracteres."}),
  backstory: z.string({required_error: "A história é obrigatória."}).max(2048, {message: "A história não pode ter mais de 2048 caracteres."}),
  imageUrl: z.string({required_error: "A URL da Imagem é obrigatória"}).url({message: "O URL da imagem não é válido."}),
  age: z.string({required_error: "A idade é obrigatória."}).max(3, {message: "A idade não pode ter mais de 3 caracteres."}),
  height: z.string({required_error: "A altura é obrigatória."}).max(6, {message: "A altura não pode ter mais de 6 caracteres."}),
  gender: z.string({required_error: "O gênero é obrigatório."}).max(32, {message: "O gênero não pode ter mais de 32 caracteres."}),
  weight: z.string({required_error: "O peso é obrigatório."}).max(6, {message: "O peso não pode ter mais de 6 caracteres."}),
  race: z.string({required_error: "A raça é obrigatória."}),
  faction: z.string({required_error: "A facção é obrigatória."}),
  instrument: z.string({required_error: "O instrumento é obrigatório."}),
});
