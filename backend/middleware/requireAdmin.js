export function requireAdmin(req, res, next) {
	if (!req.user?.czy_admin) {
		return res.status(403).json({ error: "Brak uprawnień" });
	}
	next();
}
