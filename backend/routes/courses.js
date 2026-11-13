import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { getCourseById, listCatalog } from "../db/courses.js";
import { createEnrollment, listEnrollmentsByUser } from "../db/enrollments.js";

const router = Router();

router.get("/", asyncHandler(async (req, res) => {
	const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
	const idKategoria = Number(req.query.category) || null;
	const sort = typeof req.query.sort === "string" ? req.query.sort : "najnowsze";

	const courses = await listCatalog({ search, idKategoria, sort });

	res.status(200).json({ courses });
}));

router.get("/enrolled", requireAuth, asyncHandler(async (req, res) => {
	const enrollments = await listEnrollmentsByUser(req.user.id_uzytkownik);

	res.status(200).json({ ids: enrollments.map((e) => e.id_kurs) });
}));

router.post("/:id/enroll", requireAuth, asyncHandler(async (req, res) => {
	if (req.user.czy_admin) {
		return res.status(403).json({ error: "Administrator nie może zapisywać się na kursy" });
	}

	const course = await getCourseById(Number(req.params.id));
	if (!course) {
		return res.status(404).json({ error: "Kurs nie istnieje" });
	}

	try {
		await createEnrollment(req.user.id_uzytkownik, course.id_kurs);
	} catch (err) {
		if (err.code === "ER_DUP_ENTRY") {
			return res.status(409).json({ error: "Jesteś już zapisany na ten kurs" });
		}
		throw err;
	}

	res.status(201).json({ message: "Zapisano na kurs" });
}));

export default router;
