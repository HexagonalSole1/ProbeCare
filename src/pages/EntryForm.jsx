import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Package, FileText, Settings, Stethoscope, Activity, AlertCircle, CheckCircle, RefreshCw, Edit, Save } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function EnhancedEntryForm() {
  const { id: clienteId } = useParams();
  const navigate = useNavigate();
  
  // Estados del formulario
  const [tipoEquipo, setTipoEquipo] = useState("");
  const [paqueteria, setPaqueteria] = useState("");
  const [guia, setGuia] = useState("");
  const [paqueteriaOtro, setPaqueteriaOtro] = useState("");
  const [modelo, setModelo] = useState("");
  const [numeroSerie, setNumeroSerie] = useState("");
  const [marca, setMarca] = useState("");
  const [fechaEntrada, setFechaEntrada] = useState("");
  const [responsable, setResponsable] = useState("");
  const [tipoTransductor, setTipoTransductor] = useState("");
  const [frecuencia, setFrecuencia] = useState("");
  const [form, setForm] = useState({});
  
  // Estados de control
  const [editando, setEditando] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingFormId, setExistingFormId] = useState(null);
  const [clienteInfo, setClienteInfo] = useState(null);

  // Cargar datos al inicializar el componente
  useEffect(() => {
    if (clienteId) {
      loadClienteInfo();
      checkExistingForm();
    }
  }, [clienteId]);

  const loadClienteInfo = async () => {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select(`
          id,
          nombre,
          telefono,
          estado_servicio,
          perfiles:fk_profiles_id(full_name, email)
        `)
        .eq("id", clienteId)
        .single();

      if (error) throw error;
      setClienteInfo(data);
    } catch (error) {
      console.error("Error al cargar información del cliente:", error);
      setMensaje("Error al cargar información del cliente");
    }
  };

  const checkExistingForm = async () => {
    try {
      setLoading(true);
      
      // Primero buscar en formulario_entrada_ultrasonido
      const { data: ultrasonidoData, error: ultrasonidoError } = await supabase
        .from("formulario_entrada_ultrasonido")
        .select("*")
        .eq("cliente_id", clienteId)
        .single();

      if (ultrasonidoData) {
        setExistingFormId(ultrasonidoData.id);
        setTipoEquipo("ultrasonido");
        loadUltrasonidoData(ultrasonidoData);
        setEditando(false);
        setMensaje("Formulario de ultrasonido existente cargado. Puedes editarlo si es necesario.");
        setLoading(false);
        return;
      }

      // Si no hay ultrasonido, buscar en transductor
      const { data: transductorData, error: transductorError } = await supabase
        .from("formulario_entrada_transductor")
        .select("*")
        .eq("cliente_id", clienteId)
        .single();

      if (transductorData) {
        setExistingFormId(transductorData.id);
        setTipoEquipo("transductor");
        loadTransductorData(transductorData);
        setEditando(false);
        setMensaje("Formulario de transductor existente cargado. Puedes editarlo si es necesario.");
      } else {
        // No existe formulario - modo creación
        setExistingFormId(null);
        setEditando(true);
        setMensaje("Nuevo formulario de entrada para " + (clienteInfo?.nombre || "cliente"));
      }
    } catch (error) {
      console.error("Error al verificar formulario existente:", error);
      setMensaje("Error al verificar formulario existente");
    } finally {
      setLoading(false);
    }
  };

  const loadUltrasonidoData = (data) => {
    setMarca(data.marca || "");
    setModelo(data.modelo || "");
    setNumeroSerie(data.numero_serie || "");
    setResponsable(data.responsable || "");
    setFechaEntrada(data.fecha_entrada || "");
    setPaqueteria(data.paqueteria || "");
    setPaqueteriaOtro(data.paqueteria_otro || "");
    setGuia(data.guia_paqueteria || "");
    
    // Los accesorios en ultrasonido están como string, no JSON
    try {
      const accesorios = typeof data.accesorios === 'string' ? JSON.parse(data.accesorios) : data.accesorios;
      setForm({ 
        ...accesorios,
        detalles_esteticos: data.detalles_esteticos || ""
      });
    } catch {
      setForm({ detalles_esteticos: data.detalles_esteticos || "" });
    }
  };

  const loadTransductorData = (data) => {
    setTipoTransductor(data.tipo_transductor || "");
    setFrecuencia(data.frecuencia || "");
    setMarca(data.marca || "");
    setModelo(data.modelo || "");
    setNumeroSerie(data.numero_serie || "");
    setResponsable(data.responsable || "");
    setFechaEntrada(data.fecha_entrada || "");
    setPaqueteria(data.paqueteria || "");
    setPaqueteriaOtro(data.paqueteria_otro || "");
    setGuia(data.guia_paqueteria || "");
    
    // Los accesorios en transductor son JSON
    setForm({ 
      ...(data.accesorios || {}),
      detalles_esteticos: data.detalles_esteticos || ""
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!tipoEquipo) {
      newErrors.tipoEquipo = "Debe seleccionar un tipo de equipo";
    }
    
    if (!modelo) {
      newErrors.modelo = "El modelo es obligatorio";
    }
    
    if (!numeroSerie) {
      newErrors.numeroSerie = "El número de serie es obligatorio";
    }
    
    
    if (tipoEquipo === "transductor" && !tipoTransductor) {
      newErrors.tipoTransductor = "El tipo de transductor es obligatorio";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGuardar = async () => {
    if (!validateForm()) {
      setMensaje("Por favor corrija los errores antes de continuar");
      return;
    }

    setSaving(true);
    
    try {
      const baseData = {
        cliente_id: clienteId,
        marca,
        modelo,
        numero_serie: numeroSerie,
        responsable,
        fecha_entrada: fechaEntrada,
        guia_paqueteria: guia,
        paqueteria,
        paqueteria_otro: paqueteria === "otro" ? paqueteriaOtro : null,
        detalles_esteticos: form.detalles_esteticos || "",
        tipo_equipo: tipoEquipo
      };

      let result;
      
      if (tipoEquipo === "ultrasonido") {
        const datosUltrasonido = {
          ...baseData,
          // En ultrasonido, accesorios se guarda como string JSON
          accesorios: JSON.stringify(form),
          transductores: "", // Campo requerido en la tabla
          creado_en: existingFormId ? undefined : new Date().toISOString()
        };

        if (existingFormId) {
          result = await supabase
            .from("formulario_entrada_ultrasonido")
            .update(datosUltrasonido)
            .eq("id", existingFormId)
            .select()
            .single();
        } else {
          result = await supabase
            .from("formulario_entrada_ultrasonido")
            .insert(datosUltrasonido)
            .select()
            .single();
        }
      } else if (tipoEquipo === "transductor") {
        const datosTransductor = {
          ...baseData,
          tipo_transductor: tipoTransductor,
          frecuencia,
          // En transductor, accesorios se guarda como JSON
          accesorios: form,
          creado_en: existingFormId ? undefined : new Date().toISOString()
        };

        if (existingFormId) {
          result = await supabase
            .from("formulario_entrada_transductor")
            .update(datosTransductor)
            .eq("id", existingFormId)
            .select()
            .single();
        } else {
          result = await supabase
            .from("formulario_entrada_transductor")
            .insert(datosTransductor)
            .select()
            .single();
        }
      }

      if (result.error) throw result.error;

      if (!existingFormId && result.data) {
        setExistingFormId(result.data.id);
      }

      setMensaje(existingFormId ? "Formulario actualizado correctamente" : "Formulario creado correctamente");
      setEditando(false);
      setErrors({});
      
      // Actualizar estado del servicio a "En Proceso" si está en "Aceptado"
      if (clienteInfo?.estado_servicio === 1) {
        await supabase
          .from("clientes")
          .update({ estado_servicio: 2 })
          .eq("id", clienteId);
      }

    } catch (error) {
      console.error("Error al guardar formulario:", error);
      setMensaje("Error al guardar formulario: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTipoChange = (e) => {
    const newTipo = e.target.value;
    
    // Si ya existe un formulario y se intenta cambiar el tipo, mostrar advertencia
    if (existingFormId && tipoEquipo !== newTipo) {
      setMensaje("No puedes cambiar el tipo de equipo de un formulario existente");
      return;
    }
    
    setTipoEquipo(newTipo);
    
    // Limpiar errores relacionados
    if (errors.tipoEquipo) {
      setErrors(prev => ({ ...prev, tipoEquipo: null }));
    }
    
    // Limpiar campos específicos cuando cambia el tipo
    if (newTipo !== "transductor") {
      setTipoTransductor("");
      setFrecuencia("");
    }
  };

  const handlePaqueteriaChange = (e) => {
    setPaqueteria(e.target.value);
    if (e.target.value !== "otro") {
      setPaqueteriaOtro("");
    }
    clearFieldError('paqueteria');
  };

  const handleEditar = () => {
    setEditando(true);
    setMensaje("");
    setErrors({});
  };

  const handleVolver = () => {
    navigate("/dashboard/ingenieros");
  };

  const clearFieldError = (fieldName) => {
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: null }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex items-center space-x-4">
          <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Cargando formulario...</h3>
            <p className="text-gray-600">Verificando datos existentes</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-teal-500">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Activity className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                    ProbeCare
                  </h1>
                  <p className="text-sm text-gray-500">Sistema de Gestión Médica</p>
                </div>
              </div>
            </div>
            <button 
              onClick={handleVolver}
              className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-all duration-200 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {existingFormId ? "Editar Formulario de Entrada" : "Nuevo Formulario de Entrada"}
              </h2>
              <p className="text-gray-600">
                {clienteInfo ? `Cliente: ${clienteInfo.nombre}` : "Registro de equipos médicos y transductores"}
              </p>
            </div>
            {existingFormId && (
              <div className="flex items-center space-x-2 bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-xl">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Formulario existente</span>
              </div>
            )}
          </div>
          
          {/* Validation Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Se encontraron errores en el formulario</span>
              </div>
            </div>
          )}
        </div>

        {/* Equipment Type Selection */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Tipo de Equipo</h3>
            <span className="text-red-500 text-sm">*</span>
            {existingFormId && (
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                (No se puede cambiar en formularios existentes)
              </span>
            )}
          </div>
          
          {/* Error message for tipo equipo */}
          {errors.tipoEquipo && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errors.tipoEquipo}</span>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 ${
              tipoEquipo === "ultrasonido" 
                ? "border-teal-500 bg-teal-50 ring-2 ring-teal-200" 
                : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50"
            } ${errors.tipoEquipo ? "border-red-300" : ""} ${(!editando || existingFormId) ? "opacity-75 cursor-not-allowed" : ""}`}>
              <input
                type="radio"
                name="tipoEquipo"
                value="ultrasonido"
                checked={tipoEquipo === "ultrasonido"}
                onChange={handleTipoChange}
                className="sr-only"
                disabled={!editando || existingFormId}
                aria-describedby="ultrasonido-desc"
              />
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  tipoEquipo === "ultrasonido" ? "bg-teal-500 scale-110" : "bg-gray-100"
                }`}>
                  <Activity className={`w-6 h-6 ${
                    tipoEquipo === "ultrasonido" ? "text-white" : "text-gray-500"
                  }`} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 flex items-center space-x-2">
                    <span>Ultrasonido</span>
                    {tipoEquipo === "ultrasonido" && <CheckCircle className="w-4 h-4 text-teal-600" />}
                  </h4>
                  <p id="ultrasonido-desc" className="text-sm text-gray-500">Equipo de ultrasonido completo</p>
                </div>
              </div>
            </label>

            <label className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 ${
              tipoEquipo === "transductor" 
                ? "border-teal-500 bg-teal-50 ring-2 ring-teal-200" 
                : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50"
            } ${errors.tipoEquipo ? "border-red-300" : ""} ${(!editando || existingFormId) ? "opacity-75 cursor-not-allowed" : ""}`}>
              <input
                type="radio"
                name="tipoEquipo"
                value="transductor"
                checked={tipoEquipo === "transductor"}
                onChange={handleTipoChange}
                className="sr-only"
                disabled={!editando || existingFormId}
                aria-describedby="transductor-desc"
              />
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  tipoEquipo === "transductor" ? "bg-teal-500 scale-110" : "bg-gray-100"
                }`}>
                  <Stethoscope className={`w-6 h-6 ${
                    tipoEquipo === "transductor" ? "text-white" : "text-gray-500"
                  }`} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 flex items-center space-x-2">
                    <span>Transductor</span>
                    {tipoEquipo === "transductor" && <CheckCircle className="w-4 h-4 text-teal-600" />}
                  </h4>
                  <p id="transductor-desc" className="text-sm text-gray-500">Sonda o transductor individual</p>
                </div>
              </div>
            </label>
          </div>
          
          {/* Selection confirmation */}
          {tipoEquipo && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 text-green-700">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Seleccionado: {tipoEquipo === "ultrasonido" ? "Equipo de Ultrasonido" : "Transductor Individual"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Equipment Forms */}
        {tipoEquipo === "ultrasonido" && (
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Información Básica</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de entrada *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                      value={fechaEntrada}
                      onChange={(e) => setFechaEntrada(e.target.value)}
                      disabled={!editando}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marca
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                    disabled={!editando}
                    placeholder="Ej. Philips, GE, Mindray"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                      errors.modelo ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                    value={modelo}
                    onChange={(e) => {
                      setModelo(e.target.value);
                      clearFieldError('modelo');
                    }}
                    disabled={!editando}
                    placeholder="Modelo del equipo"
                  />
                  {errors.modelo && (
                    <p className="mt-1 text-sm text-red-600">{errors.modelo}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de serie *
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                      errors.numeroSerie ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                    value={numeroSerie}
                    onChange={(e) => {
                      setNumeroSerie(e.target.value);
                      clearFieldError('numeroSerie');
                    }}
                    disabled={!editando}
                    placeholder="Número de serie del equipo"
                  />
                  {errors.numeroSerie && (
                    <p className="mt-1 text-sm text-red-600">{errors.numeroSerie}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsable
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    value={responsable}
                    onChange={(e) => setResponsable(e.target.value)}
                    disabled={!editando}
                    placeholder="Nombre del responsable"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Información de Envío</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guía de paquetería *
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                      errors.guia ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                    value={guia}
                    onChange={(e) => {
                      setGuia(e.target.value);
                      clearFieldError('guia');
                    }}
                    disabled={!editando}
                    placeholder="Número de guía"
                  />
                  {errors.guia && (
                    <p className="mt-1 text-sm text-red-600">{errors.guia}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paquetería *
                  </label>
                  <select
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                      errors.paqueteria ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                    value={paqueteria}
                    onChange={handlePaqueteriaChange}
                    disabled={!editando}
                  >
                    <option value="">Seleccionar paquetería</option>
                    <option value="fedex">FedEx</option>
                    <option value="dhl">DHL</option>
                    <option value="ups">UPS</option>
                    <option value="estafeta">Estafeta</option>
                    <option value="otro">Otro</option>
                  </select>
                  {errors.paqueteria && (
                    <p className="mt-1 text-sm text-red-600">{errors.paqueteria}</p>
                  )}
                </div>

                {paqueteria === "otro" && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Especificar paquetería
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                      value={paqueteriaOtro}
                      onChange={(e) => setPaqueteriaOtro(e.target.value)}
                      disabled={!editando}
                      placeholder="Nombre de la paquetería"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Accessories */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Accesorios y Materiales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: "gel_ultrasonido", label: "Gel para ultrasonido" },
                  { key: "incluye_cable_alimentacion", label: "Cable(s) de alimentación" },
                  { key: "maletin", label: "Maletín de transporte" },
                  { key: "incluye_sondas_seguras", label: "Protector de sonda" },
                  { key: "adaptadores", label: "Adaptadores y conectores" },
                  { key: "cables_generales", label: "Cables en general" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      checked={form[key] || false}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, [key]: e.target.checked }))
                      }
                      disabled={!editando}
                    />
                    <span className="text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Aesthetic Details */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Detalles Estéticos</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones generales:
                </label>
                <textarea
                  rows={4}
                  value={form.detalles_esteticos || ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, detalles_esteticos: e.target.value }))
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors resize-none"
                  disabled={!editando}
                  placeholder="Describe el estado del equipo, cables, conectores, etc."
                />
              </div>
            </div>
          </div>
        )}

        {tipoEquipo === "transductor" && (
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Información del Transductor</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de transductor *
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                      errors.tipoTransductor ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                    value={tipoTransductor}
                    onChange={(e) => {
                      setTipoTransductor(e.target.value);
                      clearFieldError('tipoTransductor');
                    }}
                    disabled={!editando}
                    placeholder="Ej. Lineal, Convexo, Sectorial"
                  />
                  {errors.tipoTransductor && (
                    <p className="mt-1 text-sm text-red-600">{errors.tipoTransductor}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frecuencia (MHz)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    value={frecuencia}
                    onChange={(e) => setFrecuencia(e.target.value)}
                    disabled={!editando}
                    placeholder="Ej. 2-5 MHz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                      errors.modelo ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                    value={modelo}
                    onChange={(e) => {
                      setModelo(e.target.value);
                      clearFieldError('modelo');
                    }}
                    disabled={!editando}
                    placeholder="Modelo del transductor"
                  />
                  {errors.modelo && (
                    <p className="mt-1 text-sm text-red-600">{errors.modelo}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de serie *
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                      errors.numeroSerie ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                    value={numeroSerie}
                    onChange={(e) => {
                      setNumeroSerie(e.target.value);
                      clearFieldError('numeroSerie');
                    }}
                    disabled={!editando}
                    placeholder="Número de serie del transductor"
                  />
                  {errors.numeroSerie && (
                    <p className="mt-1 text-sm text-red-600">{errors.numeroSerie}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de entrada
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                      value={fechaEntrada}
                      onChange={(e) => setFechaEntrada(e.target.value)}
                      disabled={!editando}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marca
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                    disabled={!editando}
                    placeholder="Marca del transductor"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Información de Envío</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guía de paquetería *
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                      errors.guia ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                    value={guia}
                    onChange={(e) => {
                      setGuia(e.target.value);
                      clearFieldError('guia');
                    }}
                    disabled={!editando}
                    placeholder="Número de guía"
                  />
                  {errors.guia && (
                    <p className="mt-1 text-sm text-red-600">{errors.guia}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paquetería *
                  </label>
                  <select
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                      errors.paqueteria ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                    value={paqueteria}
                    onChange={handlePaqueteriaChange}
                    disabled={!editando}
                  >
                    <option value="">Seleccionar paquetería</option>
                    <option value="fedex">FedEx</option>
                    <option value="dhl">DHL</option>
                    <option value="ups">UPS</option>
                    <option value="estafeta">Estafeta</option>
                    <option value="otro">Otro</option>
                  </select>
                  {errors.paqueteria && (
                    <p className="mt-1 text-sm text-red-600">{errors.paqueteria}</p>
                  )}
                </div>

                {paqueteria === "otro" && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Especificar paquetería
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                      value={paqueteriaOtro}
                      onChange={(e) => setPaqueteriaOtro(e.target.value)}
                      disabled={!editando}
                      placeholder="Nombre de la paquetería"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Aesthetic Details */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Detalles Estéticos</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones generales:
                </label>
                <textarea
                  rows={4}
                  value={form.detalles_esteticos || ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, detalles_esteticos: e.target.value }))
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors resize-none"
                  disabled={!editando}
                  placeholder="Describe el estado del transductor, cable, conectores, etc."
                />
              </div>
            </div>
          </div>
        )}

        {/* Messages and Actions */}
        {mensaje && (
          <div className={`mb-6 p-4 rounded-xl border ${
            mensaje.includes("Error") || mensaje.includes("errores")
              ? "bg-red-50 border-red-200 text-red-800" 
              : mensaje.includes("Guardando") || saving
              ? "bg-blue-50 border-blue-200 text-blue-800"
              : "bg-green-50 border-green-200 text-green-800"
          }`}>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                mensaje.includes("Error") || mensaje.includes("errores")
                  ? "bg-red-500" 
                  : mensaje.includes("Guardando") || saving
                  ? "bg-blue-500"
                  : "bg-green-500"
              }`} />
              <span className="font-medium">{mensaje}</span>
            </div>
          </div>
        )}

        {tipoEquipo && (
          <div className="flex justify-end space-x-4">
            {editando ? (
              <button
                onClick={handleGuardar}
                disabled={saving}
                className={`bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2 ${
                  saving ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>{existingFormId ? "Actualizar Formulario" : "Crear Formulario"}</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleEditar}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
              >
                <Edit className="w-5 h-5" />
                <span>Editar Formulario</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}