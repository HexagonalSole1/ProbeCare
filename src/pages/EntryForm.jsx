import { useState } from "react";
import { ArrowLeft, Calendar, Package, FileText, Settings, Stethoscope, Activity } from "lucide-react";

export default function EntryForm() {
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
  const [editando, setEditando] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const handleGuardar = async () => {
    if (!modelo || !numeroSerie || !guia || !paqueteria || !tipoEquipo) {
      setMensaje("Por favor completa todos los campos obligatorios.");
      return;
    }
    if (tipoEquipo === "transductor" && !tipoTransductor) {
      setMensaje("Por favor ingresa el tipo de transductor.");
      return;
    }

    const datosFormulario = {
      tipo_equipo: tipoEquipo,
      marca,
      modelo,
      numero_serie: numeroSerie,
      responsable,
      fecha_entrada: fechaEntrada,
      guia_paqueteria: guia,
      paqueteria,
      paqueteria_otro: paqueteria === "otro" ? paqueteriaOtro : null,
      accesorios: form,
      detalles_esteticos: form.detalles_esteticos || "",
    };

    if (tipoEquipo === "transductor") {
      datosFormulario.tipo_transductor = tipoTransductor;
      datosFormulario.frecuencia = frecuencia;
    }

    // Simulación de guardado
    setTimeout(() => {
      setMensaje("Datos guardados correctamente.");
      setEditando(false);
    }, 1000);
  };

  const handleTipoChange = (e) => {
    setTipoEquipo(e.target.value);
  };

  const handlePaqueteriaChange = (e) => {
    setPaqueteria(e.target.value);
    if (e.target.value !== "otro") {
      setPaqueteriaOtro("");
    }
  };

  const handleEditar = () => {
    setEditando(true);
    setMensaje("");
  };

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
            <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-all duration-200 font-medium">
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
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Formulario de Entrada</h2>
          <p className="text-gray-600">Registro de equipos médicos y transductores</p>
        </div>

        {/* Equipment Type Selection */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Tipo de Equipo</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 ${
              tipoEquipo === "ultrasonido" 
                ? "border-teal-500 bg-teal-50" 
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}>
              <input
                type="radio"
                value="ultrasonido"
                checked={tipoEquipo === "ultrasonido"}
                onChange={handleTipoChange}
                className="sr-only"
                disabled={!editando}
              />
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  tipoEquipo === "ultrasonido" ? "bg-teal-500" : "bg-gray-100"
                }`}>
                  <Activity className={`w-6 h-6 ${
                    tipoEquipo === "ultrasonido" ? "text-white" : "text-gray-500"
                  }`} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Ultrasonido</h4>
                  <p className="text-sm text-gray-500">Equipo de ultrasonido completo</p>
                </div>
              </div>
            </label>

            <label className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 ${
              tipoEquipo === "transductor" 
                ? "border-teal-500 bg-teal-50" 
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}>
              <input
                type="radio"
                value="transductor"
                checked={tipoEquipo === "transductor"}
                onChange={handleTipoChange}
                className="sr-only"
                disabled={!editando}
              />
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  tipoEquipo === "transductor" ? "bg-teal-500" : "bg-gray-100"
                }`}>
                  <Stethoscope className={`w-6 h-6 ${
                    tipoEquipo === "transductor" ? "text-white" : "text-gray-500"
                  }`} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Transductor</h4>
                  <p className="text-sm text-gray-500">Sonda o transductor individual</p>
                </div>
              </div>
            </label>
          </div>
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
                    placeholder="Ej. GE Healthcare"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modelo del equipo *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    value={modelo}
                    onChange={(e) => setModelo(e.target.value)}
                    disabled={!editando}
                    placeholder="Modelo del equipo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de serie *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    value={numeroSerie}
                    onChange={(e) => setNumeroSerie(e.target.value)}
                    disabled={!editando}
                    placeholder="Número de serie"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Responsable
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    value={responsable}
                    onChange={(e) => setResponsable(e.target.value)}
                    disabled={!editando}
                    placeholder="Nombre completo del responsable"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-orange-600" />
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
                    value={guia}
                    onChange={(e) => setGuia(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    disabled={!editando}
                    placeholder="Número de guía"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paquetería *
                  </label>
                  <select
                    value={paqueteria}
                    onChange={handlePaqueteriaChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    disabled={!editando}
                  >
                    <option value="">Selecciona paquetería</option>
                    <option value="dhl">DHL</option>
                    <option value="fedex">FedEx</option>
                    <option value="estafeta">Estafeta</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                {paqueteria === "otro" && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Especificar paquetería
                    </label>
                    <input
                      type="text"
                      value={paqueteriaOtro}
                      onChange={(e) => setPaqueteriaOtro(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                      disabled={!editando}
                      placeholder="Nombre de la paquetería"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Transducers */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Transductores Incluidos</h3>
              </div>

              <div className="space-y-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                    <label className="flex items-center space-x-3 mb-4">
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            [`transductor${n}_aplica`]: e.target.checked,
                          }))
                        }
                        disabled={!editando}
                      />
                      <span className="font-medium text-gray-800">
                        Transductor {n} {n === 1 ? "" : "(opcional)"}
                      </span>
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Modelo
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              [`transductor${n}_modelo`]: e.target.value,
                            }))
                          }
                          disabled={!editando}
                          placeholder="Modelo"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Número de serie
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              [`transductor${n}_serie`]: e.target.value,
                            }))
                          }
                          disabled={!editando}
                          placeholder="Serie"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Estado
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              [`transductor${n}_estado`]: e.target.value,
                            }))
                          }
                          disabled={!editando}
                          placeholder="Estado físico"
                        />
                      </div>
                    </div>
                  </div>
                ))}
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
                  { key: "incluye_sondas_seguras", label: "Sonda(s) segura" },
                  { key: "adaptadores", label: "Adaptadores y cargadores" },
                  { key: "cables_generales", label: "Cables en general" },
                  { key: "incluye_impresora", label: "Impresora térmica" },
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
                  placeholder="Describe el estado general del equipo, daños visibles, limpieza, etc."
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    value={tipoTransductor}
                    onChange={(e) => setTipoTransductor(e.target.value)}
                    disabled={!editando}
                    placeholder="Ej. Lineal, Convexo, Sectorial"
                  />
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    value={modelo}
                    onChange={(e) => setModelo(e.target.value)}
                    disabled={!editando}
                    placeholder="Modelo del transductor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de serie *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    value={numeroSerie}
                    onChange={(e) => setNumeroSerie(e.target.value)}
                    disabled={!editando}
                    placeholder="Número de serie"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Responsable
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    value={responsable}
                    onChange={(e) => setResponsable(e.target.value)}
                    disabled={!editando}
                    placeholder="Nombre completo del responsable"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-orange-600" />
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
                    value={guia}
                    onChange={(e) => setGuia(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    disabled={!editando}
                    placeholder="Número de guía"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paquetería *
                  </label>
                  <select
                    value={paqueteria}
                    onChange={handlePaqueteriaChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    disabled={!editando}
                  >
                    <option value="">Selecciona paquetería</option>
                    <option value="dhl">DHL</option>
                    <option value="fedex">FedEx</option>
                    <option value="estafeta">Estafeta</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                {paqueteria === "otro" && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Especificar paquetería
                    </label>
                    <input
                      type="text"
                      value={paqueteriaOtro}
                      onChange={(e) => setPaqueteriaOtro(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                      disabled={!editando}
                      placeholder="Nombre de la paquetería"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Accessories */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Accesorios Incluidos</h3>
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
                  placeholder="Describe el estado del transductor, cable, conectores, etc."
                />
              </div>
            </div>
          </div>
        )}

        {/* Messages and Actions */}
        {mensaje && (
          <div className={`p-4 rounded-xl border ${
            mensaje.includes("Error") 
              ? "bg-red-50 border-red-200 text-red-800" 
              : "bg-green-50 border-green-200 text-green-800"
          }`}>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                mensaje.includes("Error") ? "bg-red-500" : "bg-green-500"
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
                className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Guardar Información
              </button>
            ) : (
              <button
                onClick={handleEditar}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Editar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}