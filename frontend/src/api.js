const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');
const TOKEN_KEY = 'tcc26_token';
 
export function salvarToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
 
export function limparToken() {
  localStorage.removeItem(TOKEN_KEY);
}
 
export async function api(path, { body, headers = {}, ...options } = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
 
  const text = await response.text();
  let resultado = null;
  if (text) {
    try { resultado = JSON.parse(text); }
    catch { resultado = { error: text }; }
  }
  if (!response.ok) {
    const detalhes = resultado?.details?.map((item) => `${item.field}: ${item.message}`).join(' · ');
    const mensagem = detalhes ? `${resultado.error} ${detalhes}` : (resultado?.error || `Erro HTTP ${response.status}`);
    const erro = new Error(mensagem);
    erro.status = response.status;
    throw erro;
  }
  return resultado;
}
