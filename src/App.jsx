

// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Login from "@/pages/Login" 
import Register from "@/pages/Register"
import Dashboard from "@/pages/Dashboard"
import CustomerHistory from "@/pages/CustomerHistory"
import CustomerSale from "./pages/CustomerSale"
import ExitForm from "./pages/ExitForm"
import EngineerDashboard from "@/pages/EngineerDashboard"
import CustomerService from "./pages/CustomerService"
import EntryForm from "./pages/EntryForm"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customer/:id/history" element={<CustomerHistory />} />
        <Route path="/customer/:id/sale" element={<CustomerSale />} />
        <Route path="/Exit-Form" element={<ExitForm />} />
        <Route path="/dashboard/ingenieros" element={<EngineerDashboard />} />
        <Route path="/cliente/:id/servicio" element={<CustomerService />} />
        <Route path="/engineer/:id/entryForm" element={<EntryForm/>}/>
      </Routes>
    </Router>
  )
}

export default App
