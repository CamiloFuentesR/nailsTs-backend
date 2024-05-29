import { Router } from "express";
import { validateJWT } from "../middleware/validateJWT";
import { createCategory, getServicesCategory } from "../controllers/servicesCategory";

const router = Router();


router.get('/',validateJWT,getServicesCategory);
router.post('/',validateJWT,createCategory)
