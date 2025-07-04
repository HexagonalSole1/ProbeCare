import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown, Loader2, AlertTriangle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const roles = [
  {
    value: "vendedores",
    label: "Vendedores",
  },
  {
    value: "ingenieros", 
    label: "Ingenieros",
  },
]

// Componente simple para mostrar mensajes
const MessageBox = ({ type, message, debugInfo }) => {
  const baseClasses = "p-3 rounded-md border text-sm mb-4"
  const typeClasses = {
    error: "bg-red-50 border-red-200 text-red-800",
    success: "bg-green-50 border-green-200 text-green-800",
    info: "bg-blue-50 border-blue-200 text-blue-800"
  }

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <div className="flex items-start gap-2">
        {type === 'error' && <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />}
        {type === 'success' && <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />}
        <div className="flex-1">
          <p>{message}</p>
          {debugInfo && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs opacity-70 hover:opacity-100">
                Ver detalles técnicos
              </summary>
              <pre className="mt-1 text-xs bg-black/5 p-2 rounded border font-mono">
                {debugInfo}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Register() {
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [selectedRole, setSelectedRole] = useState("")
    const [open, setOpen] = useState(false)
    const [error, setError] = useState(null)
    const [message, setMessage] = useState(null)
    const [loading, setLoading] = useState(false)
    const [debugInfo, setDebugInfo] = useState(null)
    const navigate = useNavigate()

    // Función para limpiar mensajes
    const clearMessages = () => {
        setError(null)
        setMessage(null)
        setDebugInfo(null)
    }

    // Validación del formulario
    const validateForm = () => {
        if (!fullName.trim()) {
            setError("El nombre completo es requerido")
            return false
        }
        if (!email.trim() || !email.includes('@')) {
            setError("El correo electrónico debe ser válido")
            return false
        }
        if (!password || password.length < 6) {
            setError("La contraseña") 
            return false
        }
        if (!selectedRole) {
            setError("Por favor selecciona un rol")
            return false
        }
        return true
    }

    // Función para verificar si la tabla profiles existe
    const checkDatabaseSetup = async () => {
        try {
            // Intentar hacer un select simple para verificar que la tabla existe
            const { data, error } = await supabase
                .from('profiles')
                .select('id')
                .limit(1)

            if (error) {
                console.error('Error al verificar tabla profiles:', error)
                setDebugInfo(`Error BD: ${error.message} | Code: ${error.code} | Details: ${error.details}`)
                return false
            }
            console.log('✅ Tabla profiles verificada correctamente')
            return true
        } catch (error) {
            console.error('Error conectando a la base de datos:', error)
            setDebugInfo(`Error conexión: ${error.message}`)
            return false
        }
    }

    // Redirigir según el rol
    const redirectByRole = (role) => {
        console.log('Redirigiendo según rol:', role)
        
        switch (role) {
            case 'ingenieros':
                navigate("/EngineerDashboard")
                break
            case 'vendedores':
                navigate("/dashboard")
                break
            default:
                console.log('⚠️ Rol no reconocido:', role)
                navigate("/dashboard")
        }
    }

    const handleRegister = async () => {
        clearMessages()

        // Validar formulario
        if (!validateForm()) {
            return
        }

        setLoading(true)

        try {
            //  Verificar que la base de datos esté configurada
            console.log('🔍 Verificando configuración de base de datos...')
            const dbSetup = await checkDatabaseSetup()
            if (!dbSetup) {
                setError("La tabla de perfiles no está configurada. Contacta al administrador.")
                setLoading(false)
                return
            }
            console.log('✅ Base de datos configurada correctamente')

            //  Registrar usuario en Supabase Auth
            console.log('👤 Registrando usuario...', { email, role: selectedRole })
            
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: selectedRole
                    }
                }
            })

            console.log('📧 Respuesta de auth.signUp:', { authData, authError })

            if (authError) {
                console.error('❌ Error de autenticación:', authError)
                setError(`Error de autenticación: ${authError.message}`)
                setDebugInfo(`Código: ${authError.status || 'N/A'}\nDetalles: ${JSON.stringify(authError, null, 2)}`)
                return
            }

            if (!authData.user) {
                setError("No se pudo crear el usuario")
                setDebugInfo("authData.user es null")
                return
            }

            console.log('✅ Usuario creado en auth:', authData.user.id)

            console.log('⏳ Esperando trigger automático...')
            await new Promise(resolve => setTimeout(resolve, 2000))

            const { data: existingProfile, error: profileCheckError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authData.user.id)
                .single()

            console.log('🔍 Verificación de perfil:', { existingProfile, profileCheckError })

            let finalProfile = existingProfile

        
            if (!existingProfile) {
                console.log('🔧 Creando perfil manualmente...')
                
                const { data: newProfile, error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: authData.user.id,
                        email: email,
                        full_name: fullName,
                        role: selectedRole
                    })
                    .select()
                    .single()

                console.log('💾 Resultado de crear perfil:', { newProfile, profileError })

                if (profileError) {
                    console.error('❌ Error al crear perfil:', profileError)
                    setError(`Error al crear perfil: ${profileError.message}`)
                    setDebugInfo(`Detalles: ${profileError.details || 'N/A'}\nHint: ${profileError.hint || 'N/A'}\nCode: ${profileError.code || 'N/A'}`)
                    return
                }
                
                finalProfile = newProfile
                console.log('✅ Perfil creado manualmente')
            } else {
                console.log('✅ Perfil creado automáticamente por trigger')
            }

            
            console.log('Registro completado exitosamente')
            console.log('Perfil final:', finalProfile)
            
            if (authData.user.email_confirmed_at) {
            
                setMessage(`¡Registro exitoso! Bienvenido ${finalProfile.full_name}. Redirigiendo a tu dashboard...`)
                setTimeout(() => {
                    redirectByRole(finalProfile.role) 
                }, 2000)
            } else {
            
                setMessage(`¡Registro exitoso como ${finalProfile.role}! Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.`)
            }

        } catch (error) {
            console.error('💥 Error inesperado:', error)
            setError('Error inesperado durante el registro')
            setDebugInfo(`Error: ${error.message}\nStack: ${error.stack}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 space-y-6">
                <h2 className="text-3xl font-bold text-center text-[#16223C]">Crear Cuenta</h2>
                
                <div className="space-y-4">
                    <Input
                        placeholder="Nombre completo"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={loading}
                    />
                    
                    <Input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                    />
                    
                    <Input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                    />

                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="w-full justify-between h-10"
                                disabled={loading}
                            >
                                <span className={selectedRole ? "text-foreground" : "text-muted-foreground"}>
                                    {selectedRole
                                        ? roles.find((role) => role.value === selectedRole)?.label
                                        : "Selecciona tu rol..."}
                                </span>
                                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                            <Command>
                                <CommandInput placeholder="Buscar rol..." />
                                <CommandList>
                                    <CommandEmpty>No se encontró ningún rol.</CommandEmpty>
                                    <CommandGroup>
                                        {roles.map((role) => (
                                            <CommandItem
                                                key={role.value}
                                                value={role.value}
                                                onSelect={(currentValue) => {
                                                    setSelectedRole(currentValue === selectedRole ? "" : currentValue)
                                                    setOpen(false)
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedRole === role.value ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {role.label}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Mostrar mensajes de error */}
                {error && (
                    <MessageBox 
                        type="error" 
                        message={error} 
                        debugInfo={debugInfo}
                    />
                )}
                
                {/* Mostrar mensajes de éxito */}
                {message && (
                    <MessageBox 
                        type="success" 
                        message={message} 
                    />
                )}
                
                <Button
                    onClick={handleRegister}
                    className="w-full bg-[#213057] hover:bg-[#16223C] text-white"
                    disabled={loading}
                >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? "Registrando..." : "Registrarse"}
                </Button>
                
                <div className="text-center">
                    <a href="/" className="text-sm text-[#03B4AC] hover:underline">
                        ¿Ya tienes cuenta? Inicia sesión
                    </a>
                </div>
            </div>
        </div>
    )
}