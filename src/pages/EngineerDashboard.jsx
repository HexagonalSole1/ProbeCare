import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  FiLogOut,
  FiUser,
  FiFileText,
  FiTool,
  FiLoader,
  FiCheckCircle,
  FiClock,
  FiPlay,
} from "react-icons/fi";

export default function EngineerDashboard() {
  const [user, setUser] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUser(data.session.user);
      } else {
        navigate("/login");
      }
    };

    getSession();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      console.log("Usuario listo, cargando clientes asignados...");
      fetchClientesAsignados();
    }
  }, [user]);

  const fetchClientesAsignados = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Buscando clientes asignados al ingeniero:", user.id);

      const { data, error } = await supabase
        .from("clientes")
        .select(`
          id,
          nombre,
          telefono,
          estado_servicio,
          created_at,
          fk_profiles_id,
          perfiles:fk_profiles_id(full_name, email)
        `)
        .eq("fk_ingeniero_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error al cargar clientes:", error);
        setError("Error al cargar clientes: " + error.message);
        return;
      }

      console.log("Clientes asignados encontrados:", data);
      setClientes(data || []);

      // Inicializar estados seleccionados
      const estadosIniciales = {};
      (data || []).forEach(cliente => {
        estadosIniciales[cliente.id] = cliente.estado_servicio ?? 0; // null o undefined = 0 (pendiente)
      });
      setEstadoSeleccionado(estadosIniciales);

    } catch (err) {
      console.error("Error inesperado:", err);
      setError("Error inesperado al cargar los clientes");
    } finally {
      setLoading(false);
    }
  };

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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      setError("Error al cerrar sesión");
    }
  };

  const handleCambioEstado = async (clienteId, nuevoEstado, vendedorId, nombreCliente) => {
    try {
      setUpdatingStatus(prev => ({ ...prev, [clienteId]: true }));
      setError(null);

      // Actualizar el estado del cliente
      const { error: updateError } = await supabase
        .from("clientes")
        .update({ estado_servicio: nuevoEstado })
        .eq("id", clienteId);

      if (updateError) throw updateError;

      // Crear notificación para el vendedor (opcional)
      try {
        await supabase.from("notificaciones").insert({
          vendedor_id: vendedorId,
          cliente_id: clienteId,
          mensaje: `El estado del servicio de ${nombreCliente} ha cambiado a "${getEstadoTexto(nuevoEstado)}"`,
          leido: false,
          tipo: "estado_servicio",
        });
      } catch (notiError) {
        console.log("No se pudo crear la notificación:", notiError);
        // No bloqueamos el flujo si falla la notificación
      }

      setSuccess(`Estado de ${nombreCliente} actualizado a "${getEstadoTexto(nuevoEstado)}"`);
      setTimeout(() => setSuccess(null), 3000);

      // Actualizar el estado local
      setEstadoSeleccionado(prev => ({
        ...prev,
        [clienteId]: nuevoEstado
      }));

      // Refrescar la lista
      await fetchClientesAsignados();

    } catch (err) {
      console.error("Error al cambiar estado:", err.message);
      setError("Error al cambiar el estado: " + err.message);
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [clienteId]: false }));
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 0:
      case null:
      case undefined:
        return <FiClock size={16} className="text-gray-500" />; // Pendiente
      case 1:
        return <FiPlay size={16} className="text-blue-500" />; // Aceptado
      case 2:
        return <FiLoader size={16} className="text-yellow-500" />; // En Proceso
      case 3:
        return <FiCheckCircle size={16} className="text-green-500" />; // Finalizado
      default:
        return <FiClock size={16} className="text-gray-500" />;
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 0:
      case null:
      case undefined:
        return "bg-gray-50 text-gray-700 border-gray-200"; // Pendiente
      case 1:
        return "bg-blue-50 text-blue-700 border-blue-200"; // Aceptado
      case 2:
        return "bg-yellow-50 text-yellow-700 border-yellow-200"; // En Proceso
      case 3:
        return "bg-green-50 text-green-700 border-green-200"; // Finalizado
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Mostrar loading si está cargando
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header moderno */}
      <header className="backdrop-blur-md bg-white/80 border-b border-slate-200/60 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Probe<span className="text-red-500">Care</span>
                </h1>
                <p className="text-sm text-slate-500">Dashboard de Ingeniero</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm text-slate-600">Bienvenido</p>
                <p className="text-sm font-semibold text-slate-800">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl shadow-lg border-0 transition-all duration-200"
              >
                <FiLogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notificaciones */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm">
            {error}
          </div>
        </div>
      )}

      {success && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl shadow-sm">
            {success}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">
                Clientes Asignados
              </h2>
              <p className="text-slate-600">Gestiona el estado de los servicios asignados</p>
            </div>
            <div className="hidden sm:flex items-center space-x-4 text-sm text-slate-500">
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span>{clientes.length} clientes asignados</span>
              </span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-slate-600">Cargando clientes asignados...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && clientes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiTool size={32} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              No tienes clientes asignados
            </h3>
            <p className="text-slate-500 mb-6">
              Los vendedores podrán asignarte clientes para que gestiones sus servicios
            </p>
            <button
              onClick={fetchClientesAsignados}
              className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl shadow-lg border-0"
            >
              Actualizar lista
            </button>
          </div>
        ) : (
          /* Clients Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clientes.map((cliente) => (
              <div
                key={cliente.id}
                className="group bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Client Info */}
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiUser size={20} className="text-slate-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-800 truncate text-lg">
                      {cliente.nombre}
                    </h3>
                    <p className="text-slate-500 text-sm">{cliente.telefono}</p>
                    {cliente.perfiles?.full_name && (
                      <p className="text-xs text-slate-400 mt-1">
                        Asignado por: <span className="font-medium text-slate-600">{cliente.perfiles.full_name}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Estado actual */}
                <div className="mb-4">
                  <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border ${getEstadoColor(cliente.estado_servicio ?? 0)}`}>
                    {getEstadoIcon(cliente.estado_servicio ?? 0)}
                    <span className="text-sm font-medium">
                      {getEstadoTexto(cliente.estado_servicio ?? 0)}
                    </span>
                  </div>
                </div>

                {/* Selector de estado */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Cambiar estado del servicio:
                    </label>
                    <select
                      value={estadoSeleccionado[cliente.id] ?? cliente.estado_servicio ?? 0}
                      onChange={(e) => {
                        const nuevoEstado = parseInt(e.target.value);
                        setEstadoSeleccionado(prev => ({
                          ...prev,
                          [cliente.id]: nuevoEstado,
                        }));
                        handleCambioEstado(cliente.id, nuevoEstado, cliente.fk_profiles_id, cliente.nombre);
                      }}
                      disabled={updatingStatus[cliente.id]}
                      className="w-full px-3 py-2 bg-white/50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all disabled:opacity-50"
                    >
                      <option value={0}>Pendiente</option>
                      <option value={1}>Aceptado</option>
                      <option value={2}>En Proceso</option>
                      <option value={3}>Finalizado</option>
                    </select>
                  </div>

                  {updatingStatus[cliente.id] && (
                    <div className="flex items-center justify-center py-2">
                      <div className="flex items-center space-x-2 text-slate-600">
                        <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                        <span className="text-sm">Actualizando...</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate(`/customer/${cliente.id}/history`)}
                      className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 rounded-xl py-3 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center"
                    >
                      <FiFileText size={16} className="mr-2" />
                      Ver historial
                    </button>

                    <button
                      onClick={() => navigate(`/engineer/${cliente.id}/entryForm`)}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-3 shadow-sm hover:shadow-md border-0 transition-all duration-200 flex items-center justify-center"
                    >
                      <FiTool size={16} className="mr-2" />
                      Gestionar Servicio
                    </button>
                  </div>
                </div>
              </div>
            ))}



            
          </div>
        )}
      </main>
    </div>
  );
}