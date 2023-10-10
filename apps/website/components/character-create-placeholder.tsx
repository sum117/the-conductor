import {Character} from "@prisma/client";
import {ToastAction} from "@radix-ui/react-toast";
import {Plus} from "lucide-react";
import React from "react";
import {useQueryClient} from "react-query";
import {useLoaderData} from "react-router-dom";
import ptBr from "translations";
import useSwipe from "../hooks/useSwipe";
import {UserPrisma} from "../routes/root";
import {CharacterForm, CharacterFormValues} from "./character-form";
import {Button, buttonVariants} from "./ui/button";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "./ui/dialog";
import {useToast} from "./ui/use-toast";

export function CharacterCreatePlaceholder() {
  const [isOpen, setIsOpen] = React.useState(false);
  const swipeHandlers = useSwipe({onSwipedLeft: () => setIsOpen(false)});
  const {toast} = useToast();
  const queryClient = useQueryClient();
  const rootData = useLoaderData() as {user: UserPrisma; q: string} | null;
  async function onSubmit(values: CharacterFormValues) {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/characters/create`, {
      body: JSON.stringify({...values, userId: rootData?.user.id}),
      method: "POST",
      headers: {"Content-Type": "application/json"},
    });
    if (!response.ok) {
      toast({
        variant: "destructive",
        title: ptBr.errors.somethingWentWrong,
        description: ptBr.errors.somethingWentWrongDescription,
      });
      return;
    }

    const createdData = (await response.json()) as Character & {messageLink: string};

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
    await queryClient.invalidateQueries({queryKey: ["user"]});
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => setIsOpen(!isOpen)}>
      <DialogTrigger asChild>
        <button className="border-border grid h-96 w-56 place-content-center border bg-none">
          <Plus />
        </button>
      </DialogTrigger>
      <DialogContent {...swipeHandlers} className="max-h-[90svh] overflow-y-scroll p-4 max-sm:max-h-[100svh] sm:max-w-[553px]">
        <DialogHeader>
          <DialogTitle className="">{ptBr.form.createChar}</DialogTitle>
          <DialogDescription>{ptBr.form.createCharDescription}</DialogDescription>
        </DialogHeader>
        {isOpen && (
          <CharacterForm
            onSubmit={onSubmit}
            submit={
              <DialogFooter className="col-span-full mt-2">
                <Button type="submit">{ptBr.form.sendChar}</Button>
              </DialogFooter>
            }
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
