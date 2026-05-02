import { Router, type IRouter } from "express";
import healthRouter from "./health";
import conversationsRouter from "./conversations";
import chatRouter from "./chat";
import webhooksRouter from "./webhooks";
import integrationsRouter from "./integrations";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/conversations", conversationsRouter);
router.use("/chat", chatRouter);
router.use("/webhooks", webhooksRouter);
router.use("/integrations", integrationsRouter);

export default router;
