import { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import {
	createCategory,
	deleteCategory,
	getCategories,
	updateCategory,
} from "@/catalog/catalog";

const inputClass =
	"w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function KategorieKursow() {
	const { authFetch } = useAuth();

	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);
	const [newName, setNewName] = useState("");
	const [editId, setEditId] = useState(null);
	const [editName, setEditName] = useState("");
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);

	async function loadCategories() {
		const { data, error } = await getCategories(authFetch);

		if (error) setError(error);
		else setCategories(data.categories);

		setLoading(false);
	}

	useEffect(() => {
		loadCategories();
	}, [authFetch]);

	async function runAction(action) {
		setError(null);
		setSuccess(null);

		const { data, error } = await action();

		if (error) {
			setError(error);
			return false;
		}

		setSuccess(data.message);
		await loadCategories();
		return true;
	}

	async function handleAdd(event) {
		event.preventDefault();

		if (!newName.trim()) {
			setError("Podaj nazwę kategorii");
			return;
		}

		if (await runAction(() => createCategory(authFetch, newName))) {
			setNewName("");
		}
	}

	async function handleSave(id) {
		if (await runAction(() => updateCategory(authFetch, id, editName))) {
			setEditId(null);
		}
	}

	function handleDelete(id) {
		if (!window.confirm("Czy na pewno usunąć kategorię?")) return;
		runAction(() => deleteCategory(authFetch, id));
	}

	return (
		<section className="rounded-xl border border-gray-200 p-6">
			<h2 className="text-lg font-semibold text-gray-900">Kategorie kursów</h2>

			{error && (
				<p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>
			)}
			{success && (
				<p className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">{success}</p>
			)}

			<form onSubmit={handleAdd} className="mt-4 flex gap-2">
				<input
					type="text"
					value={newName}
					onChange={(e) => setNewName(e.target.value)}
					placeholder="Nazwa nowej kategorii"
					maxLength={45}
					className={inputClass}
				/>
				<button
					type="submit"
					className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
				>
					Dodaj
				</button>
			</form>

			{loading ? (
				<p className="mt-4 text-gray-600">Ładowanie kategorii...</p>
			) : (
				<ul className="mt-4 divide-y divide-gray-200">
					{categories.map((c) => (
						<li key={c.id_kategoria_kursu} className="flex items-center gap-2 py-2">
							{editId === c.id_kategoria_kursu ? (
								<>
									<input
										type="text"
										value={editName}
										onChange={(e) => setEditName(e.target.value)}
										maxLength={45}
										className={inputClass}
									/>
									<button
										type="button"
										onClick={() => handleSave(c.id_kategoria_kursu)}
										className="cursor-pointer text-sm font-medium text-blue-600 hover:underline"
									>
										Zapisz
									</button>
									<button
										type="button"
										onClick={() => setEditId(null)}
										className="cursor-pointer text-sm font-medium text-gray-600 hover:underline"
									>
										Anuluj
									</button>
								</>
							) : (
								<>
									<span className="flex-1 text-gray-900">{c.nazwa}</span>
									<button
										type="button"
										onClick={() => {
											setEditId(c.id_kategoria_kursu);
											setEditName(c.nazwa);
										}}
										className="cursor-pointer text-sm font-medium text-blue-600 hover:underline"
									>
										Edytuj
									</button>
									<button
										type="button"
										onClick={() => handleDelete(c.id_kategoria_kursu)}
										className="cursor-pointer text-sm font-medium text-red-600 hover:underline"
									>
										Usuń
									</button>
								</>
							)}
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
