import {Plus} from "lucide-react";
import React from "react";
import ptBr from "translations";
import useSwipe from "../hooks/useSwipe";
import {CharacterForm} from "./character-form";
import {Button} from "./ui/button";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "./ui/dialog";

export function CharacterCreatePlaceholder() {
  const [isOpen, setIsOpen] = React.useState(false);
  const swipeHandlers = useSwipe({onSwipedLeft: () => setIsOpen(false)});

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
        <CharacterForm
          submit={
            <DialogFooter className="col-span-full mt-2">
              <Button type="submit">{ptBr.form.sendChar}</Button>
            </DialogFooter>
          }
        />
      </DialogContent>
    </Dialog>
  );
}
