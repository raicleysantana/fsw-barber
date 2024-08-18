import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import BookingItem from "../_components/booking-item"
import Header from "../_components/header"
import { db } from "../_lib/prisma"
import { authOption } from "../api/auth/[...nextauth]/route"

const Bookings = async () => {
  const session = await getServerSession(authOption)

  if (!session?.user) redirect("/") // return signIn("google")

  const _confirmedBookings = db.booking.findMany({
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

  const _finishedBookings = db.booking.findMany({
    where: {
      userId: (session.user as any).id,
      date: {
        lt: new Date(),
      },
    },
    include: {
      service: true,
      barbershop: true,
    },
  })

  const [confirmedBookings, finishedBookings] = await Promise.all([
    _confirmedBookings,
    _finishedBookings,
  ])

  return (
    <>
      <Header />

      <div className="px-5 py-6">
        <h1 className="mb-6 text-xl font-bold">Agendamentos</h1>

        {confirmedBookings.length > 0 && (
          <h2 className="mb-3 mt-6 text-sm uppercase text-gray-400">
            Confirmados
          </h2>
        )}

        <div className="flex flex-col gap-3">
          {confirmedBookings.map((booking) => (
            <BookingItem key={booking.id} booking={booking} />
          ))}
        </div>

        {finishedBookings.length > 0 && (
          <>
            <h2 className="mb-3 mt-6 text-sm uppercase text-gray-400">
              Finalizados
            </h2>

            <div className="flex flex-col gap-3">
              {finishedBookings.map((booking) => (
                <BookingItem key={booking.id} booking={booking} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default Bookings
