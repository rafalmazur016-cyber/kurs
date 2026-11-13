import { query, queryOne } from './pool.js';

export async function listCourses({ limit = 50, offset = 0 } = {}) {
  return query(
    `SELECT k.id_kurs, k.nazwa, k.data_utworzenia, k.obraz_podgladu,
            kat.nazwa AS kategoria, u.nazwa AS autor
     FROM kursy k
     JOIN kategorie_kursow kat ON kat.id_kategoria_kursu = k.id_kategoria_kursu
     JOIN uzytkownicy u ON u.id_uzytkownik = k.autor
     ORDER BY k.data_utworzenia DESC
     LIMIT :limit OFFSET :offset`,
    { limit, offset }
  );
}

export async function getCourseById(id) {
  return queryOne(
    `SELECT k.id_kurs, k.nazwa, k.data_utworzenia, k.obraz_podgladu,
            k.id_kategoria_kursu, kat.nazwa AS kategoria,
            k.autor, u.nazwa AS autor_nazwa
     FROM kursy k
     JOIN kategorie_kursow kat ON kat.id_kategoria_kursu = k.id_kategoria_kursu
     JOIN uzytkownicy u ON u.id_uzytkownik = k.autor
     WHERE k.id_kurs = :id`,
    { id }
  );
}

export async function listCategories() {
  return query(
    `SELECT id_kategoria_kursu, nazwa
     FROM kategorie_kursow
     ORDER BY nazwa`
  );
}

export async function listCoursesByCategory(idKategoria) {
  return query(
    `SELECT k.id_kurs, k.nazwa, k.data_utworzenia, k.obraz_podgladu, u.nazwa AS autor
     FROM kursy k
     JOIN uzytkownicy u ON u.id_uzytkownik = k.autor
     WHERE k.id_kategoria_kursu = :idKategoria
     ORDER BY k.data_utworzenia DESC`,
    { idKategoria }
  );
}

export async function listCoursesByAuthor(idAutor) {
  return query(
    `SELECT k.id_kurs, k.nazwa, k.data_utworzenia, k.obraz_podgladu,
            kat.nazwa AS kategoria
     FROM kursy k
     JOIN kategorie_kursow kat ON kat.id_kategoria_kursu = k.id_kategoria_kursu
     WHERE k.autor = :idAutor
     ORDER BY k.data_utworzenia DESC`,
    { idAutor }
  );
}

export async function searchCourses(searchTerm) {
  return query(
    `SELECT k.id_kurs, k.nazwa, k.data_utworzenia, k.obraz_podgladu,
            kat.nazwa AS kategoria, u.nazwa AS autor
     FROM kursy k
     JOIN kategorie_kursow kat ON kat.id_kategoria_kursu = k.id_kategoria_kursu
     JOIN uzytkownicy u ON u.id_uzytkownik = k.autor
     WHERE k.nazwa LIKE :term
     ORDER BY k.nazwa`,
    { term: `%${searchTerm}%` }
  );
}

const CATALOG_SORT = {
  najnowsze: 'k.data_utworzenia DESC',
  najstarsze: 'k.data_utworzenia ASC',
  popularne: 'ile_zapisow DESC, k.data_utworzenia DESC',
  nazwa: 'k.nazwa ASC'
};

export async function listCatalog({ search = '', idKategoria = null, sort = 'najnowsze' } = {}) {
  const orderBy = CATALOG_SORT[sort] ?? CATALOG_SORT.najnowsze;

  return query(
    `SELECT k.id_kurs, k.nazwa, k.data_utworzenia, k.obraz_podgladu,
            k.id_kategoria_kursu, kat.nazwa AS kategoria, u.nazwa AS autor,
            COUNT(uk.id_uzytkownik) AS ile_zapisow
     FROM kursy k
     JOIN kategorie_kursow kat ON kat.id_kategoria_kursu = k.id_kategoria_kursu
     JOIN uzytkownicy u ON u.id_uzytkownik = k.autor
     LEFT JOIN uzytkownicy_kursy uk ON uk.id_kurs = k.id_kurs
     WHERE k.nazwa LIKE :term
       AND (:idKategoria IS NULL OR k.id_kategoria_kursu = :idKategoria)
     GROUP BY k.id_kurs, k.nazwa, k.data_utworzenia, k.obraz_podgladu,
              k.id_kategoria_kursu, kat.nazwa, u.nazwa
     ORDER BY ${orderBy}`,
    { term: `%${search}%`, idKategoria }
  );
}

export async function createCategory(nazwa) {
  const result = await query(
    `INSERT INTO kategorie_kursow (nazwa) VALUES (:nazwa)`,
    { nazwa }
  );

  return { id_kategoria_kursu: result.insertId, nazwa };
}

export async function updateCategory(id, nazwa) {
  const result = await query(
    `UPDATE kategorie_kursow
     SET nazwa = :nazwa
     WHERE id_kategoria_kursu = :id`,
    { id, nazwa }
  );

  return result.affectedRows > 0;
}

export async function deleteCategory(id) {
  const result = await query(
    `DELETE FROM kategorie_kursow
     WHERE id_kategoria_kursu = :id`,
    { id }
  );

  return result.affectedRows > 0;
}
