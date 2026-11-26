import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { getUserById, listAllUsers } from "../db/users.js";
import { archiveReport, listAllReports } from "../db/reports.js";
import { deleteAccount } from "../services/account.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/users", asyncHandler(async (_req, res) => {
	res.status(200).json({ users: await listAllUsers() });
}));

router.delete("/users/:id", asyncHandler(async (req, res) => {
	const user = await getUserById(Number(req.params.id));
	if (!user) {
		return res.status(404).json({ error: "Użytkownik nie istnieje" });
	}
	if (user.czy_admin) {
		return res.status(403).json({ error: "Nie można usunąć konta administratora" });
	}

	const result = await deleteAccount(user);
	if (result.error === "HAS_COURSES") {
		return res.status(409).json({ error: "Nie można usunąć konta, ponieważ jest powiązane z kursami" });
	}

	res.status(200).json({ message: "Konto użytkownika zostało usunięte" });
}));

router.get("/reports", asyncHandler(async (_req, res) => {
	res.status(200).json({ reports: await listAllReports() });
}));

router.patch("/reports/:id/archive", asyncHandler(async (req, res) => {
	if (!(await archiveReport(Number(req.params.id)))) {
		return res.status(404).json({ error: "Zgłoszenie nie istnieje" });
	}

	res.status(200).json({ message: "Zgłoszenie zostało zarchiwizowane" });
}));

export default router;
