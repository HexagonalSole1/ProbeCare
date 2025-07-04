import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Upload,
  FileText,
  CreditCard,
  Package,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  Hash,
  DollarSign,
  MessageSquare,
  FileUp,
  Send,
  Download,
  ExternalLink,
  Loader2,
} from "lucide-react";

export default function CustomerSale() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados existentes
  const [cliente, setCliente] = useState(null);
  const [modelo, setModelo] = useState("");
  const [numeroSerie, setNumeroSerie] = useState("");
  const [fechaVenta, setFechaVenta] = useState("");
  const [tipoPago, setTipoPago] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Estados para modales
  const [mostrarEntrada, setMostrarEntrada] = useState(false);
  const [archivosEntrada, setArchivosEntrada] = useState({
    solicitud: null,
    diagnostico: null,
    guia: null,
  });
  const [loadingEntrada, setLoadingEntrada] = useState(false);
  const [mensajeEntrada, setMensajeEntrada] = useState("");

  const [mostrarAutorizacion, setMostrarAutorizacion] = useState(false);
  const [archivosAutorizacion, setArchivosAutorizacion] = useState({
    cotizacion: null,
    pago: null,
  });
  const [loadingAutorizacion, setLoadingAutorizacion] = useState(false);
  const [mensajeAutorizacion, setMensajeAutorizacion] = useState("");

  const [mostrarSalida, setMostrarSalida] = useState(false);
  const [archivosSalida, setArchivosSalida] = useState({
    guiaEnvio: null,
    ordenRemision: null,
  });
  const [loadingSalida, setLoadingSalida] = useState(false);
  const [mensajeSalida, setMensajeSalida] = useState("");

  const [currentUser, setCurrentUser] = useState(null);

  // Verificar autenticación
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        setMensaje("Error: Usuario no autenticado");
        navigate("/login");
        return;
      }
      
      setCurrentUser(user);

      // Verificar/crear buckets de storage
      try {
        console.log("Verificando buckets de storage...");
        
        // Verificar bucket ventas
        const { data: ventasBucket } = await supabase.storage.getBucket('ventas');
        if (!ventasBucket) {
          console.log("Creando bucket ventas...");
          await supabase.storage.createBucket('ventas', { public: false });
        }

        // Verificar bucket entrada
        const { data: entradaBucket } = await supabase.storage.getBucket('entrada');
        if (!entradaBucket) {
          console.log("Creando bucket entrada...");
          await supabase.storage.createBucket('entrada', { public: false });
        }

        console.log("Buckets verificados/creados exitosamente");
      } catch (storageError) {
        console.error("Error con buckets de storage:", storageError);
        // No detener la aplicación por esto
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (!currentUser) return;

    const obtenerCliente = async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("nombre")
        .eq("id", id)
        .single();

      if (error) {
        setMensaje("Error al obtener cliente: " + error.message);
        return;
      }

      setCliente(data);
    };

    obtenerCliente();
  }, [id, currentUser]);

  const subirArchivo = async (bucket, path, file) => {
    try {
      console.log("Intentando subir archivo:", { bucket, path, fileName: file.name, fileSize: file.size });
      
      // Verificar que el usuario esté autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("Usuario no autenticado para subir archivo");
      }
      console.log("Usuario autenticado:", user.id);

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          upsert: true,
        });

      if (error) {
        console.error("Error uploading file:", error);
        console.error("Error details:", {
          message: error.message,
          statusCode: error.statusCode,
          error: error.error
        });
        throw new Error(`Error al subir archivo: ${error.message}`);
      }

      console.log("Archivo subido exitosamente:", data);

      const { data: urlData, error: urlError } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);
      
      if (urlError) {
        console.error("Error getting public URL:", urlError);
        throw new Error(`Error al obtener URL pública: ${urlError.message}`);
      }

      console.log("URL pública obtenida:", urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error("Error in subirArchivo:", error);
      throw error;
    }
  };

  const handleGuardarVenta = async () => {
    if (!modelo || !numeroSerie || !fechaVenta || !tipoPago) {
      setMensaje("Por favor completa todos los campos obligatorios.");
      return;
    }

    if (!currentUser) {
      setMensaje("Error: Usuario no autenticado");
      return;
    }

    setLoading(true);
    setMensaje("");

    try {
      console.log("Iniciando guardado de venta para cliente:", id);
      console.log("Usuario actual:", currentUser.id);

      let evidenciaUrl = null;
      if (archivo) {
        console.log("Subiendo archivo de evidencia...");
        const path = `ventas/${currentUser.id}/venta_${id}_${Date.now()}.pdf`;
        evidenciaUrl = await subirArchivo("ventas", path, archivo);
        console.log("Archivo subido, URL:", evidenciaUrl);
      }

      console.log("Insertando venta en base de datos...");
      const ventaData = {
        cliente_id: id,
        user_id: currentUser.id,
        modelo,
        numero_serie: numeroSerie,
        fecha_venta: fechaVenta,
        tipo_pago: tipoPago,
        comentarios,
        evidencia_url: evidenciaUrl,
      };
      console.log("Datos de venta:", ventaData);

      const { data, error } = await supabase.from("ventas").insert(ventaData);

      if (error) {
        console.error("Error detallado al insertar venta:", error);
        console.error("Error code:", error.code);
        console.error("Error hint:", error.hint);
        console.error("Error details:", error.details);
        throw new Error(`Error al guardar venta: ${error.message}`);
      }

      console.log("Venta guardada exitosamente:", data);
      setMensaje("¡Venta registrada exitosamente!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error) {
      console.error("Error completo al guardar venta:", error);
      setMensaje(error.message || "Error desconocido al guardar venta");
    }

    setLoading(false);
  };

  // Handlers para Entrada
  const handleArchivoEntradaChange = (e, tipo) => {
    setArchivosEntrada((prev) => ({
      ...prev,
      [tipo]: e.target.files[0],
    }));
  };

  const handleGuardarEntrada = async () => {
    if (!currentUser) {
      setMensajeEntrada("Error: Usuario no autenticado");
      return;
    }

    setMensajeEntrada("");
    setLoadingEntrada(true);

    try {
      // Verificar que hay archivos para subir
      const archivosParaSubir = Object.entries(archivosEntrada).filter(([_, file]) => file);
      
      if (archivosParaSubir.length === 0) {
        setMensajeEntrada("Por favor selecciona al menos un archivo.");
        setLoadingEntrada(false);
        return;
      }

      // Subir archivos
      const uploads = await Promise.all(
        archivosParaSubir.map(async ([tipo, file]) => {
          const path = `entrada/${currentUser.id}/${id}-${tipo}-${Date.now()}.pdf`;
          const url = await subirArchivo("entrada", path, file);
          return [tipo, url];
        })
      );

      const archivosURLs = Object.fromEntries(uploads);

      // Primero verificar que existe una venta para este cliente y usuario
      const { data: ventaExistente, error: selectError } = await supabase
        .from("ventas")
        .select("id")
        .eq("cliente_id", id)
        .eq("user_id", currentUser.id)
        .order("id", { ascending: false })
        .limit(1)
        .single();

      if (selectError || !ventaExistente) {
        throw new Error("No se encontró una venta para actualizar. Primero debes crear la venta.");
      }

      // Actualizar la venta específica
      const { error: updateError } = await supabase
        .from("ventas")
        .update({
          solicitud_pdf_url: archivosURLs.solicitud || null,
          diagnostico_pdf_url: archivosURLs.diagnostico || null,
          guia_pdf_url: archivosURLs.guia || null,
        })
        .eq("id", ventaExistente.id)
        .eq("user_id", currentUser.id);

      if (updateError) {
        console.error("Error al actualizar:", updateError);
        throw new Error("Error al actualizar la venta: " + updateError.message);
      }

      setMensajeEntrada("¡Archivos de entrada guardados correctamente!");
      setMostrarEntrada(false);
      setArchivosEntrada({ solicitud: null, diagnostico: null, guia: null });
    } catch (error) {
      console.error("Error en entrada:", error);
      setMensajeEntrada("Error: " + error.message);
    } finally {
      setLoadingEntrada(false);
    }
  };

  // Handlers para Autorización
  const handleArchivoAutorizacionChange = (e, tipo) => {
    setArchivosAutorizacion((prev) => ({
      ...prev,
      [tipo]: e.target.files[0],
    }));
  };

  const handleGuardarAutorizacion = async () => {
    if (!currentUser) {
      setMensajeAutorizacion("Error: Usuario no autenticado");
      return;
    }

    setMensajeAutorizacion("");
    setLoadingAutorizacion(true);

    try {
      // Verificar que hay archivos para subir
      const archivosParaSubir = Object.entries(archivosAutorizacion).filter(([_, file]) => file);
      
      if (archivosParaSubir.length === 0) {
        setMensajeAutorizacion("Por favor selecciona al menos un archivo.");
        setLoadingAutorizacion(false);
        return;
      }

      // Subir archivos
      const uploads = await Promise.all(
        archivosParaSubir.map(async ([tipo, file]) => {
          const path = `entrada/${currentUser.id}/${id}-${tipo}-${Date.now()}.pdf`;
          const url = await subirArchivo("entrada", path, file);
          return [tipo, url];
        })
      );

      const archivosURLs = Object.fromEntries(uploads);

      // Verificar que existe una venta
      const { data: ventaExistente, error: selectError } = await supabase
        .from("ventas")
        .select("id")
        .eq("cliente_id", id)
        .eq("user_id", currentUser.id)
        .order("id", { ascending: false })
        .limit(1)
        .single();

      if (selectError || !ventaExistente) {
        throw new Error("No se encontró una venta para actualizar. Primero debes crear la venta.");
      }

      // Actualizar la venta específica
      const { error: updateError } = await supabase
        .from("ventas")
        .update({
          cotizacion_pdf_url: archivosURLs.cotizacion || null,
          pago_pdf_url: archivosURLs.pago || null,
        })
        .eq("id", ventaExistente.id)
        .eq("user_id", currentUser.id);

      if (updateError) {
        console.error("Error al actualizar:", updateError);
        throw new Error("Error al actualizar la venta: " + updateError.message);
      }

      setMensajeAutorizacion("¡Archivos de autorización guardados correctamente!");
      setMostrarAutorizacion(false);
      setArchivosAutorizacion({ cotizacion: null, pago: null });
    } catch (error) {
      console.error("Error en autorización:", error);
      setMensajeAutorizacion("Error: " + error.message);
    } finally {
      setLoadingAutorizacion(false);
    }
  };

  // Handlers para Salida
  const handleArchivoSalidaChange = (e, tipo) => {
    setArchivosSalida((prev) => ({
      ...prev,
      [tipo]: e.target.files[0],
    }));
  };

  const handleGuardarSalida = async () => {
    if (!currentUser) {
      setMensajeSalida("Error: Usuario no autenticado");
      return;
    }

    setMensajeSalida("");
    setLoadingSalida(true);

    if (!archivosSalida.guiaEnvio) {
      setMensajeSalida("La Guía de envío es obligatoria.");
      setLoadingSalida(false);
      return;
    }

    try {
      // Subir archivos
      const uploads = await Promise.all(
        Object.entries(archivosSalida)
          .filter(([_, file]) => file)
          .map(async ([tipo, file]) => {
            const path = `entrada/${currentUser.id}/${id}-${tipo}-${Date.now()}.pdf`;
            const url = await subirArchivo("entrada", path, file);
            return [tipo, url];
          })
      );

      const archivosURLs = Object.fromEntries(uploads);

      // Verificar que existe una venta
      const { data: ventaExistente, error: selectError } = await supabase
        .from("ventas")
        .select("id")
        .eq("cliente_id", id)
        .eq("user_id", currentUser.id)
        .order("id", { ascending: false })
        .limit(1)
        .single();

      if (selectError || !ventaExistente) {
        throw new Error("No se encontró una venta para actualizar. Primero debes crear la venta.");
      }

      // Actualizar la venta específica
      const { error: updateError } = await supabase
        .from("ventas")
        .update({
          guia_envio_pdf_url: archivosURLs.guiaEnvio || null,
          orden_remision_pdf_url: archivosURLs.ordenRemision || null,
        })
        .eq("id", ventaExistente.id)
        .eq("user_id", currentUser.id);

      if (updateError) {
        console.error("Error al actualizar:", updateError);
        throw new Error("Error al actualizar la venta: " + updateError.message);
      }

      setMensajeSalida("¡Archivos de salida guardados correctamente!");
      setMostrarSalida(false);
      setArchivosSalida({ guiaEnvio: null, ordenRemision: null });
    } catch (error) {
      console.error("Error en salida:", error);
      setMensajeSalida("Error: " + error.message);
    } finally {
      setLoadingSalida(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Verificando autenticación...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver</span>
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">
                Probe<span className="text-[#eb545f]">Care</span>
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Título Principal */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Registrar Nueva Venta
              </h2>
              <p className="text-gray-600">
                Cliente: <span className="font-medium text-blue-600">{cliente?.nombre || "Cargando..."}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Mensaje de estado */}
        {mensaje && (
          <div className={`mb-6 p-4 rounded-lg border flex items-start space-x-3 ${
            mensaje.includes("Error") || mensaje.includes("error") 
              ? "bg-red-50 border-red-200 text-red-800" 
              : "bg-green-50 border-green-200 text-green-800"
          }`}>
            {mensaje.includes("Error") || mensaje.includes("error") ? (
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            ) : (
              <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            )}
            <span className="font-medium">{mensaje}</span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Formulario Principal */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Información de la Venta</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="modelo" className="flex items-center space-x-2">
                      <Hash className="h-4 w-4" />
                      <span>Modelo *</span>
                    </Label>
                    <Input
                      id="modelo"
                      value={modelo}
                      onChange={(e) => setModelo(e.target.value)}
                      placeholder="Ej: ProbeX-2024"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numeroSerie" className="flex items-center space-x-2">
                      <Hash className="h-4 w-4" />
                      <span>Número de Serie *</span>
                    </Label>
                    <Input
                      id="numeroSerie"
                      value={numeroSerie}
                      onChange={(e) => setNumeroSerie(e.target.value)}
                      placeholder="Ej: PX2024001"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fechaVenta" className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Fecha de Venta *</span>
                    </Label>
                    <Input
                      id="fechaVenta"
                      type="date"
                      value={fechaVenta}
                      onChange={(e) => setFechaVenta(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Tipo de Pago *</span>
                    </Label>
                    <Select value={tipoPago} onValueChange={setTipoPago} disabled={loading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tipo de pago" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="efectivo">Efectivo</SelectItem>
                        <SelectItem value="tarjeta">Tarjeta</SelectItem>
                        <SelectItem value="transferencia">Transferencia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="archivo" className="flex items-center space-x-2">
                    <FileUp className="h-4 w-4" />
                    <span>Carta de Recomendación (opcional)</span>
                  </Label>
                  <Input
                    id="archivo"
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setArchivo(e.target.files[0])}
                    disabled={loading}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comentarios" className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Comentarios</span>
                  </Label>
                  <Textarea
                    id="comentarios"
                    value={comentarios}
                    onChange={(e) => setComentarios(e.target.value)}
                    placeholder="Información adicional sobre la venta..."
                    rows={4}
                    disabled={loading}
                  />
                </div>

                <div className="pt-4 border-t">
                  <Button
                    onClick={handleGuardarVenta}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Guardando venta...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Guardar Venta</span>
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel de Acciones Laterales */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gestión de Documentos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => setMostrarEntrada(true)}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Documentos de Entrada
                </Button>

                <Button
                  onClick={() => setMostrarAutorizacion(true)}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Autorización y Pago
                </Button>

                <Button
                  onClick={() => setMostrarSalida(true)}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Documentos de Salida
                </Button>

                <div className="pt-2 border-t">
                  <Button
                    onClick={() => navigate("/Exit-Form")}
                    variant="secondary"
                    className="w-full justify-start"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Formulario de Salida
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal Entrada */}
        <Dialog open={mostrarEntrada} onOpenChange={setMostrarEntrada}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Documentos de Entrada</span>
              </DialogTitle>
              <DialogDescription>
                Sube los documentos relacionados con la entrada del equipo (opcional).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="solicitud">Solicitud de entrada (PDF)</Label>
                <Input
                  id="solicitud"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleArchivoEntradaChange(e, "solicitud")}
                  disabled={loadingEntrada}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnostico">Diagnóstico (PDF)</Label>
                <Input
                  id="diagnostico"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleArchivoEntradaChange(e, "diagnostico")}
                  disabled={loadingEntrada}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guia">Guía de paquetería (PDF)</Label>
                <Input
                  id="guia"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleArchivoEntradaChange(e, "guia")}
                  disabled={loadingEntrada}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {mensajeEntrada && (
                <div className={`p-3 rounded-lg border flex items-start space-x-2 ${
                  mensajeEntrada.includes("Error") 
                    ? "bg-red-50 border-red-200 text-red-700" 
                    : "bg-green-50 border-green-200 text-green-700"
                }`}>
                  {mensajeEntrada.includes("Error") ? (
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  )}
                  <span className="text-sm">{mensajeEntrada}</span>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setMostrarEntrada(false)}
                disabled={loadingEntrada}
              >
                Cancelar
              </Button>
              <Button onClick={handleGuardarEntrada} disabled={loadingEntrada}>
                {loadingEntrada ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Guardando...</span>
                  </div>
                ) : (
                  "Guardar"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Autorización */}
        <Dialog open={mostrarAutorizacion} onOpenChange={setMostrarAutorizacion}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Autorización y Pago</span>
              </DialogTitle>
              <DialogDescription>
                Sube los documentos de cotización y pago (opcional).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cotizacion">Cotización (PDF)</Label>
                <Input
                  id="cotizacion"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleArchivoAutorizacionChange(e, "cotizacion")}
                  disabled={loadingAutorizacion}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pago">Pago o liquidación (PDF)</Label>
                <Input
                  id="pago"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleArchivoAutorizacionChange(e, "pago")}
                  disabled={loadingAutorizacion}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {mensajeAutorizacion && (
                <div className={`p-3 rounded-lg border flex items-start space-x-2 ${
                  mensajeAutorizacion.includes("Error") 
                    ? "bg-red-50 border-red-200 text-red-700" 
                    : "bg-green-50 border-green-200 text-green-700"
                }`}>
                  {mensajeAutorizacion.includes("Error") ? (
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  )}
                  <span className="text-sm">{mensajeAutorizacion}</span>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setMostrarAutorizacion(false)}
                disabled={loadingAutorizacion}
              >
                Cancelar
              </Button>
              <Button onClick={handleGuardarAutorizacion} disabled={loadingAutorizacion}>
                {loadingAutorizacion ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Guardando...</span>
                  </div>
                ) : (
                  "Guardar"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Salida */}
        <Dialog open={mostrarSalida} onOpenChange={setMostrarSalida}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Send className="h-5 w-5" />
                <span>Documentos de Salida</span>
              </DialogTitle>
              <DialogDescription>
                Sube los documentos de envío y remisión.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="guiaEnvio" className="flex items-center space-x-1">
                  <span>Guía de envío (PDF)</span>
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="guiaEnvio"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleArchivoSalidaChange(e, "guiaEnvio")}
                  disabled={loadingSalida}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ordenRemision">Orden de remisión (PDF) - Opcional</Label>
                <Input
                  id="ordenRemision"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleArchivoSalidaChange(e, "ordenRemision")}
                  disabled={loadingSalida}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {mensajeSalida && (
                <div className={`p-3 rounded-lg border flex items-start space-x-2 ${
                  mensajeSalida.includes("Error") 
                    ? "bg-red-50 border-red-200 text-red-700" 
                    : "bg-green-50 border-green-200 text-green-700"
                }`}>
                  {mensajeSalida.includes("Error") ? (
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  )}
                  <span className="text-sm">{mensajeSalida}</span>
                </div>
              )}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => navigate("/Exit-Form")}
                disabled={loadingSalida}
                className="w-full sm:w-auto"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ir a Formulario
              </Button>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setMostrarSalida(false)}
                  disabled={loadingSalida}
                  className="flex-1 sm:flex-none"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleGuardarSalida} 
                  disabled={loadingSalida}
                  className="flex-1 sm:flex-none"
                >
                  {loadingSalida ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Guardando...</span>
                    </div>
                  ) : (
                    "Guardar"
                  )}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}