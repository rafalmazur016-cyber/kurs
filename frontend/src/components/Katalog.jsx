import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/auth/AuthContext";
import { enroll, getCategories, getCourses, getEnrolledIds } from "@/catalog/catalog";

const inputClass =
	"w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const SORT_OPTIONS = [
	["najnowsze", "Najnowsze"],
	["najstarsze", "Najstarsze"],
	["popularne", "Najwięcej zapisanych"],
	["nazwa", "Nazwa (A-Z)"],
];

function CourseCard({ course, enrolled, canEnroll, pending, onEnroll }) {
	return (
		<div className="flex flex-col rounded-xl border border-gray-200 p-4">
			{course.obraz_podgladu ? (
				<img
					src={`/uploads/${course.obraz_podgladu}`}
					alt={course.nazwa}
					className="aspect-video w-full rounded-md object-cover"
				/>
			) : (
				<div className="aspect-video w-full rounded-md bg-gray-200" />
			)}

			<p className="mt-3 text-sm text-gray-600">{course.kategoria}</p>
			<h2 className="font-semibold text-gray-900">{course.nazwa}</h2>
			<p className="mt-1 text-xs text-gray-500">
				Zapisanych: {course.ile_zapisow}
			</p>

			{canEnroll && (
				<button
					type="button"
					onClick={() => onEnroll(course.id_kurs)}
					disabled={enrolled || pending}
					className="mt-4 cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
				>
					{enrolled ? "Zapisano" : pending ? "Zapisywanie..." : "Zapisz się"}
				</button>
			)}
		</div>
	);
}

export default function Katalog() {
	const { user, authFetch } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	const [courses, setCourses] = useState([]);
	const [categories, setCategories] = useState([]);
	const [enrolledIds, setEnrolledIds] = useState([]);

	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState("");
	const [sort, setSort] = useState("najnowsze");
	const [showFilters, setShowFilters] = useState(false);

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [message, setMessage] = useState(null);
	const [pendingId, setPendingId] = useState(null);

	useEffect(() => {
		getCategories(authFetch).then(({ data }) => {
			if (data) setCategories(data.categories);
		});
	}, [authFetch]);

	useEffect(() => {
		if (!user || user.isAdmin) return;

		getEnrolledIds(authFetch).then(({ data }) => {
			if (data) setEnrolledIds(data.ids);
		});
	}, [user, authFetch]);

	useEffect(() => {
		let active = true;
		setLoading(true);

		(async () => {
			const { data, error } = await getCourses(authFetch, { search, category, sort });

			if (!active) return;

			if (error) {
				setError(error);
			} else {
				setError(null);
				setCourses(data.courses);
			}

			setLoading(false);
		})();

		return () => {
			active = false;
		};
	}, [authFetch, search, category, sort]);

	function handleSearch(event) {
		event.preventDefault();
		setSearch(searchInput.trim());
	}

	async function handleEnroll(idKurs) {
		if (!user) {
			navigate("/logowanie", { state: { from: location } });
			return;
		}

		setMessage(null);
		setPendingId(idKurs);

		const { data, error } = await enroll(authFetch, idKurs);

		setPendingId(null);

		if (error) {
			setMessage({ type: "error", text: error });
			return;
		}

		setEnrolledIds((current) => [...current, idKurs]);
		setCourses((current) =>
			current.map((c) =>
				c.id_kurs === idKurs ? { ...c, ile_zapisow: c.ile_zapisow + 1 } : c
			)
		);
		setMessage({ type: "success", text: data.message });
	}

	return (
		<div className="min-h-screen bg-white">
			<Navbar />

			<main className="mx-auto max-w-5xl px-4 py-8">
				<div className="flex flex-wrap items-center gap-4">
					<button
						type="button"
						onClick={() => setShowFilters((current) => !current)}
						className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
					>
						Filtruj
					</button>

					<form onSubmit={handleSearch} className="flex flex-1 gap-2">
						<input
							type="text"
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							placeholder="Wyszukaj kurs"
							className={inputClass}
						/>
						<button
							type="submit"
							className="cursor-pointer rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:border-blue-500 hover:text-blue-600"
						>
							Szukaj
						</button>
					</form>
				</div>

				{showFilters && (
					<div className="mt-4 grid gap-4 rounded-xl border border-gray-200 p-4 sm:grid-cols-2">
						<div>
							<label className="mb-1 block text-sm font-medium text-gray-700">
								Kategoria
							</label>
							<select
								value={category}
								onChange={(e) => setCategory(e.target.value)}
								className={inputClass}
							>
								<option value="">Wszystkie</option>
								{categories.map((c) => (
									<option key={c.id_kategoria_kursu} value={c.id_kategoria_kursu}>
										{c.nazwa}
									</option>
								))}
							</select>
						</div>

						<div>
							<label className="mb-1 block text-sm font-medium text-gray-700">
								Sortuj według
							</label>
							<select
								value={sort}
								onChange={(e) => setSort(e.target.value)}
								className={inputClass}
							>
								{SORT_OPTIONS.map(([value, label]) => (
									<option key={value} value={value}>
										{label}
									</option>
								))}
							</select>
						</div>
					</div>
				)}

				<h1 className="mt-8 text-2xl font-semibold text-gray-900">
					Dostępne kursy ({courses.length})
				</h1>

				{message && (
					<p
						className={
							message.type === "error"
								? "mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600"
								: "mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700"
						}
					>
						{message.text}
					</p>
				)}

				{error && (
					<p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>
				)}

				{loading ? (
					<div className="mt-12 flex justify-center">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
					</div>
				) : courses.length === 0 ? (
					<p className="mt-4 text-gray-600">Nie znaleziono kursów.</p>
				) : (
					<div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
						{courses.map((course) => (
							<CourseCard
								key={course.id_kurs}
								course={course}
								enrolled={enrolledIds.includes(course.id_kurs)}
								canEnroll={!user?.isAdmin}
								pending={pendingId === course.id_kurs}
								onEnroll={handleEnroll}
							/>
						))}
					</div>
				)}
			</main>
		</div>
	);
}
