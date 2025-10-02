import express from "express";
import { submitContactForm } from "../controllers/contactController.js";

const contactRoutes = express.Router();

// POST /api/contact
contactRoutes.post("/", submitContactForm);

export default contactRoutes;
