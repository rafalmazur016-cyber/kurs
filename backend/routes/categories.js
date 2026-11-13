import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
	createCategory,
	deleteCategory,
	listCategories,
	updateCategory
} from "../db/courses.js";

const router = Router();

const NAME_MAX = 45;

function parseName(body) {
	const { nazwa } = body ?? {};

	if (typeof nazwa !== "string" || !nazwa.trim()) {
		return { error: "Podaj nazwę kategorii" };
	}
	if (nazwa.trim().length > NAME_MAX) {
		return { error: `Nazwa kategorii może mieć maksymalnie ${NAME_MAX} znaków` };
	}
	return { nazwa: nazwa.trim() };
}

router.get("/", asyncHandler(async (_req, res) => {
	res.status(200).json({ categories: await listCategories() });
}));

router.use(requireAuth, requireAdmin);

router.post("/", asyncHandler(async (req, res) => {
	const { error, nazwa } = parseName(req.body);
	if (error) {
		return res.status(400).json({ error });
	}

	try {
		const category = await createCategory(nazwa);
		res.status(201).json({ message: "Kategoria została dodana", category });
	} catch (err) {
		if (err.code === "ER_DUP_ENTRY") {
			return res.status(409).json({ error: "Kategoria o tej nazwie już istnieje" });
		}
		throw err;
	}
}));

router.put("/:id", asyncHandler(async (req, res) => {
	const { error, nazwa } = parseName(req.body);
	if (error) {
		return res.status(400).json({ error });
	}

	try {
		if (!(await updateCategory(Number(req.params.id), nazwa))) {
			return res.status(404).json({ error: "Kategoria nie istnieje" });
		}
	} catch (err) {
		if (err.code === "ER_DUP_ENTRY") {
			return res.status(409).json({ error: "Kategoria o tej nazwie już istnieje" });
		}
		throw err;
	}

	res.status(200).json({ message: "Kategoria została zmieniona" });
}));

router.delete("/:id", asyncHandler(async (req, res) => {
	try {
		if (!(await deleteCategory(Number(req.params.id)))) {
			return res.status(404).json({ error: "Kategoria nie istnieje" });
		}
	} catch (err) {
		if (err.code === "ER_ROW_IS_REFERENCED_2" || err.code === "ER_ROW_IS_REFERENCED") {
			return res.status(409).json({ error: "Nie można usunąć kategorii, do której przypisane są kursy" });
		}
		throw err;
	}

	res.status(200).json({ message: "Kategoria została usunięta" });
}));

export default router;
