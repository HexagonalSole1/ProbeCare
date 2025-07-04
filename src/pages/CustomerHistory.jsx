import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { FiArrowLeft } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

export default function HistorialCliente() {
  const { id } = useParams()
  const [cliente, setCliente] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCliente = async () => {
      const { data, error } = await supabase.from("clientes").select("*").eq("id", id).single()
      if (error) {
        console.error("Error cargando cliente:", error)
      } else {
        setCliente(data)
      }
    }

    fetchCliente()
  }, [id])

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Historial de {cliente ? cliente.nombre : "..."}
          </h1>
          <p className="text-slate-500">Visualiza los servicios realizados</p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <FiArrowLeft className="mr-2" /> Volver
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Número de serie</TableHead>
                <TableHead>Fecha de llegada</TableHead>
                <TableHead>Tipo de servicio</TableHead>
                <TableHead>Asignación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Aquí se insertarán las filas dinámicamente más adelante */}
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-400">
                  No hay registros aún
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
