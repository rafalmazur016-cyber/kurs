async function request(authFetch, url, { method = "GET", body } = {}) {
	try {
		const response = await authFetch(url, {
			method,
			headers: body ? { "Content-Type": "application/json" } : undefined,
			body: body ? JSON.stringify(body) : undefined,
		});

		const data = await response.json().catch(() => ({}));

		if (!response.ok) {
			return { error: data.error || "Wystąpił błąd" };
		}

		return { data };
	} catch {
		return { error: "Nie udało się połączyć z serwerem" };
	}
}

export function getCourses(authFetch, { search, category, sort }) {
	const params = new URLSearchParams({ search, category, sort });
	return request(authFetch, `/api/courses?${params}`);
}

export function getEnrolledIds(authFetch) {
	return request(authFetch, "/api/courses/enrolled");
}

export function enroll(authFetch, idKurs) {
	return request(authFetch, `/api/courses/${idKurs}/enroll`, { method: "POST" });
}

export function getCategories(authFetch) {
	return request(authFetch, "/api/categories");
}

export function createCategory(authFetch, nazwa) {
	return request(authFetch, "/api/categories", { method: "POST", body: { nazwa } });
}

export function updateCategory(authFetch, id, nazwa) {
	return request(authFetch, `/api/categories/${id}`, { method: "PUT", body: { nazwa } });
}

export function deleteCategory(authFetch, id) {
	return request(authFetch, `/api/categories/${id}`, { method: "DELETE" });
}
