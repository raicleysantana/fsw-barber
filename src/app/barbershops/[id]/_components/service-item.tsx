"use client"

import { Button } from "@/app/_components/ui/button"
import { Calendar } from "@/app/_components/ui/calendar"
import { Card, CardContent } from "@/app/_components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/_components/ui/sheet"
import { Barbershop, BarbershopService, Booking } from "@prisma/client"
import { addDays, format, setHours, setMinutes } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Loader2 } from "lucide-react"
import { signIn, useSession } from "next-auth/react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { getDayBookings } from "../_actions/get-day-bookings"
import { saveBooking } from "../_actions/save-booking"
import { generateDayTimeList } from "../_helpers/hours"

interface ServiceItemProps {
  barbershop: Barbershop
  service: BarbershopService
  isAuthenticated?: boolean
}

const ServiceItem = ({
  barbershop,
  service,
  isAuthenticated,
}: ServiceItemProps) => {
  const { data } = useSession()

  const router = useRouter()

  const [date, setDate] = useState<Date | undefined>(undefined)
  const [hour, setHour] = useState<String | undefined>()
  const [submitIsLoading, setSubmitIsLoading] = useState(false)
  const [sheetIsOpen, setSheetIsOpen] = useState(false)
  const [dayBooking, setDayBooking] = useState<Booking[]>([])

  useEffect(() => {
    if (!date) return

    const refreshAvalibleHours = async () => {
      const _dayBookings = await getDayBookings(barbershop.id, date)

      setDayBooking(_dayBookings)
    }

    refreshAvalibleHours()
  }, [date, barbershop.id])

  const handleBookingClick = () => {
    if (!isAuthenticated) {
      return signIn("google")
    }
  }

  const handleDateClick = (date: Date | undefined) => {
    setDate(date)
    setHour(undefined)
  }

  const handleHourClick = (time: string) => {
    setHour(time)
  }

  const timeList = useMemo(() => {
    if (!date) return []

    return generateDayTimeList(date).filter((time) => {
      const timeHour = Number(time.split(":")[0])
      const timeMinute = Number(time.split(":")[1])

      const booking = dayBooking.find((booking) => {
        const bookingHour = booking.date.getHours()
        const bookingMinute = booking.date.getMinutes()

        return bookingHour === timeHour && bookingMinute === timeMinute
      })

      if (!booking) return true

      return false
    })
  }, [])

  const handleBookingSubmit = async () => {
    setSubmitIsLoading(true)

    try {
      if (!hour || !date || !data?.user) {
        return
      }

      const dateHour = Number(hour.split(":")[0])
      const dateMinutes = Number(hour.split(":")[1])

      const newDate = setMinutes(setHours(date, dateHour), dateMinutes)

      await saveBooking({
        serviceId: service.id,
        babershopId: barbershop.id,
        date: newDate,
        userId: (data.user as any).id,
      })

      setSheetIsOpen(false)
      setHour(undefined)
      setDate(undefined)

      toast("Reserva realizada com sucesso", {
        description: format(newDate, "'Para' dd 'de' MMMM 'às' HH':'mm'.'", {
          locale: ptBR,
        }),
        action: {
          label: "Visualizar",
          onClick: () => router.push("/bookings"),
        },
      })
    } catch (error) {
      console.error(error)
    } finally {
      setSubmitIsLoading(false)
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

            <Sheet open={sheetIsOpen} onOpenChange={setSheetIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant={"secondary"}
                  size={"sm"}
                  onClick={handleBookingClick}
                >
                  Reservar
                </Button>
              </SheetTrigger>

              <SheetContent className="p-0">
                <SheetHeader className="border-b border-solid border-secondary px-5 py-6 text-left">
                  <SheetTitle>Reservar</SheetTitle>
                </SheetHeader>

                <div className="py-6">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateClick}
                    className="mt-6"
                    locale={ptBR}
                    fromDate={addDays(new Date(), 1)}
                    styles={{
                      head_cell: {
                        width: "100%",
                        textTransform: "capitalize",
                      },
                      cell: {
                        width: "100%",
                      },
                      button: {
                        width: "100%",
                      },
                      nav_button_previous: {
                        width: "32px",
                        height: "32px",
                      },
                      nav_button_next: {
                        width: "32px",
                        height: "32px",
                      },
                      caption: {
                        textTransform: "capitalize",
                      },
                    }}
                  />
                </div>

                {date && (
                  <div className="flex gap-3 overflow-x-auto border-t border-solid border-secondary px-5 py-6 [&::-webkit-scrollbar]:hidden">
                    {timeList.map((time) => (
                      <Button
                        variant={hour === time ? "default" : "outline"}
                        className="rounded-full"
                        key={time}
                        onClick={() => handleHourClick(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                )}

                <div className="border-t border-solid border-secondary px-5 py-6">
                  <Card>
                    <CardContent className="flex flex-col gap-3 p-3">
                      <div className="flex justify-between">
                        <h2 className="font-bold">{service.name}</h2>

                        <h3 className="text-sm font-bold">
                          {""}
                          {Intl.NumberFormat("pt-br", {
                            style: "currency",
                            currency: "BRL",
                          }).format(Number(service.price))}
                        </h3>
                      </div>

                      {date && (
                        <div className="flex justify-between">
                          <h3 className="text-sm text-gray-400">Data</h3>

                          <h4 className="text-sm capitalize">
                            {format(date, "dd 'de' MMMM", {
                              locale: ptBR,
                            })}
                          </h4>
                        </div>
                      )}

                      {hour && (
                        <div className="flex justify-between">
                          <h3 className="text-sm text-gray-400">Horário</h3>

                          <h4 className="text-sm capitalize">{hour}</h4>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <h3 className="text-sm text-gray-400">Barbearia</h3>

                        <h4 className="text-sm capitalize">
                          {barbershop.name}
                        </h4>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <SheetFooter className="px-5">
                  <Button
                    onClick={handleBookingSubmit}
                    disabled={!hour || !date || submitIsLoading}
                  >
                    {submitIsLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Confirmar Reserva
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ServiceItem
