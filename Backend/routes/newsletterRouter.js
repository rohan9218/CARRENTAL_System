import express from "express";
import { getSubscribers, subscribeNewsletter } from "../controllers/newsletterController.js";

const newsletterRouter = express.Router();

newsletterRouter.post("/subscribe", subscribeNewsletter);
newsletterRouter.get("/subscribers", getSubscribers); // optional: only for admin

export default newsletterRouter;
