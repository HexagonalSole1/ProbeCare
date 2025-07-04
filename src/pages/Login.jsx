import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle, CheckCircle, Eye, EyeOff } from "lucide-react"

// Componente simple para mostrar mensajes (igual que en Register)
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
              <pre className="mt-1 text-xs bg-black/5 p-2 rounded border font-mono whitespace-pre-wrap">
                {debugInfo}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
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
    if (!email.trim() || !email.includes('@')) {
      setError("El correo electrónico debe ser válido")
      return false
    }
    if (!password || password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return false
    }
    return true
  }

  // Función para obtener el perfil del usuario
  const getUserProfile = async (userId) => {
    try {
      console.log('Obteniendo perfil para usuario:', userId)
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error al obtener perfil:', error)
        return null
      }

      console.log('Perfil obtenido:', profile)
      return profile
    } catch (error) {
      console.error('Error inesperado al obtener perfil:', error)
      return null
    }
  }

  // Función para redirigir según el rol
  const redirectByRole = (profile) => {
    if (!profile || !profile.role) {
      console.log('⚠️ Sin perfil o rol, redirigiendo a dashboard genérico')
      navigate("/dashboard")
      return
    }

    console.log('Redirigiendo según rol:', profile.role)
    
    switch (profile.role) {
      case 'ingenieros':
        navigate("/dashboard/ingenieros")
        break
      case 'vendedores':
        navigate("/dashboard")
        break
      default:
        console.log('⚠️ Rol no reconocido:', profile.role)
        navigate("/dashboard")
    }
  }
  const handleLogin = async () => {
    clearMessages()

    // Validar formulario
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      console.log('Intentando iniciar sesión...', { email })

      // 1. Autenticar usuario
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      console.log('Respuesta de auth.signInWithPassword:', { authData, authError })

      if (authError) {
        console.error('Error de autenticación:', authError)
        
        // Manejar errores específicos
        if (authError.message.includes('Invalid login credentials')) {
          setError("Credenciales incorrectas. Verifica tu email y contraseña.")
        } else if (authError.message.includes('Email not confirmed')) {
          setError("Tu email no ha sido confirmado. Revisa tu bandeja de entrada.")
        } else {
          setError(`Error de autenticación: ${authError.message}`)
        }
        
        setDebugInfo(`Código: ${authError.status || 'N/A'}\nDetalles: ${JSON.stringify(authError, null, 2)}`)
        return
      }

      if (!authData.user) {
        setError("No se pudo iniciar sesión")
        setDebugInfo("authData.user es null")
        return
      }

      console.log('Usuario autenticado:', authData.user.id)

      // 2. Obtener perfil del usuario
      setMessage("Autenticación exitosa. Obteniendo perfil...")
      
      const profile = await getUserProfile(authData.user.id)
      
      if (!profile) {
        setError("No se pudo obtener el perfil del usuario. Contacta al administrador.")
        setDebugInfo("El usuario no tiene un perfil asociado en la tabla profiles")
        return
      }

      // 3. Mostrar mensaje de bienvenida
      setMessage(`¡Bienvenido, ${profile.full_name}! (${profile.role})`)
      
      // 4. Redirigir según el rol después de un breve delay
      setTimeout(() => {
        redirectByRole(profile)
      }, 1500)

    } catch (error) {
      console.error('Error inesperado durante el login:', error)
      setError('Error inesperado durante el inicio de sesión')
      setDebugInfo(`Error: ${error.message}\nStack: ${error.stack}`)
    } finally {
      setLoading(false)
    }
  }

  // Manejar Enter en los inputs
  function handleKeyPress(e) {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-[#16223C]">Iniciar Sesión</h2>
          <p className="text-gray-600 text-sm">Ingresa tu correo para acceder</p>
        </div>
        
        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            autoComplete="email"
          />
          
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              autoComplete="current-password"
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </Button>
          </div>
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
        {message && !error && (
          <MessageBox 
            type="success" 
            message={message} 
          />
        )}
        
        <Button
          onClick={handleLogin}
          className="w-full bg-[#213057] hover:bg-[#16223C] text-white"
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Iniciando sesión..." : "Ingresar"}
        </Button>
        
        <div className="text-center space-y-2">
          <a href="/register" className="block text-sm text-[#03B4AC] hover:underline">
            ¿No tienes cuenta? Regístrate aquí
          </a>
        </div>
      </div>
    </div>
  )
}