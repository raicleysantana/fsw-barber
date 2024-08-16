import { db } from "@/app/_lib/prisma"
import { authOption } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth"
import { notFound } from "next/navigation"
import BarbershopInfo from "./_components/barbershop-info"
import ServiceItem from "./_components/service-item"

interface BarbershopPageProps {
  params: {
    id: string
  }
}

const BarbershopPageDetailPage = async ({ params }: BarbershopPageProps) => {
  const session = await getServerSession(authOption)

  const barbershop = await db.barbershop.findFirst({
    where: {
      id: params.id,
    },
    include: {
      services: true,
    },
  })

  if (!barbershop) return notFound()

  return (
    <div>
      <BarbershopInfo barbershop={barbershop} />
      <div className="flex flex-col gap-4 px-5 py-6">
        {barbershop.services.map((service) => (
          <ServiceItem
            key={service.id}
            service={service}
            isAuthenticated={!!session?.user}
          />
        ))}
      </div>
    </div>
  )
}

export default BarbershopPageDetailPage
