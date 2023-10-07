import {Plus} from "lucide-react";
import React from "react";
import {ptBr} from "../../translations/ptBr";
import {CharacterForm} from "./character-form";
import {Button} from "./ui/button";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "./ui/dialog";

export function CharacterCreatePlaceholder() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="grid h-96 w-56 place-content-center border border-border bg-none">
          <Plus />
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-scroll p-4 max-sm:max-h-screen sm:max-w-[553px]">
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