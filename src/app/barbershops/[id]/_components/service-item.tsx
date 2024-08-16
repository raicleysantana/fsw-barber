"use client"

import { Button } from "@/app/_components/ui/button"
import { Card, CardContent } from "@/app/_components/ui/card"
import { BarbershopService } from "@prisma/client"
import { signIn } from "next-auth/react"
import Image from "next/image"

interface ServiceItemProps {
  service: BarbershopService
  isAuthenticated?: boolean
}

const ServiceItem = ({ service, isAuthenticated }: ServiceItemProps) => {
  const handleBookingClick = () => {
    if (!isAuthenticated) {
      return signIn("google")
    }
  }

  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-3">
        <div className="relative min-h-[110px] min-w-[110px] max-w-[110px]">
          <Image
            src={service.imageUrl}
            alt={service.name}
            fill
            className="rounded-xl object-cover"
          />
        </div>

        <div className="flex w-full flex-col">
          <h2 className="text-sm font-semibold">{service.name}</h2>
          <p className="text-sm text-gray-400">{service.description}</p>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm font-bold text-primary">
              {Intl.NumberFormat("pt-br", {
                style: "currency",
                currency: "BRL",
              }).format(Number(service.price))}
            </p>

            <Button
              variant={"secondary"}
              size={"sm"}
              onClick={handleBookingClick}
            >
              Reservar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ServiceItem
