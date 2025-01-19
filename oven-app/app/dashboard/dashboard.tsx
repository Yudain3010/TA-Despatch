"use client"

import * as React from "react"
import { format, addMonths} from "date-fns"
import { io } from "socket.io-client"
import { Check, ChevronsUpDown, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList,} from "@/components/ui/command"
import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import axios from 'axios';
import { config } from "process"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const socket = io("http://localhost:5000")

export default function Dashboard() {
  const [logsData, setLogsData] = React.useState<any | null>(null)
  const [realtimeData, setRealtimeData] = React.useState<any | null>(null)
  const [selectedFilter, setSelectedFilter] = React.useState("No Filter")
  const [startDate, setStartDate] = React.useState<Date | null>(null)
  const [endDate, setEndDate] = React.useState<Date | null>(null)
  const [PM, setPM] = React.useState<string | null>(null);

  React.useEffect(() => {
    socket.on('data', (data) => {
      console.log('Received data:', data);
      setLogsData(data.logsData)
      setRealtimeData(data.realtimeData)
    })
  
    socket.emit('get_data')
  
    const interval = setInterval(() => {
      console.log('Requesting data...');
      socket.emit('get_data')
    }, 5000)
  
    return () => {
      socket.off('data')
      clearInterval(interval)
    }
  }, [])

  const handleUpdatePM = async() => {
    const today = format(new Date(), "yyyy-MM-dd");
    setPM(today);

    try {
      console.log("Sending PM value:", { PM: today });
      const response = await axios.patch('http://localhost:5000/write-data', { PM: today });
      console.log("PM update saved to Firebase:", response.data);
  } catch (error) {
      console.error("Error saving PM update:", error);
  }
  };

  const filterLogsByDate = (logsData: any, filter: string, startDate?: Date, endDate?: Date) => {
    const currentDate = new Date();
    const filteredLogs: any[] = [];

    switch (filter) {
      case "Today":
        logsData.forEach((log: any) => {
          const logDate = new Date(log.Timestamp);
          if (
            logDate.getDate() === currentDate.getDate() &&
            logDate.getMonth() === currentDate.getMonth() &&
            logDate.getFullYear() === currentDate.getFullYear()
          ) {
            filteredLogs.push(log);
          }
        });
        break;
      case "Custom Filter":
        logsData.forEach((log: any) => {
          const logDate = new Date(log.Timestamp);
          if (startDate && endDate) {
            if (logDate >= startDate && logDate <= endDate) {
              filteredLogs.push(log);
            }
          }
        });
        break;
      default:
        return logsData;
    }

    return filteredLogs.sort((a, b) => new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime());
};

  const filteredLogs = logsData ? filterLogsByDate(Object.values(logsData), selectedFilter, startDate, endDate) : []

  const filterOptions = [
    { value: "Today", label: "Today" },
    { value: "Custom Filter", label: "Custom Filter" },
    { value: "No Filter", label: "No Filter" },
  ]

  const chartData = {
    labels: filteredLogs.map((log: any) => format(new Date(log.Timestamp), "HH:mm:ss")),
    datasets: [
      {
        label: 'Temperature (°C)',
        data: filteredLogs.map((log: any) => log["Temperature"]),
        fill: false,
        borderColor: 'rgb(147, 105, 194)',
        tension: 0.1,
      }
    ]
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex gap-4">
        <Card className="w-1/2">
          <CardHeader>
            <CardTitle>Oven Despatch VRC2-19-1E</CardTitle>
          </CardHeader>
          <CardContent>
            {realtimeData ? (
              <div>
                <p><strong>Door Condition:</strong> {realtimeData["Door Condition"]}</p>
                <p><strong>Temperature:</strong> {realtimeData["Temperature"]}°C</p>
                <p><strong>Date:</strong> {realtimeData.Timestamp}</p>
                <p><strong>Last PM:</strong> {realtimeData["PM"] ? format(new Date(realtimeData["PM"]), "yyyy-MM-dd") : "No date"}</p>
                <p><strong>Next PM:</strong> {realtimeData["PM"] ? format(addMonths(new Date(realtimeData["PM"]),6), "yyyy-MM-dd") : "No date"}</p>
                <Button onClick={handleUpdatePM}>Update PM</Button>
              </div>
            ) : (
              <p>Loading real-time data...</p>
            )}
          </CardContent>
        </Card>

        <Card className="w-3/4">
          <CardHeader>
            <CardTitle>Temperature Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <Line data={chartData} />
            </div>
            <Button>Print Chart</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logs</CardTitle>
        </CardHeader>

        <CardContent>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[200px] justify-between mb-4"
              >
                {filterOptions.find(option => option.value === selectedFilter)?.label || "Select Filter"}
                <ChevronsUpDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search filter..." />
                <CommandList>
                  <CommandEmpty>No filter found.</CommandEmpty>
                  <CommandGroup>
                    {filterOptions.map((filter) => (
                      <CommandItem
                        key={filter.value}
                        onSelect={() => {
                          setSelectedFilter(filter.value)
                        }}
                      >
                        {filter.label}
                        <Check
                          className={`ml-auto ${selectedFilter === filter.value ? "opacity-100" : "opacity-0"}`}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {selectedFilter === "Custom Filter" && (
            <div className="mt-4 space-x-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-[280px] justify-start text-left font-normal"
                  >
                    <CalendarIcon />
                    {startDate ? format(startDate, "PPP") : <span>Pick a start date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-[280px] justify-start text-left font-normal"
                  >
                    <CalendarIcon />
                    {endDate ? format(endDate, "PPP") : <span>Pick an end date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Door Condition</TableHead>
                <TableHead>Temperature (°C)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length ? (
                filteredLogs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>{log.Timestamp ? format(new Date(log.Timestamp), "dd/MM/yyyy HH:mm:ss") : "No timestamp"}</TableCell>
                    <TableCell>{log["Door Condition"]}</TableCell>
                    <TableCell>{log["Temperature"]}°C</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">No logs available.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
