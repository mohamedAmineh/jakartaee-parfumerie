import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/perfumes`;

export const fetchPerfumes = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error('Erreur lors du chargement');
  return await response.json();
};

export const fetchPerfumeById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) throw new Error('Parfum non trouvé');
  return await response.json();
};
