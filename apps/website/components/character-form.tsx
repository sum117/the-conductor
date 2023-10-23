import {zodResolver} from "@hookform/resolvers/zod";
import {Faction, Instrument, Race} from "@prisma/client";
import React from "react";
import {useForm} from "react-hook-form";
import {useQuery} from "react-query";
import ptBr from "translations";
import {getSafeKeys} from "utilities";
import {z} from "zod";
import {SELECT_FIELDS, TEXT_AREA_FIELDS} from "../data/constants";
import {cn} from "../lib/utils";
import {characterSchema} from "../schemas/characterSchema";
import LazyImage from "./lazy-image";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "./ui/form";
import {Input} from "./ui/input";
import * as SelectPrimitive from "./ui/select";
import {Textarea} from "./ui/textarea";

export type CharacterFormValues = z.infer<typeof characterSchema>;

const racesQuery = () => ({
  queryKey: "races",
  queryFn: async () => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/races`);
    const races = await response.json();
    return races as Array<Race>;
  },
});

const factionsQuery = () => ({
  queryKey: "factions",
  queryFn: async () => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/factions`);
    const factions = await response.json();
    return factions as Array<Faction>;
  },
});

const instrumentQuery = () => ({
  queryKey: "instruments",
  queryFn: async () => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/instruments`);
    const instruments = await response.json();
    return instruments as Array<Instrument>;
  },
});

type SelectFieldKey = (typeof SELECT_FIELDS)[number];
function SelectItem({type, option}: {type: SelectFieldKey; option: Pick<Instrument, "id" | "imageUrl" | "name">}) {
  switch (type) {
    case "instrument":
      return (
        <SelectPrimitive.SelectItem key={option.id} value={option.id.toString()}>
          <div className="flex items-center">
            <LazyImage src={option.imageUrl} alt={option.name} cover className="mr-2 h-4 w-4" />
            <span>{option.name}</span>
          </div>
        </SelectPrimitive.SelectItem>
      );
    default:
      return (
        <SelectPrimitive.SelectItem key={option.id} value={option.id.toString()}>
          {option.name}
        </SelectPrimitive.SelectItem>
      );
  }
}

export function CharacterForm({submit, onSubmit}: {submit: React.ReactNode; onSubmit: (values: CharacterFormValues) => void}) {
  const {data: factions, error: factionsFetchError} = useQuery(factionsQuery());
  const {data: races, error: racesFetchError} = useQuery(racesQuery());
  const {data: instruments, error: instrumentsFetchError} = useQuery(instrumentQuery());

  const form = useForm<CharacterFormValues>({
    resolver: zodResolver(characterSchema),
    defaultValues: {
      name: "",
      age: "",
      appearance: "",
      backstory: "",
      faction: "",
      gender: "",
      height: "",
      imageUrl: "",
      personality: "",
      race: "",
      surname: "",
      instrument: "",
      weight: "",
    },
  });

  if (racesFetchError || factionsFetchError || instrumentsFetchError) return <p>{ptBr.errors.somethingWentWrong}</p>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-2 px-4 max-sm:grid-cols-1">
        {getSafeKeys(characterSchema.keyof().Enum).map((key) => {
          if (SELECT_FIELDS.includes(key)) {
            const selectContentMap = {
              instrument: instruments,
              race: races,
              faction: factions,
            };
            const options = selectContentMap[key as SelectFieldKey];

            return (
              <FormField
                key={key}
                control={form.control}
                name={key}
                render={({field}) => (
                  <FormItem className={cn(key === "instrument" ? "col-span-full" : "")}>
                    <FormLabel>{ptBr.character[key]}</FormLabel>
                    <FormControl>
                      <SelectPrimitive.Select onValueChange={field.onChange}>
                        <SelectPrimitive.SelectTrigger>
                          <SelectPrimitive.SelectValue placeholder={ptBr.character[key]} />
                        </SelectPrimitive.SelectTrigger>
                        <SelectPrimitive.SelectContent className="max-h-64 overflow-y-auto">
                          {options?.map((option) => <SelectItem type={key as SelectFieldKey} option={option} />)}
                        </SelectPrimitive.SelectContent>
                      </SelectPrimitive.Select>
                    </FormControl>
                    <FormDescription>{ptBr.form.character[key].description}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          } else if (TEXT_AREA_FIELDS.includes(key)) {
            return (
              <FormField
                key={key}
                control={form.control}
                name={key}
                render={({field}) => (
                  <FormItem className="col-span-full">
                    <FormLabel>{ptBr.character[key]}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={ptBr.form.character[key].placeholder} className="resize-none overflow-x-hidden break-words blur-none" {...field} />
                    </FormControl>
                    <FormDescription>{ptBr.form.character[key].description}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          }

          return (
            <FormField
              key={key}
              control={form.control}
              name={key}
              render={({field}) => (
                <FormItem className={cn(key === "imageUrl" ? "col-span-full" : "")}>
                  <FormLabel>{ptBr.character[key]}</FormLabel>
                  <FormControl>
                    <Input placeholder={ptBr.form.character[key].placeholder} {...field} />
                  </FormControl>
                  <FormDescription>{ptBr.form.character[key].description}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        })}
        {submit}
      </form>
    </Form>
  );
}
