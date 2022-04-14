import { Router } from "express";

import EmailController from "../controllers/EmailController.js";

function EmailRoute() {

    const router = Router();

    router.post("/", EmailController.sendEmail)

    return router;
}
export default EmailRoute;
