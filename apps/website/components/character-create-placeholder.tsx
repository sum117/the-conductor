import {Character, User} from "@prisma/client";
import {ToastAction} from "@radix-ui/react-toast";
import {Plus} from "lucide-react";
import React from "react";
import {useMutation, useQueryClient} from "react-query";
import ptBr from "translations";
import {CharacterForm, CharacterFormValues} from "./character-form";
import {Button, buttonVariants} from "./ui/button";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "./ui/dialog";
import {useToast} from "./ui/use-toast";

const characterCreateQuery = () => ({
  mutationKey: "character-create",
  mutationFn: async (values: CharacterFormValues & {userId: string | undefined}) => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/characters/create`, {
      body: JSON.stringify(values),
      method: "POST",
      headers: {"Content-Type": "application/json"},
    });

    return response.json() as Promise<Character & {messageLink: string}>;
  },
});

export function CharacterCreatePlaceholder() {
  const [isOpen, setIsOpen] = React.useState(false);
  const {toast} = useToast();
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData<User>("user");
  const {mutateAsync, isLoading} = useMutation(characterCreateQuery());

  async function onSubmit(values: CharacterFormValues) {
    try {
      const createdData = await mutateAsync({...values, userId: user?.id});
      toast({
        title: ptBr.feedback.send.submitted,
        description: ptBr.feedback.send.alt,
        action: (
          <ToastAction altText={ptBr.feedback.send.submittedDescription} asChild>
            <a target="_blank" className={buttonVariants({variant: "outline"})} href={createdData.messageLink}>
              {ptBr.feedback.send.submittedAction}
            </a>
          </ToastAction>
        ),
      });
      await queryClient.invalidateQueries({queryKey: ["characters"]});
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: ptBr.errors.somethingWentWrong,
        description: ptBr.errors.somethingWentWrongDescription,
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => setIsOpen(!isOpen)}>
      <DialogTrigger asChild>
        <button className="border-border grid h-96 w-56 place-content-center border bg-none">
          <Plus />
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-scroll p-4  max-sm:max-h-[100svh] sm:max-w-[553px]">
        <DialogHeader>
          <DialogTitle className="">{ptBr.form.createChar}</DialogTitle>
          <DialogDescription>{ptBr.form.createCharDescription}</DialogDescription>
        </DialogHeader>
        {isOpen && (
          <CharacterForm
            onSubmit={onSubmit}
            submit={
              <DialogFooter className="col-span-full mt-2">
                <Button type="submit" disabled={isLoading}>
                  {ptBr.form.sendChar}
                </Button>
              </DialogFooter>
            }
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
