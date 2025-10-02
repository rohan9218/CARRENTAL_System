import { useEffect, useState } from "react"
import { useAppContext } from "../../context/AppContext"

const Owners = () => {
    const { axios } = useAppContext()
    const [owners, setOwners] = useState([])

    useEffect(() => {
        const fetchOwners = async () => {
            try {
                const { data } = await axios.get("/api/owner/me")

                // ✅ Normalize response: always array
                if (Array.isArray(data)) {
                    setOwners(data) // Main Owner (all owners list)
                } else if (data) {
                    setOwners([data]) // Normal Owner (single owner object)
                } else {
                    setOwners([])
                }
            } catch (error) {
                console.error("Error fetching owners", error)
            }
        }
        fetchOwners()
    }, [axios])

    return (
        <div className="p-4 w-full">
            <h2 className="text-xl font-bold mb-4">Owners List</h2>
            <table className="w-full border">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border p-2 text-gray-700">Name</th>
                        <th className="border p-2 text-gray-700">Email</th>
                    </tr>
                </thead>
                <tbody>
                    {owners.length > 0 ? (
                        owners.map((o, i) => (
                            <tr key={i}>
                                <td className="border p-2">{o.name}</td>
                                <td className="border p-2">{o.email}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="2" className="text-center p-2">
                                No owners found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default Owners
