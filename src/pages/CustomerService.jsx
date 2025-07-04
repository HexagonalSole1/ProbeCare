import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Button } from "@/components/ui/button";
import {
  FiUser,
  FiArrowLeft,
  FiFileText,
  FiUpload,
  FiCheckCircle,
  FiClock,
  FiPlay,
  FiLoader,
  FiBell,
  FiAlertCircle,
  FiSave,
  FiTool,
} from "react-icons/fi";

export default function CustomerService() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [mostrarEntrada, setMostrarEntrada] = useState(false);
  const [archivoEntrada, setArchivoEntrada] = useState(null);
  const [mostrarAutorizacion, setMostrarAutorizacion] = useState(false);
  const [archivoActualizacion, setArchivoActualizacion] = useState(null);
  const [archivoCotizacion, setArchivoCotizacion] = useState(null);
  const [archivoAnticipo, setArchivoAnticipo] = useState(null);
  const [mostrarSalida, setMostrarSalida] = useState(false);
  const [archivoPago, setArchivoPago] = useState(null);
  const [archivoGuiaEnvio, setArchivoGuiaEnvio] = useState(null);
  const [archivoEntrega, setArchivoEntrega] = useState(null);
  const [notificaciones, setNotificaciones] = useState([]);
  const [loadingNotificaciones, setLoadingNotificaciones] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Obtener el usuario actual
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUser(data.session.user);
      }
    };
    getSession();
  }, []);

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 0:
      case null:
      case undefined:
        return "Pendiente";
      case 1:
        return "Aceptado";
      case 2:
        return "En Proceso";
      case 3:
        return "Finalizado";
      default:
        return "Pendiente";
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 0:
      case null:
      case undefined:
        return <FiClock size={20} className="text-gray-500" />;
      case 1:
        return <FiPlay size={20} className="text-blue-500" />;
      case 2:
        return <FiLoader size={20} className="text-yellow-500" />;
      case 3:
        return <FiCheckCircle size={20} className="text-green-500" />;
      default:
        return <FiClock size={20} className="text-gray-500" />;
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 0:
      case null:
      case undefined:
        return "bg-gray-50 text-gray-700 border-gray-200";
      case 1:
        return "bg-blue-50 text-blue-700 border-blue-200";
      case 2:
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case 3:
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const uploadArchivo = async (archivo, ruta) => {
    const { error } = await supabase.storage
      .from("servicios")
      .upload(ruta, archivo, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("Error al subir archivo:", error.message);
      throw new Error(error.message);
    }

    const { data: urlData } = supabase.storage
      .from("servicios")
      .getPublicUrl(ruta);

    return urlData?.publicUrl || null;
  };

  useEffect(() => {
    const fetchCliente = async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select(`
          id,
          nombre,
          telefono,
          estado_servicio,
          fk_ingeniero_id,
          perfiles:fk_profiles_id(full_name, email)
        `)
        .eq("id", id)
        .single();

      if (!error) setCliente(data);
    };
    fetchCliente();
  }, [id]);

  useEffect(() => {
    if (!user) return;

    const fetchNotificaciones = async () => {
      setLoadingNotificaciones(true);
      const { data, error } = await supabase
        .from("notificaciones")
        .select("*")
        .eq("vendedor_id", user.id)
        .eq("cliente_id", id)
        .order("created_at", { ascending: false });

      if (!error) setNotificaciones(data);
      setLoadingNotificaciones(false);
    };

    fetchNotificaciones();
  }, [user, id]);

  const marcarComoLeida = async (notificacionId) => {
    const { error } = await supabase
      .from("notificaciones")
      .update({ leido: true })
      .eq("id", notificacionId);

    if (!error) {
      setNotificaciones((prev) =>
        prev.map((n) =>
          n.id === notificacionId ? { ...n, leido: true } : n
        )
      );
    }
  };

  const handleSolicitudDiagnostico = async () => {
    if (!cliente) return;

    try {
      setLoading(true);
      setError(null);

      const ingenieroId = cliente.fk_ingeniero_id;

      if (!ingenieroId) {
        setError("Este cliente no tiene ingeniero asignado.");
        return;
      }

      const { error: insertError } = await supabase
        .from("solicitudes_diagnostico")
        .insert({
          cliente_id: id,
          ingeniero_id: ingenieroId,
          estado: "pendiente",
        });

      if (insertError) throw insertError;

      setSuccess("Solicitud enviada al ingeniero exitosamente.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error al solicitar diagnóstico:", err.message);
      setError("Hubo un error al enviar la solicitud: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarServicio = async () => {
    if (!user || !id) return;

    try {
      setLoading(true);
      setError(null);

      const uploads = {};

      if (archivoEntrada) {
        uploads.entrada_url = await uploadArchivo(archivoEntrada, `entrada/${id}_${archivoEntrada.name}`);
      }
      if (archivoActualizacion) {
        uploads.actualizacion_url = await uploadArchivo(archivoActualizacion, `actualizacion/${id}_${archivoActualizacion.name}`);
      }
      if (archivoCotizacion) {
        uploads.cotizacion_url = await uploadArchivo(archivoCotizacion, `cotizacion/${id}_${archivoCotizacion.name}`);
      }
      if (archivoAnticipo) {
        uploads.anticipo_url = await uploadArchivo(archivoAnticipo, `anticipo/${id}_${archivoAnticipo.name}`);
      }
      if (archivoPago) {
        uploads.pago_url = await uploadArchivo(archivoPago, `pago/${id}_${archivoPago.name}`);
      }
      if (archivoGuiaEnvio) {
        uploads.guia_envio_url = await uploadArchivo(archivoGuiaEnvio, `guia_envio/${id}_${archivoGuiaEnvio.name}`);
      }
      if (archivoEntrega) {
        uploads.entrega_url = await uploadArchivo(archivoEntrega, `entrega/${id}_${archivoEntrega.name}`);
      }

      const { error } = await supabase.from("servicios").insert({
        cliente_id: id,
        vendedor_id: user.id,
        ...uploads,
      });

      if (error) throw error;

      setSuccess("Servicio guardado exitosamente.");
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Error al guardar servicio:", err.message);
      setError("Hubo un error al guardar el servicio: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="backdrop-blur-md bg-white/80 border-b border-slate-200/60 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate("/dashboard")}
              className="!bg-slate-100 hover:!bg-slate-200 !text-slate-700 !border-0 !rounded-xl !p-3"
            >
              <FiArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Probe<span className="text-red-500">Care</span>
              </h1>
              <p className="text-sm text-slate-500">Gestión de Servicios</p>
            </div>
          </div>
        </div>
      </header>

      {/* Notificaciones de estado */}
      {error && (
        <div className="max-w-5xl mx-auto px-6 pt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm flex items-center space-x-2">
            <FiAlertCircle size={16} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="max-w-5xl mx-auto px-6 pt-4">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl shadow-sm flex items-center space-x-2">
            <FiCheckCircle size={16} />
            <span>{success}</span>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Información del cliente y estado */}
        <div className="mb-8">
          <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                  <FiUser size={24} className="text-slate-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-1">
                    {cliente ? cliente.nombre : "Cargando cliente..."}
                  </h2>
                  {cliente && (
                    <>
                      <p className="text-slate-600 mb-2">{cliente.telefono}</p>
                      {cliente.perfiles?.full_name && (
                        <p className="text-sm text-slate-500">
                          Vendedor: <span className="font-medium">{cliente.perfiles.full_name}</span>
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Estado del servicio */}
              {cliente && (
                <div className="text-right">
                  <p className="text-sm text-slate-500 mb-2">Estado del servicio:</p>
                  <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg border ${getEstadoColor(cliente.estado_servicio ?? 0)}`}>
                    {getEstadoIcon(cliente.estado_servicio ?? 0)}
                    <span className="font-medium">
                      {getEstadoTexto(cliente.estado_servicio ?? 0)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        <section className="mb-8">
          <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <FiBell size={20} className="text-slate-600" />
              <h2 className="text-xl font-semibold text-slate-800">Notificaciones del Ingeniero</h2>
            </div>
            
            {loadingNotificaciones ? (
              <div className="flex items-center space-x-2 text-slate-600">
                <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                <span>Cargando notificaciones...</span>
              </div>
            ) : notificaciones.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No hay notificaciones para este cliente.</p>
            ) : (
              <div className="space-y-3">
                {notificaciones.map((noti) => (
                  <div
                    key={noti.id}
                    className={`p-4 rounded-xl border transition-all ${
                      noti.leido 
                        ? "bg-slate-50 border-slate-200" 
                        : "bg-blue-50 border-blue-200 shadow-sm"
                    }`}
                  >
                    <p className="text-slate-700 mb-2">{noti.mensaje}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500">
                        {new Date(noti.created_at).toLocaleString()}
                      </p>
                      {!noti.leido && (
                        <Button
                          size="sm"
                          onClick={() => marcarComoLeida(noti.id)}
                          className="!bg-blue-500 hover:!bg-blue-600 !text-white !text-xs !px-3 !py-1 !rounded-lg"
                        >
                          Marcar como leído
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Entrada */}
        <section className="mb-8">
          <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm">
            <Button
              onClick={() => setMostrarEntrada(!mostrarEntrada)}
              className="!bg-blue-500 hover:!bg-blue-600 !text-white !rounded-xl !px-6 !py-3 !shadow-sm hover:!shadow-md !border-0 !transition-all !duration-200 flex items-center space-x-2"
            >
              <FiPlay size={16} />
              <span>Entrada</span>
            </Button>

            {mostrarEntrada && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                  <FiFileText size={18} />
                  <span>Solicitud de Entrada</span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700">
                      Subir PDF de solicitud de entrada
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setArchivoEntrada(e.target.files[0])}
                        className="block w-full text-sm text-slate-600 border border-slate-300 rounded-xl cursor-pointer bg-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-l-xl file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
                      />
                      {archivoEntrada && (
                        <div className="mt-2 flex items-center space-x-2 text-sm text-green-600">
                          <FiCheckCircle size={16} />
                          <span>Archivo seleccionado: {archivoEntrada.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleSolicitudDiagnostico}
                    disabled={loading}
                    className="!bg-emerald-500 hover:!bg-emerald-600 !text-white !rounded-xl !px-6 !py-3 !shadow-sm hover:!shadow-md !border-0 !transition-all !duration-200 flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <FiTool size={16} />
                        <span>Solicitud de diagnóstico</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Etapa de Diagnóstico */}
        <section className="mb-8">
          <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Etapa de Diagnóstico</h2>

            <Button
              onClick={() => setMostrarAutorizacion(!mostrarAutorizacion)}
              className="!bg-indigo-500 hover:!bg-indigo-600 !text-white !rounded-xl !px-6 !py-3 !shadow-sm hover:!shadow-md !border-0 !transition-all !duration-200"
            >
              Autorización
            </Button>

            {mostrarAutorizacion && (
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Actualización */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      PDF de Actualización
                    </label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setArchivoActualizacion(e.target.files[0])}
                      className="w-full text-sm text-slate-600 border border-slate-300 rounded-xl cursor-pointer bg-white/50 file:mr-3 file:py-2 file:px-3 file:rounded-l-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-50 file:text-slate-700"
                    />
                    {archivoActualizacion && (
                      <div className="flex items-center space-x-1 text-xs text-green-600">
                        <FiCheckCircle size={12} />
                        <span>Archivo listo</span>
                      </div>
                    )}
                  </div>

                  {/* Cotización */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      PDF de Cotización
                    </label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setArchivoCotizacion(e.target.files[0])}
                      className="w-full text-sm text-slate-600 border border-slate-300 rounded-xl cursor-pointer bg-white/50 file:mr-3 file:py-2 file:px-3 file:rounded-l-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-50 file:text-slate-700"
                    />
                    {archivoCotizacion && (
                      <div className="flex items-center space-x-1 text-xs text-green-600">
                        <FiCheckCircle size={12} />
                        <span>Archivo listo</span>
                      </div>
                    )}
                  </div>

                  {/* Anticipo */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      PDF de Anticipo
                    </label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setArchivoAnticipo(e.target.files[0])}
                      className="w-full text-sm text-slate-600 border border-slate-300 rounded-xl cursor-pointer bg-white/50 file:mr-3 file:py-2 file:px-3 file:rounded-l-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-50 file:text-slate-700"
                    />
                    {archivoAnticipo && (
                      <div className="flex items-center space-x-1 text-xs text-green-600">
                        <FiCheckCircle size={12} />
                        <span>Archivo listo</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Salida */}
        <section className="mb-8">
          <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Salida</h2>

            <Button
              onClick={() => setMostrarSalida(!mostrarSalida)}
              className="!bg-purple-500 hover:!bg-purple-600 !text-white !rounded-xl !px-6 !py-3 !shadow-sm hover:!shadow-md !border-0 !transition-all !duration-200"
            >
              Gestionar Salida
            </Button>

            {mostrarSalida && (
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pago */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      PDF de Solicitud de pago o liquidación
                    </label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setArchivoPago(e.target.files[0])}
                      className="w-full text-sm text-slate-600 border border-slate-300 rounded-xl cursor-pointer bg-white/50 file:mr-3 file:py-2 file:px-3 file:rounded-l-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-50 file:text-slate-700"
                    />
                    {archivoPago && (
                      <div className="flex items-center space-x-1 text-xs text-green-600">
                        <FiCheckCircle size={12} />
                        <span>Archivo listo</span>
                      </div>
                    )}
                  </div>

                  {/* Guía de envío */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      PDF de Guía de envío
                    </label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setArchivoGuiaEnvio(e.target.files[0])}
                      className="w-full text-sm text-slate-600 border border-slate-300 rounded-xl cursor-pointer bg-white/50 file:mr-3 file:py-2 file:px-3 file:rounded-l-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-50 file:text-slate-700"
                    />
                    {archivoGuiaEnvio && (
                      <div className="flex items-center space-x-1 text-xs text-green-600">
                        <FiCheckCircle size={12} />
                        <span>Archivo listo</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Finalización */}
        <section className="mb-8">
          <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Finalización</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  PDF de Entrega <span className="text-xs text-slate-400">(opcional)</span>
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setArchivoEntrega(e.target.files[0])}
                  className="w-full text-sm text-slate-600 border border-slate-300 rounded-xl cursor-pointer bg-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-l-xl file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
                />
                {archivoEntrega && (
                  <div className="mt-2 flex items-center space-x-2 text-sm text-green-600">
                    <FiCheckCircle size={16} />
                    <span>Archivo seleccionado: {archivoEntrega.name}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="!bg-slate-100 hover:!bg-slate-200 !text-slate-700 !px-6 !py-3 !rounded-xl !border !border-slate-200 hover:!border-slate-300"
                >
                  <FiArrowLeft size={16} className="mr-2" />
                  Volver
                </Button>

                <Button
                  onClick={handleGuardarServicio}
                  disabled={loading}
                  className="!bg-emerald-500 hover:!bg-emerald-600 !text-white !px-6 !py-3 !rounded-xl !shadow-sm hover:!shadow-md !border-0 !transition-all !duration-200"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Guardando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <FiSave size={16} />
                      <span>Guardar Servicio</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}