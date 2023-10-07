import {zodResolver} from "@hookform/resolvers/zod";
import {Faction, Race} from "@prisma/client";
import React, {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import ptBr from "translations";
import {getSafeKeys} from "utilities";
import {z} from "zod";
import {SELECT_FIELDS, TEXT_AREA_FIELDS} from "../data/constants";
import {cn} from "../lib/utils";
import {characterSchema} from "../schemas/characterSchema";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "./ui/form";
import {Input} from "./ui/input";
import * as SelectPrimitive from "./ui/select";
import {Textarea} from "./ui/textarea";

export function CharacterForm({submit}: {submit: React.ReactNode}) {
  const [raceOptions, setRaceOptions] = useState<Race[] | null>([]);
  const [factionOptions, setFactionOptions] = useState<Faction[] | null>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    async function fetchSelectOptions() {
      try {
        const racesResponse = await fetch(`${Bun.env.API_BASE_URL}/races`, {
          signal,
        });
        const factionsResponse = await fetch(`${Bun.env.API_BASE_URL}/factions`, {
          signal,
        });
        if (signal.aborted) return;
        const racesJson = racesResponse.ok ? await racesResponse.json() : null;
        const factionsJson = factionsResponse.ok ? await factionsResponse.json() : null;
        setRaceOptions(racesJson as Race[]);
        setFactionOptions(factionsJson as Faction[]);
      } catch (error) {
        if (error instanceof Error) setError(error.message);
        else setError(ptBr.errors.somethingWentWrong);
      }
    }

    fetchSelectOptions();
    return () => {
      abortController.abort();
    };
  }, []);
  const form = useForm<z.infer<typeof characterSchema>>({
    resolver: zodResolver(characterSchema),
  });

  function onSubmit(values: z.infer<typeof characterSchema>) {
    console.log(values);
  }

  if (error) return <p>{error}</p>;
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-2 px-4 max-sm:grid-cols-1">
        {getSafeKeys(characterSchema.keyof().Enum).map((key) => {
          if (SELECT_FIELDS.includes(key)) {
            return (
              <FormField
                key={key}
                control={form.control}
                name={key}
                render={({field}) => (
                  <FormItem>
                    <FormLabel>{ptBr.character[key]}</FormLabel>
                    <FormControl>
                      <SelectPrimitive.Select onValueChange={field.onChange}>
                        <SelectPrimitive.SelectTrigger>
                          <SelectPrimitive.SelectValue placeholder={ptBr.character[key]} />
                        </SelectPrimitive.SelectTrigger>
                        <SelectPrimitive.SelectContent>
                          {(key === "faction" ? factionOptions : raceOptions)?.map((option) => (
                            <SelectPrimitive.SelectItem key={option.id} value={option.id.toString()}>
                              {option.name}
                            </SelectPrimitive.SelectItem>
                          ))}
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
                      <Textarea placeholder={ptBr.form.character[key].placeholder} className="resize-none" {...field} />
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
