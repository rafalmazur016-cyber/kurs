import { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { archiveReport, getReports } from "@/admin/admin";

export default function AdminZgloszenia() {
	const { authFetch } = useAuth();

	const [reports, setReports] = useState([]);
	const [hideArchived, setHideArchived] = useState(true);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	async function loadReports() {
		const { data, error } = await getReports(authFetch);

		if (error) setError(error);
		else setReports(data.reports);

		setLoading(false);
	}

	useEffect(() => {
		loadReports();
	}, [authFetch]);

	async function handleArchive(id) {
		setError(null);

		const { error } = await archiveReport(authFetch, id);

		if (error) {
			setError(error);
			return;
		}

		setReports((current) =>
			current.map((r) => (r.id_zgloszenie === id ? { ...r, czy_archiwalne: 1 } : r))
		);
	}

	const visible = hideArchived ? reports.filter((r) => !r.czy_archiwalne) : reports;

	return (
		<section>
			<h2 className="text-lg font-semibold text-gray-900">Zgłoszenia</h2>
			<p className="text-gray-500">Odebrane ({visible.length})</p>

			<label className="mt-2 flex items-center justify-end gap-2 text-sm text-gray-700">
				<input
					type="checkbox"
					checked={hideArchived}
					onChange={(e) => setHideArchived(e.target.checked)}
				/>
				Ukryj archiwalne
			</label>

			{error && (
				<p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>
			)}

			{loading ? (
				<p className="mt-4 text-gray-600">Ładowanie zgłoszeń...</p>
			) : visible.length === 0 ? (
				<p className="mt-4 text-gray-600">Brak zgłoszeń.</p>
			) : (
				<div className="mt-3 flex flex-col gap-4">
					{visible.map((r) => (
						<div key={r.id_zgloszenie} className="rounded-xl border border-gray-200 p-4">
							<h3 className="text-lg font-semibold text-gray-900">{r.temat}</h3>
							<p className="mt-1 text-sm text-gray-600">{r.tresc}</p>

							{r.czy_archiwalne ? (
								<p className="mt-3 text-sm font-medium text-gray-500">Zarchiwizowane</p>
							) : (
								<button
									type="button"
									onClick={() => handleArchive(r.id_zgloszenie)}
									className="mt-3 cursor-pointer rounded-md border border-gray-400 bg-gray-100 px-3 py-1 text-sm text-gray-800 transition-colors hover:bg-gray-200"
								>
									Archiwizuj
								</button>
							)}

							<p className="mt-3 text-sm text-gray-900">
								Zgłoszone przez: {r.zglaszajacy} ({r.email}),{" "}
								{new Date(r.data_zgloszenia).toLocaleString("pl-PL")}
							</p>
						</div>
					))}
				</div>
			)}
		</section>
	);
}
