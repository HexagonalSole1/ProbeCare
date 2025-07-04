import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  FiLogOut,
  FiUserPlus,
  FiUser,
  FiFileText,
  FiShoppingCart,
  FiTool,
  FiTrash2,
  FiLoader,
  FiPlus,
  FiUserCheck,
  FiUserX,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [ingenieros, setIngenieros] = useState([]);
  const [ingenierosId, setIngenierosId] = useState("");
  const [clientes, setClientes] = useState([]);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

useEffect(() => {
  const getSession = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      setUser(data.session.user);
    }
  };

  getSession();
}, []);

useEffect(() => {
  if (user) {
    console.log("Usuario listo, cargando clientes e ingenieros...");
    fetchClientes();
    fetchIngenieros();
  }
}, [user]);

const fetchIngenieros = async () => {
  try {
    console.log("Iniciando fetch de ingenieros...");
    
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .eq("role", "ingenieros");

    if (error) {
      console.error("Error fetching ingenieros:", error);
      setError("Error al cargar ingenieros: " + error.message);
    } else {
      console.log("Ingenieros recibidos:", data);
      setIngenieros(data || []);
    }
  } catch (error) {
    console.error("Error en fetchIngenieros:", error);
    setError("Error inesperado al cargar ingenieros");
  }
};

const fetchClientes = async () => {
  try {
    setLoading(true);
    
    // Consulta corregida para obtener tanto el creador como el ingeniero asignado
    const { data, error } = await supabase
      .from("clientes")
      .select(`
        *,
        creador:fk_profiles_id(full_name, email),
        ingeniero:fk_ingeniero_id(full_name, email, role)
      `)
      .eq("fk_profiles_id", user.id)
      .order("id", { ascending: false });

    if (error) throw error;
    
    console.log("Clientes obtenidos:", data);
    setClientes(data || []);
  } catch (error) {
    console.error("Error en fetchClientes:", error);
    setError("Error al cargar clientes: " + error.message);
  } finally {
    setLoading(false);
  }
};

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error) {
      setError("Error al cerrar sesión");
    }
  };

  const handleAddCliente = async () => {
    if (!nombre.trim() || !telefono.trim()) {
      setError("Por favor completa todos los campos");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const clienteData = {
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        fk_profiles_id: user.id, 
        fk_ingeniero_id: ingenierosId || null
      };

      console.log("Insertando cliente:", clienteData);

      const { error } = await supabase.from("clientes").insert(clienteData);

      if (error) throw error;

      setNombre("");
      setTelefono("");
      setIngenierosId("");
      setSuccess("Cliente agregado exitosamente");
      setIsModalOpen(false);
      await fetchClientes();

      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error al agregar cliente:", error);
      setError("Error al agregar cliente: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCliente = async (id, nombreCliente) => {
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar a ${nombreCliente}?`
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.from("clientes").delete().eq("id", id);

      if (error) throw error;

      setSuccess("Cliente eliminado exitosamente");
      await fetchClientes();

      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError("Error al eliminar cliente: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNombre("");
    setTelefono("");
    setIngenierosId("");
    setError(null);
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

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
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm text-slate-600">Bienvenido</p>
                <p className="text-sm font-semibold text-slate-800">{user?.email}</p>
              </div>
              <Button
                onClick={handleLogout}
                className="!bg-slate-800 hover:!bg-slate-900 !text-white !px-4 !py-2 !rounded-xl !shadow-lg !border-0 !transition-all !duration-200"
              >
                <FiLogOut size={16} />
              </Button>
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
                Gestión de Clientes
              </h2>
            </div>
            <div className="hidden sm:flex items-center space-x-4 text-sm text-slate-500">
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span>{clientes.length} clientes</span>
              </span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && clientes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-slate-600">Cargando clientes...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && clientes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiUser size={32} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              No hay clientes registrados
            </h3>
            <p className="text-slate-500 mb-6">
              Comienza agregando tu primer cliente para gestionar tu negocio
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="!bg-slate-800 hover:!bg-slate-900 !text-white !px-6 !py-3 !rounded-xl !shadow-lg !border-0"
            >
              <FiUserPlus size={18} className="mr-2" />
              Agregar primer cliente
            </Button>
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
                  </div>
                </div>

                {/* Ingeniero Asignado - Sección mejorada */}
                <div className="mb-4 p-3 bg-slate-50/80 rounded-xl border border-slate-200/50">
                  <div className="flex items-center space-x-2">
                    {cliente.ingeniero ? (
                      <>
                        <FiUserCheck size={16} className="text-emerald-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                            Ingeniero Asignado
                          </p>
                          <p className="text-sm font-semibold text-emerald-700 truncate">
                            {cliente.ingeniero.full_name || cliente.ingeniero.email}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <FiUserX size={16} className="text-amber-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                            Sin Ingeniero
                          </p>
                          <p className="text-sm text-amber-600">
                            No asignado
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={() => navigate(`/customer/${cliente.id}/history`)}
                    className="w-full !bg-slate-50 hover:!bg-slate-100 !text-slate-700 !border !border-slate-200 hover:!border-slate-300 !rounded-xl !py-3 !shadow-sm hover:!shadow-md !transition-all !duration-200"
                  >
                    <FiFileText size={16} className="mr-2" />
                    Ver historial
                  </Button>
              
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => navigate(`/customer/${cliente.id}/sale`)}
                      className="!bg-blue-500 hover:!bg-blue-600 !text-white !rounded-xl !py-3 !shadow-sm hover:!shadow-md !border-0 !transition-all !duration-200"
                    >
                      <FiShoppingCart size={16} className="mr-1" />
                      Venta
                    </Button>

                    <Button
                      onClick={() => navigate(`/cliente/${cliente.id}/servicio`)}
                      className="!bg-emerald-500 hover:!bg-emerald-600 !text-white !rounded-xl !py-3 !shadow-sm hover:!shadow-md !border-0 !transition-all !duration-200"
                    >
                      <FiTool size={16} className="mr-1" />
                      Servicio
                    </Button>
                  </div>

                  <Button
                    onClick={() => handleDeleteCliente(cliente.id, cliente.nombre)}
                    disabled={loading}
                    className="w-full !bg-red-50 hover:!bg-red-100 !text-red-600 hover:!text-red-700 !border !border-red-200 hover:!border-red-300 !rounded-xl !py-3 !shadow-sm disabled:!opacity-50 !transition-all !duration-200"
                  >
                    <FiTrash2 size={16} className="mr-2" />
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-slate-800 hover:bg-slate-900 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-30 group hover:scale-110"
      >
        <FiPlus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Modal translúcido */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop con blur */}
          <div 
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-md"
            onClick={closeModal}
          ></div>
          
          {/* Modal glassmorphism */}
          <div className="relative bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl w-full max-w-md mx-auto transform transition-all">
            {/* Header */}
            <div className="px-6 py-6 border-b border-slate-200/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center">
                  <FiUserPlus size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Nuevo Cliente
                  </h3>
                  <p className="text-sm text-slate-500">
                    Agrega la información del cliente
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-6 space-y-5">
              {error && (
                <div className="bg-red-50/80 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    placeholder="Ingresa el nombre del cliente"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                    disabled={loading}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    placeholder="Número de teléfono"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Asignar Ingeniero
                  </label>
                  <div className="relative">
                    <select
                      value={ingenierosId}
                      onChange={(e) => setIngenierosId(e.target.value)}
                      className="w-full px-4 py-3 bg-white/50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                      disabled={loading}
                    >
                      <option value="">Sin asignar</option>
                      {ingenieros.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.full_name || ing.email}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {ingenierosId ? 'Ingeniero seleccionado' : 'Opcional - Se puede asignar después'}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-6 border-t border-slate-200/50 flex space-x-3">
              <Button
                onClick={closeModal}
                disabled={loading}
                className="flex-1 !bg-slate-100 hover:!bg-slate-200 !text-slate-700 !rounded-xl !py-3 disabled:!opacity-50 !border-0 !transition-all !duration-200"
              >
                Cancelar
              </Button>

              <Button
                onClick={handleAddCliente}
                disabled={loading || !nombre.trim() || !telefono.trim()}
                className="flex-1 !bg-slate-800 hover:!bg-slate-900 !text-white !rounded-xl !py-3 disabled:!opacity-50 !border-0 !transition-all !duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Guardando...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <FiUserPlus size={16} />
                    <span>Agregar Cliente</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}