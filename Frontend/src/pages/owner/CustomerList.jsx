import { useEffect, useState } from "react"
import { useAppContext } from "../../context/AppContext"

const CustomerList = () => {
    const { axios } = useAppContext()
    const [customers, setCustomers] = useState([])

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const { data } = await axios.get("/api/owner/customers")
                setCustomers(data)
            } catch (error) {
                console.error("Error fetching customers", error)
            }
        }
        fetchCustomers()
    }, [axios])

    return (
        <div className="p-4 w-full">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Customer List</h2>

            {/* Responsive Table Wrapper */}
            <div className="overflow-x-auto">
                <table className="w-full border text-sm sm:text-base">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border px-3 py-2 sm:px-4 text-gray-700 whitespace-nowrap">Name</th>
                            <th className="border px-3 py-2 sm:px-4 text-gray-700 whitespace-nowrap">Email</th>
                        </tr>
                    </thead>

                    <tbody>
                        {customers.length > 0 ? (
                            customers.map((c, i) => (
                                <tr key={i}>
                                    <td className="border px-3 py-2 sm:px-4">{c.name}</td>
                                    <td className="border px-3 py-2 sm:px-4">{c.email}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="2" className="text-center p-3 text-gray-700">
                                    No customers found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default CustomerList
