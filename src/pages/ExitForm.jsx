import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "../lib/supabase";

export default function FormularioSalida() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fecha_salida: "",
    modelo_equipo: "",
    numero_serie: "",
    responsable: "",
    destino: "",
    cliente: "",
    paqueteria: "",
  });

  const [revision, setRevision] = useState({
    cables: { respuesta: "", comentarios: "" },
    pantalla: { respuesta: "", comentarios: "" },
    bateria: { respuesta: "", comentarios: "" },
    encendido: { respuesta: "", comentarios: "" },
    guardadoPaciente: { respuesta: "", comentarios: "" },
    guardadoImagen: { respuesta: "", comentarios: "" },
    usb: { respuesta: "", comentarios: "" },
    pantallaExterna: { respuesta: "", comentarios: "" },
    grabadorPantalla: { respuesta: "", comentarios: "" },
    botonesAlfanumericos: { respuesta: "", comentarios: "" },
    botonesConsola: { respuesta: "", comentarios: "" },
    tgc: { respuesta: "", comentarios: "" },
  });

  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRevisionChange = (campo, tipo, valor) => {
    setRevision((prev) => ({
      ...prev,
      [campo]: { ...prev[campo], [tipo]: valor },
    }));
  };

  const handleGuardar = async () => {
    setMensaje("");
    setLoading(true);

    const datos = {
  ...form,
  cables_respuesta: revision.cables.respuesta,
  cables_comentarios: revision.cables.comentarios,
  pantalla_respuesta: revision.pantalla.respuesta,
  pantalla_comentarios: revision.pantalla.comentarios,
  bateria_respuesta: revision.bateria.respuesta,
  bateria_comentarios: revision.bateria.comentarios,
  encendido_respuesta: revision.encendido.respuesta,
  encendido_comentarios: revision.encendido.comentarios,
  guardadoPaciente_respuesta: revision.guardadoPaciente.respuesta,
  guardadoPaciente_comentarios: revision.guardadoPaciente.comentarios,
  guardadoImagen_respuesta: revision.guardadoImagen.respuesta,
  guardadoImagen_comentarios: revision.guardadoImagen.comentarios,
  usb_respuesta: revision.usb.respuesta,
  usb_comentarios: revision.usb.comentarios,
  pantallaExterna_respuesta: revision.pantallaExterna.respuesta,
  pantallaExterna_comentarios: revision.pantallaExterna.comentarios,
  grabadorPantalla_respuesta: revision.grabadorPantalla.respuesta,
  grabadorPantalla_comentarios: revision.grabadorPantalla.comentarios,
  botonesAlfanumericos_respuesta: revision.botonesAlfanumericos.respuesta,
  botonesAlfanumericos_comentarios: revision.botonesAlfanumericos.comentarios,
  botonesConsola_respuesta: revision.botonesConsola.respuesta,
  botonesConsola_comentarios: revision.botonesConsola.comentarios,
  tgc_respuesta: revision.tgc.respuesta,
  tgc_comentarios: revision.tgc.comentarios,
};


    const { error } = await supabase.from("ExitForm").insert([datos]);

    if (error) {
      setMensaje("Error al guardar el formulario: " + error.message);
    } else {
      setMensaje("Formulario guardado exitosamente");
      setTimeout(() => navigate("/dashboard"), 1500);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-xl mt-6 space-y-10">
      <h2 className="text-2xl font-bold text-slate-800">
        Formulario de salida
      </h2>

      {/* Información General */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-slate-700 mb-2">Información General</h3>

        {[
          { label: "Fecha de salida", name: "fecha_salida", type: "date" },
          { label: "Modelo de equipo", name: "modelo_equipo" },
          { label: "Número de serie del equipo", name: "numero_serie" },
          { label: "Nombre del responsable", name: "responsable" },
          { label: "Destino", name: "destino" },
          { label: "Nombre del cliente", name: "nombre_cliente" },
          { label: "Paquetería", name: "paqueteria" },
        ].map(({ label, name, type = "text" }) => (
          <div key={name}>
            <label className="block font-medium text-slate-700 mb-1">{label}</label>
            <input
              type={type}
              name={name}
              value={form[name]}
              onChange={handleChange}
              className="w-full border rounded px-4 py-2"
            />
          </div>
        ))}
      </section>

      {/* Revisión del Equipo */}
      <section className="space-y-6">
        <h3 className="text-xl font-semibold text-slate-700 mb-2">Revisión del Equipo</h3>
        {[
            { key: "cables", label: "Cable(s) sin daños visibles" },
            { key: "pantalla", label: "Pantalla funcionando correctamente" },
            { key: "bateria", label: "Batería funcionando correctamente" },
            { key: "encendido", label: "Encendido y Apagado funciona correctamente" },
            { key: "guardadoPaciente", label: "Guardado de paciente funciona correctamente" },
            { key: "guardadoImagen", label: "Guardado de imágenes funciona correctamente" },
            { key: "usb", label: "Funcionamiento correcto de USB" },
            { key: "pantallaExterna", label: "Pantalla externa funciona correctamente" },
            { key: "grabadorPantalla", label: "Grabador de pantalla funciona correctamente" },
            { key: "botonesAlfanumericos", label: "Botones alfanuméricos funcionando correctamente" },
            { key: "botonesConsola", label: "Botones de consola completos y funcionando correctamente" },
            { key: "tgc", label: "TGC funcionando correctamente" },
        ].map(({ key, label }) => (
          <div key={key} className="space-y-1">
            <label className="block font-medium text-slate-700">{label}</label>
            <div className="flex items-center space-x-4 mb-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`${key}_respuesta`}
                  value="SI"
                  checked={revision[key].respuesta === "SI"}
                  onChange={(e) => handleRevisionChange(key, "respuesta", e.target.value)}
                />
                <span>SI</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`${key}_respuesta`}
                  value="NO"
                  checked={revision[key].respuesta === "NO"}
                  onChange={(e) => handleRevisionChange(key, "respuesta", e.target.value)}
                />
                <span>NO</span>
              </label>
            </div>
            <textarea
              name={`${key}_comentarios`}
              value={revision[key].comentarios}
              onChange={(e) => handleRevisionChange(key, "comentarios", e.target.value)}
              className="w-full border rounded px-4 py-2"
              rows={2}
              placeholder="Comentarios..."
            />
          </div>
        ))}
      </section>

      {/* Transductores */}
<section className="space-y-6">
  <h3 className="text-xl font-semibold text-slate-700 mb-2">
    Transductores (marca los recuadros si aplica)
  </h3>

  {[1, 2, 3, 4].map((n) => (
    <div
      key={n}
      className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50"
    >
      <label className="flex items-center space-x-2 font-medium text-slate-700">
        <input
          type="checkbox"
          name={`transductor${n}_aplica`}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              [`transductor${n}_aplica`]: e.target.checked,
            }))
          }
        />
        <span>Transductor {n} {n === 1 ? "" : "(si aplica)"}</span>
      </label>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-slate-700 mb-1">Modelo</label>
          <input
            type="text"
            name={`transductor${n}_modelo`}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                [`transductor${n}_modelo`]: e.target.value,
              }))
            }
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-700 mb-1">Número de serie</label>
          <input
            type="text"
            name={`transductor${n}_serie`}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                [`transductor${n}_serie`]: e.target.value,
              }))
            }
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-700 mb-1">Estado</label>
          <input
            type="text"
            name={`transductor${n}_estado`}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                [`transductor${n}_estado`]: e.target.value,
              }))
            }
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>
    </div>
  ))}
</section>

{/* Accesorios y Materiales */}
<section className="space-y-6 mt-10">
  <h3 className="text-xl font-semibold text-slate-700 mb-2">
    Accesorios y Materiales (marcar los recuadros si aplica)
  </h3>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {[
      { key: "gel_ultrasonido", label: "Gel para ultrasonido (si aplica)" },
      { key: "incluye_cable_alimentacion", label: "Cable(s) de alimentación" },
      { key: "maletin", label: "Maletín de transporte en buen estado (si aplica)" },
      { key: "incluye_sondas_seguras", label: "Sonda(s) correctamente almacenada y segura" },
      { key: "adaptadores", label: "Adaptadores y cargadores (si aplica)" },
      { key: "cables_generales", label: "Cables en general (si aplica)" },
      { key: "incluye_impresora", label: "Impresora térmica (si aplica)" },
    ].map(({ key, label }) => (
      <label key={key} className="flex items-center space-x-3 text-slate-700">
        <input
          type="checkbox"
          onChange={(e) =>
            setForm((prev) => ({ ...prev, [key]: e.target.checked }))
          }
        />
        <span>{label}</span>
      </label>
    ))}
  </div>
</section>

{/* Detalles estéticos */}
<section className="space-y-4 mt-10">
  <h3 className="text-xl font-semibold text-slate-700 mb-2">
    Detalles estéticos
  </h3>

  <div>
    <label className="block text-slate-700 font-medium mb-2">
      Observaciones:
    </label>
    <textarea
      rows={4}
      value={form.detalles_esteticos || ""}
      onChange={(e) =>
        setForm((prev) => ({ ...prev, detalles_esteticos: e.target.value }))
      }
      placeholder="Anota observaciones estéticas del equipo..."
      className="w-full border border-slate-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
    />
  </div>
</section>

 {mensaje && (
        <div className="mb-4 px-4 py-2 border rounded text-sm text-red-700 bg-red-100">
          {mensaje}
        </div>
      )}

       <div className="flex justify-end space-x-4">
        <Button onClick={() => navigate(-1)} className="!bg-gray-300 text-black">
          Volver
        </Button>
        <Button
          onClick={handleGuardar}
          disabled={loading}
          className="!bg-blue-600 text-white"
        >
          {loading ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </div>
  );
}

