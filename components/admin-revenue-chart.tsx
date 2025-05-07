"use client"

import { useEffect, useRef } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"

interface AdminRevenueChartProps {
  appointments: any[]
}

export function AdminRevenueChart({ appointments }: AdminRevenueChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !appointments.length) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const canvas = canvasRef.current
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Get current month date range
    const today = new Date()
    const firstDay = startOfMonth(today)
    const lastDay = endOfMonth(today)

    // Get all days in the current month
    const daysInMonth = eachDayOfInterval({ start: firstDay, end: lastDay })

    // Calculate revenue for each day
    const dailyRevenue = daysInMonth.map((day) => {
      const dayAppointments = appointments.filter((appointment) =>
        isSameDay(new Date(appointment.appointment_date), day),
      )

      return {
        date: day,
        revenue: dayAppointments.reduce((total, appointment) => total + (appointment.payment_amount || 0), 0),
      }
    })

    // Chart dimensions
    const padding = 40
    const chartWidth = canvas.width - padding * 2
    const chartHeight = canvas.height - padding * 2

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw axes
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, canvas.height - padding)
    ctx.lineTo(canvas.width - padding, canvas.height - padding)
    ctx.strokeStyle = "#e2e8f0"
    ctx.stroke()

    // Find max value for scaling
    const maxRevenue = Math.max(...dailyRevenue.map((d) => d.revenue), 100) * 1.1

    // Draw revenue bars
    const barWidth = (chartWidth / dailyRevenue.length) * 0.6
    const barSpacing = chartWidth / dailyRevenue.length

    for (let i = 0; i < dailyRevenue.length; i++) {
      const { date, revenue } = dailyRevenue[i]
      const barHeight = (revenue / maxRevenue) * chartHeight
      const x = padding + i * barSpacing + barSpacing / 2 - barWidth / 2
      const y = canvas.height - padding - barHeight

      // Draw bar
      ctx.fillStyle = "#3b82f6"
      ctx.fillRect(x, y, barWidth, barHeight)

      // Draw date label (only for every 5th day to avoid crowding)
      if (i % 5 === 0 || i === dailyRevenue.length - 1) {
        ctx.fillStyle = "#64748b"
        ctx.font = "12px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(format(date, "d"), x + barWidth / 2, canvas.height - padding + 20)
      }

      // Draw revenue value for non-zero values
      if (revenue > 0) {
        ctx.fillStyle = "#1e293b"
        ctx.font = "12px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(`£${revenue}`, x + barWidth / 2, y - 10)
      }
    }

    // Draw y-axis labels
    const yAxisSteps = 5
    for (let i = 0; i <= yAxisSteps; i++) {
      const value = Math.round((maxRevenue / yAxisSteps) * i)
      const y = canvas.height - padding - (i / yAxisSteps) * chartHeight

      ctx.fillStyle = "#64748b"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(`£${value}`, padding - 10, y + 4)

      // Draw grid line
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(canvas.width - padding, y)
      ctx.strokeStyle = "#e2e8f0"
      ctx.stroke()
    }

    // Add month label
    ctx.fillStyle = "#1e293b"
    ctx.font = "14px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(format(today, "MMMM yyyy"), canvas.width / 2, padding - 15)
  }, [appointments])

  return (
    <div className="h-[300px] w-full">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}
