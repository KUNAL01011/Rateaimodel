import { Router } from "express";
import routes from "./v1";
const router = Router();

router.use("/v1", routes);

export default router;
