import express from "express";
import { getAllContacts, submitContactForm } from "../controllers/contactController.js";

const contactRoutes = express.Router();

// POST /api/contact
contactRoutes.post("/", submitContactForm);

// GET /api/contact/admin/contacts - For admin to view all contacts
contactRoutes.get("/admin/contacts", getAllContacts);

export default contactRoutes;