import { useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import AdminZgloszenia from "@/components/AdminZgloszenia";
import AdminUzytkownicy from "@/components/AdminUzytkownicy";
import KategorieKursow from "@/components/KategorieKursow";

const SECTIONS = [
	["zgloszenia", "Zgłoszenia"],
	["uzytkownicy", "Użytkownicy"],
	["kursy", "Przegląd kursów"],
	["kategorie", "Kategorie kursów"],
];

export default function Admin() {
	const { logout } = useAuth();
	const [section, setSection] = useState("zgloszenia");

	return (
		<div className="flex min-h-screen bg-white">
			<aside className="flex w-56 shrink-0 flex-col bg-gray-100 px-3 py-6">
				<h1 className="text-center text-2xl font-semibold text-gray-900">
					Administrator
				</h1>

				<nav className="mt-8 flex flex-col gap-1">
					{SECTIONS.map(([key, label]) => (
						<button
							key={key}
							type="button"
							onClick={() => setSection(key)}
							className={
								section === key
									? "cursor-pointer rounded-md border border-gray-400 bg-white px-3 py-2 text-left text-sm font-semibold text-gray-900"
									: "cursor-pointer rounded-md border border-transparent px-3 py-2 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200"
							}
						>
							{label}
						</button>
					))}
				</nav>

				<button
					type="button"
					onClick={logout}
					className="mx-auto mt-auto cursor-pointer rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
				>
					Wyloguj się
				</button>
			</aside>

			<main className="flex-1 px-8 py-10">
				<div className="mx-auto max-w-4xl">
					{section === "zgloszenia" && <AdminZgloszenia />}
					{section === "uzytkownicy" && <AdminUzytkownicy />}
					{section === "kursy" && (
						<>
							<h2 className="text-lg font-semibold text-gray-900">Przegląd kursów</h2>
							<p className="mt-2 text-gray-600">Ta sekcja jest w przygotowaniu.</p>
						</>
					)}
					{section === "kategorie" && <KategorieKursow />}
				</div>
			</main>
		</div>
	);
}
