import { redirect } from "next/navigation"
import BarbershopItem from "../_components/barbershop-item"
import Header from "../_components/header"
import Search from "../_components/search"
import { db } from "../_lib/prisma"

interface BarbeshopPageProps {
  searchParams: {
    search?: string
  }
}
const BarbershopPage = async ({ searchParams }: BarbeshopPageProps) => {
  if (!searchParams.search) {
    return redirect("/")
  }

  const barbershops = await db.barbershop.findMany({
    where: {
      name: {
        contains: searchParams.search,
        mode: "insensitive",
      },
    },
  })

  return (
    <>
      <Header />

      <div className="flex flex-col gap-6 px-5 py-6">
        <Search
          defaultValues={{
            search: searchParams.search,
          }}
        />

        <div className="text xs font-bold uppercase text-gray-400">
          Resultados para &quot;{searchParams.search}&quot;
        </div>

        <div className="mt-3 grid grid-cols-2 gap-4">
          {barbershops.map((barbershop) => (
            <div key={barbershop.id} className="w-full">
              <BarbershopItem barbershop={barbershop} />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default BarbershopPage
