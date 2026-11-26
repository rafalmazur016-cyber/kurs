const API_URL = "/api/admin";

async function request(authFetch, path, { method = "GET" } = {}) {
	try {
		const response = await authFetch(`${API_URL}${path}`, { method });

		const data = await response.json().catch(() => ({}));

		if (!response.ok) {
			return { error: data.error || "Wystąpił błąd" };
		}

		return { data };
	} catch {
		return { error: "Nie udało się połączyć z serwerem" };
	}
}

export function getUsers(authFetch) {
	return request(authFetch, "/users");
}

export function deleteUser(authFetch, id) {
	return request(authFetch, `/users/${id}`, { method: "DELETE" });
}

export function getReports(authFetch) {
	return request(authFetch, "/reports");
}

export function archiveReport(authFetch, id) {
	return request(authFetch, `/reports/${id}/archive`, { method: "PATCH" });
}
