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
            <h2 className="text-xl font-bold mb-4">Customer List</h2>
            <table className="w-full border ">
                <thead>
                    <tr className="bg-gray-200 ">
                        <th className="border p-2 text-gray-700">Name</th>
                        <th className="border p-2 text-gray-700">Email</th>
                        
                    </tr>
                </thead>
                <tbody>
                    {customers.length > 0 ? (
                        customers.map((c, i) => (
                            <tr key={i}>
                                <td className="border p-2">{c.name}</td>
                                <td className="border p-2">{c.email}</td>
                                
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" className="text-center p-2 text-gray-700">
                                No customers found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default CustomerList
