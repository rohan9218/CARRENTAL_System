import { useEffect } from "react"
import { Outlet } from "react-router-dom"
import NavbarOwner from "../../components/owner/NavbarOwner"
import Sidebar from "../../components/owner/Sidebar"
import { useAppContext } from "../../context/AppContext"

const Layout = () => {
  const { isOwner, navigate, user, loading } = useAppContext()

  useEffect(() => {
    // ✅ Wait until loading is finished before deciding
    if (!loading && !isOwner) {
      navigate("/")
    }
  }, [isOwner, loading, navigate])

  if (loading) {
    return <div className="w-full h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex flex-col">
      <NavbarOwner />
      <div className="flex">
        <Sidebar />
        <Outlet />
      </div>
    </div>
  )
}

export default Layout
