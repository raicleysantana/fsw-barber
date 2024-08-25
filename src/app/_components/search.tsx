"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { SearchIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "./ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form"
import { Input } from "./ui/input"

const formSchema = z.object({
  search: z
    .string({
      required_error: "Campo Obrigatório",
    })
    .trim()
    .min(1, "Campo obrigatório"),
})

interface SearchProps {
  defaultValues?: z.infer<typeof formSchema>
}

const Search = ({ defaultValues }: SearchProps) => {
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data)

    router.push(`/barbershops?search=${data.search}`)
  }

  return (
    <Form {...form}>
      <div className="mt-6 flex items-center gap-2">
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex w-full gap-2"
        >
          <FormField
            control={form.control}
            name="search"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input placeholder="Busque por uma barbearia" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <Button variant={"default"} type="submit">
            <SearchIcon />
          </Button>
        </form>
      </div>
    </Form>
  )
}

export default Search
