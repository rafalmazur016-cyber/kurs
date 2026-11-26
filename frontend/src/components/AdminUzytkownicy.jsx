import { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { deleteUser, getUsers } from "@/admin/admin";

export default function AdminUzytkownicy() {
	const { authFetch } = useAuth();

	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);

	async function loadUsers() {
		const { data, error } = await getUsers(authFetch);

		if (error) setError(error);
		else setUsers(data.users);

		setLoading(false);
	}

	useEffect(() => {
		loadUsers();
	}, [authFetch]);

	async function handleDelete(user) {
		if (!window.confirm(`Czy na pewno usunąć konto ${user.nazwa}?`)) return;

		setError(null);
		setSuccess(null);

		const { data, error } = await deleteUser(authFetch, user.id_uzytkownik);

		if (error) {
			setError(error);
			return;
		}

		setSuccess(data.message);
		setUsers((current) => current.filter((u) => u.id_uzytkownik !== user.id_uzytkownik));
	}

	return (
		<section>
			<h2 className="text-lg font-semibold text-gray-900">Użytkownicy</h2>
			<p className="text-gray-500">Zarejestrowani ({users.length})</p>

			{error && (
				<p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>
			)}
			{success && (
				<p className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">{success}</p>
			)}

			{loading ? (
				<p className="mt-4 text-gray-600">Ładowanie użytkowników...</p>
			) : (
				<div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
					<table className="w-full text-left text-sm">
						<thead className="bg-gray-50 text-gray-700">
							<tr>
								<th className="px-4 py-3 font-semibold">Nazwa</th>
								<th className="px-4 py-3 font-semibold">E-mail</th>
								<th className="px-4 py-3 font-semibold">Imię i nazwisko</th>
								<th className="px-4 py-3 font-semibold">Kursy</th>
								<th className="px-4 py-3" />
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{users.map((u) => (
								<tr key={u.id_uzytkownik}>
									<td className="px-4 py-3 font-medium text-gray-900">{u.nazwa}</td>
									<td className="px-4 py-3 text-gray-600">{u.email}</td>
									<td className="px-4 py-3 text-gray-600">
										{[u.imie, u.nazwisko].filter(Boolean).join(" ") || "–"}
									</td>
									<td className="px-4 py-3 text-gray-600">{u.ile_kursow}</td>
									<td className="px-4 py-3 text-right">
										{u.czy_admin ? (
											<span className="text-gray-500">Administrator</span>
										) : (
											<button
												type="button"
												onClick={() => handleDelete(u)}
												className="cursor-pointer font-medium text-red-600 hover:underline"
											>
												Usuń
											</button>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</section>
	);
}
