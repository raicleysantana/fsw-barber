import { getServerSession } from "next-auth"
import Image from "next/image"
import BarbershopItem from "./_components/barbershop-item"
import BookingItem from "./_components/booking-item"
import Header from "./_components/header"
import Search from "./_components/search"
import { Button } from "./_components/ui/button"
import { quickSearchOptions } from "./_constants/search"
import { db } from "./_lib/prisma"
import { authOption } from "./api/auth/[...nextauth]/route"

export default async function Home() {
  const session = await getServerSession(authOption)

  const _barbershops = await db.barbershop.findMany()

  const _popularBarberShops = await db.barbershop.findMany({
    orderBy: {
      name: "desc",
    },
  })

  const _bookings = session?.user
    ? await db.booking.findMany({
        where: {
          userId: (session.user as any).id,
          date: {
            gte: new Date(),
          },
        },
        include: {
          service: true,
          barbershop: true,
        },
      })
    : Promise.resolve([])

  const [popularBarberShops, barbershops, bookings] = await Promise.all([
    _popularBarberShops,
    _barbershops,
    _bookings,
  ])

  return (
    <div>
      <Header />

      <div className="p-5">
        <h2 className="text-xl font-bold">
          {session?.user
            ? `Olá, ${session.user.name?.split(" ")[0]}!`
            : `Olá! Vamos agendar um corte hoje?`}
        </h2>

        <p>Segunda-feira, 05 de agosto</p>

        <Search />

        <div className="mt-6">
          {bookings.length > 0 && (
            <>
              <h2 className="mb-3 text-xs font-bold uppercase text-gray-400">
                Agendamentos
              </h2>
              <div className="flex gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                {bookings.map((booking) => (
                  <BookingItem key={booking.id} booking={booking} />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex gap-3 overflow-x-hidden [&::-webkit-scrollbar]:hidden">
          {quickSearchOptions.map((options) => (
            <Button className="gap-2" variant={"secondary"} key={options.title}>
              <Image
                src={options.imageUrl}
                alt={options.title}
                height={16}
                width={16}
              />
              {options.title}
            </Button>
          ))}
        </div>

        <div className="relative mt-6 h-[150px] w-full rounded-xl">
          <Image
            src={"/banner-01.png"}
            fill
            className="object-cover"
            alt="banner"
          />
        </div>

        {/* <BookingItem /> */}

        <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
          Recomendados
        </h2>

        <div className="flex gap-2 overflow-auto [&::-webkit-scrollbar]:hidden">
          {barbershops.map((barbershop) => (
            <div key={barbershop.id} className="min-w-[167px] max-w-[167px]">
              <BarbershopItem barbershop={barbershop} />
            </div>
          ))}
        </div>

        <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
          Populares
        </h2>

        <div className="flex gap-2 overflow-auto [&::-webkit-scrollbar]:hidden">
          {popularBarberShops.map((barbershop) => (
            <div key={barbershop.id} className="min-w-[167px] max-w-[167px]">
              <BarbershopItem barbershop={barbershop} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
