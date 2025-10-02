// src/pages/owner/AddCar.jsx
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useNavigate, useParams } from "react-router-dom"
import { assets } from "../../assets/assets"
import Title from "../../components/owner/Title"
import { useAppContext } from "../../context/AppContext"

// ✅ Import Gemini
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

const AddCar = () => {
  const { axios, currency, user } = useAppContext()
  const { id } = useParams()
  const navigate = useNavigate()

  const emptyCar = {
    brand: "",
    model: "",
    year: "",
    pricePerDay: "",
    category: "",
    transmission: "",
    fuel_type: "",
    seating_capacity: "",
    location: "",
    description: "",
  }

  const [image, setImage] = useState(null)
  const [car, setCar] = useState(emptyCar)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch car details if editing
  useEffect(() => {
    if (!id) return
    const fetchCar = async () => {
      try {
        const { data } = await axios.get(`/api/owner/car/${id}`)
        if (data.success) {
          setCar(data.car)
        } else {
          toast.error(data.message)
        }
      } catch (error) {
        toast.error(error.response?.data?.message || error.message)
      }
    }
    fetchCar()
  }, [id])

  // ✅ Auto-generate car details from uploaded image + AI enrichment
  const analyzeCarImage = async (file) => {
    try {
      // Use the correct Gemini Vision model
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

      // Convert file → Base64
      const toBase64 = (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = () => resolve(reader.result.split(",")[1])
          reader.onerror = reject
        })

      const base64 = await toBase64(file)

      // ---- STEP 1: Extract brand & model from image ----
      const step1Prompt = `
      You are analyzing a car image.
      Return ONLY JSON with the following fields:
      {
        "brand": "",
        "model": ""
      }
      Do not include markdown or extra text.
      `

      const step1Res = await model.generateContent([
        { inlineData: { data: base64, mimeType: file.type } },
        { text: step1Prompt },
      ])

      let step1Text = await step1Res.response.text()
      step1Text = step1Text.replace(/```json/g, "").replace(/```/g, "").trim()
      const { brand, model: carModel } = JSON.parse(step1Text)

      // ---- STEP 2: Enrich details using brand + model ----
      const step2Prompt = `
      Based on the car brand "${brand}" and model "${carModel}", 
      provide realistic details in JSON format only:
      {
        "year": "YYYY",
        "fuel_type": "Petrol/Diesel/Electric/Hybrid",
        "transmission": "Manual/Automatic/CVT/Other",
        "seating_capacity": "Number",
        "category": "SUV/Sedan/Hatchback/Luxury/Other",
        "description": "A short 2-3 line attractive rental description."
      }
      Use general automotive knowledge if exact year or fuel type is not clear.
      No markdown, no explanation.
      `

      const step2Res = await model.generateContent(step2Prompt)
      let step2Text = await step2Res.response.text()
      step2Text = step2Text.replace(/```json/g, "").replace(/```/g, "").trim()
      const extraDetails = JSON.parse(step2Text)

      // ---- Merge into state ----
      setCar((prev) => ({
        ...prev,
        brand: brand || prev.brand,
        model: carModel || prev.model,
        ...extraDetails,
      }))

      toast.success("Car details auto-generated with AI!")
    } catch (error) {
      console.error("Gemini Error:", error)
      toast.error("Could not analyze car image")
    }
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    if (isLoading) return

    if (!id && !image) return toast.error("Please upload a car image")
    if (car.year < 1900 || car.year > new Date().getFullYear()) {
      return toast.error("Enter a valid year")
    }
    if (car.pricePerDay <= 0) return toast.error("Price must be greater than 0")
    if (car.seating_capacity <= 0) return toast.error("Seating capacity must be greater than 0")

    if (!id && user?.email !== "rohandesai9218@gmail.com") {
      const confirm = window.confirm(
        "If you add cars into this site, you will give 20% commission.\n\nPress OK to continue or Cancel to abort."
      )
      if (!confirm) return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      if (image) formData.append("image", image)
      formData.append("carData", JSON.stringify(car))

      let data
      if (id) {
        const res = await axios.put(`/api/owner/update-car/${id}`, formData)
        data = res.data
      } else {
        const res = await axios.post("/api/owner/add-car", formData)
        data = res.data
      }

      if (data.success) {
        toast.success(data.message)
        navigate("/owner/manage-cars")
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="px-4 py-10 md:px-10 flex-1">
      <Title
        title={id ? "Update Car" : "Add New Car"}
        subTitle={
          id
            ? "Modify details of your listed car."
            : "Upload a car image and we’ll auto-fill the details."
        }
      />

      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col gap-5 text-gray-500 text-sm mt-6 max-w-xl"
      >
        {/* Car Image Upload */}
        <div className="flex items-center gap-2 w-full">
          <label htmlFor="car-image">
            <img
              src={image ? URL.createObjectURL(image) : car.image || assets.upload_icon}
              alt="Car Upload"
              className="h-14 rounded cursor-pointer border"
            />
            <input
              type="file"
              id="car-image"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files[0]
                if (file) {
                  setImage(file)
                  analyzeCarImage(file) // ✅ auto-analyze
                }
              }}
            />
          </label>
          <p className="text-sm text-gray-500">
            {id ? "Change car picture (optional)" : "Upload a picture of your car"}
          </p>
        </div>

        {/* Auto-Filled & Editable Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label>Brand</label>
            <input
              value={car.brand}
              onChange={(e) => setCar({ ...car, brand: e.target.value })}
              className="px-3 py-2 mt-1 border rounded-md outline-none"
              placeholder="e.g. BMW, Mercedes, Audi..."
              required
            />
          </div>

          <div className="flex flex-col">
            <label>Model</label>
            <input
              value={car.model}
              onChange={(e) => setCar({ ...car, model: e.target.value })}
              className="px-3 py-2 mt-1 border rounded-md outline-none"
              placeholder="e.g. X5, E-Class, M4..."
              required
            />
          </div>

          <div className="flex flex-col">
            <label>Year</label>
            <input
              value={car.year}
              onChange={(e) => setCar({ ...car, year: e.target.value })}
              className="px-3 py-2 mt-1 border rounded-md outline-none"
              placeholder="2025"
              required
            />
          </div>

          <div className="flex flex-col">
            <label>Category</label>
            <input
              value={car.category}
              onChange={(e) => setCar({ ...car, category: e.target.value })}
              className="px-3 py-2 mt-1 border rounded-md outline-none"
              required
            />
          </div>

          <div className="flex flex-col">
            <label>Transmission</label>
            <input
              value={car.transmission}
              onChange={(e) => setCar({ ...car, transmission: e.target.value })}
              className="px-3 py-2 mt-1 border rounded-md outline-none"
              required
            />
          </div>

          <div className="flex flex-col">
            <label>Fuel Type</label>
            <input
              value={car.fuel_type}
              onChange={(e) => setCar({ ...car, fuel_type: e.target.value })}
              className="px-3 py-2 mt-1 border rounded-md outline-none"
              required
            />
          </div>

          <div className="flex flex-col">
            <label>Daily Price ({currency})</label>
            <input
              type="number"
              placeholder="100"
              required
              className="px-3 py-2 mt-1 border rounded-md outline-none"
              value={car.pricePerDay}
              onChange={(e) => setCar({ ...car, pricePerDay: e.target.value })}
            />
          </div>

          <div className="flex flex-col">
            <label>Seating Capacity</label>
            <input
              value={car.seating_capacity}
              onChange={(e) => setCar({ ...car, seating_capacity: e.target.value })}
              className="px-3 py-2 mt-1 border rounded-md outline-none"
              placeholder="4"
              required
            />
          </div>

          <div className="flex flex-col">
            <label>Location</label>
            <select
              value={car.location}
              onChange={(e) => setCar({ ...car, location: e.target.value })}
              className="px-3 py-2 mt-1 border rounded-md outline-none"
              required
            >
              <option value="">Select a location</option>
              <option value="Sangli">Sangli</option>
              <option value="Vishrambag">Vishrambag</option>
              <option value="Madhavnagar">Madhavnagar</option>
              <option value="Miraj">Miraj</option>
            </select>
          </div>
        </div>

        {/* Editable Description */}
        <div className="flex flex-col">
          <label>Description</label>
          <textarea
            rows={5}
            value={car.description}
            onChange={(e) => setCar({ ...car, description: e.target.value })}
            className="px-3 py-2 mt-1 border rounded-md outline-none"
            placeholder="e.g. A luxurious SUV with a spacious interior and powerful engine."
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-2.5 mt-4 rounded-md font-medium w-max 
          ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-primary text-white cursor-pointer"}`}
        >
          <img src={assets.tick_icon} alt="" />
          {isLoading ? (id ? "Updating..." : "Listing...") : id ? "Update Car" : "List Your Car"}
        </button>
      </form>
    </div>
  )
}

export default AddCar
