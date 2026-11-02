import { useCallback, useEffect, useState } from 'react';
import { api, limparToken, salvarToken } from './api.js';

const produtoVazio = { nome: '', codigoDeBarras: '', quantidade: '0', preco: '', estoqueId: '' };
const dinheiro = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor));

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(event) {
    event.preventDefault();
    setErro(''); setEnviando(true);
    try { await onLogin(email, senha); }
    catch (error) { setErro(error.message); }
    finally { setEnviando(false); }
  }

  return <main className="login-page">
    <form className="login-card" onSubmit={enviar}>
      <div className="brand-mark">E</div>
      <p className="eyebrow">CONTROLE DE ESTOQUE</p>
      <h1>Entrar no sistema</h1>
      <p className="muted">Use seu e-mail e senha cadastrados pelo administrador.</p>
      <label>E-mail<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" /></label>
      <label>Senha<input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required autoComplete="current-password" /></label>
      {erro && <p className="alert error">{erro}</p>}
      <button className="button primary full" disabled={enviando}>{enviando ? 'Verificando…' : 'Entrar'}</button>
    </form>
  </main>;
}

function Resumo({ produtos, estoques }) {
  const unidades = produtos.filter((p) => p.ativo).reduce((total, p) => total + Number(p.quantidade), 0);
  const baixo = produtos.filter((p) => p.ativo && Number(p.quantidade) <= 5).length;
  return <section>
    <div className="page-heading"><div><p className="eyebrow">VISÃO GERAL</p><h1>Resumo do estoque</h1><p className="muted">Acompanhe os dados carregados da API.</p></div></div>
    <div className="metrics">
      <article className="metric"><span>Produtos listados</span><strong>{produtos.filter((p) => p.ativo).length}</strong><small>Itens ativos na consulta atual</small></article>
      <article className="metric"><span>Unidades disponíveis</span><strong>{unidades}</strong><small>Soma dos saldos carregados</small></article>
      <article className="metric"><span>Estoques ativos</span><strong>{estoques.filter((e) => e.ativo).length}</strong><small>Locais que podem receber produtos</small></article>
      <article className="metric warning"><span>Saldo baixo</span><strong>{baixo}</strong><small>Produtos com cinco unidades ou menos</small></article>
    </div>
    <article className="panel"><h2>Como os dados são carregados</h2><p>Esta tela consulta produtos e estoques autenticados. Os números refletem a consulta atual, limitada aos 100 primeiros produtos; use a busca em Produtos para localizar pelo nome ou código de barras.</p></article>
  </section>;
}

function Produtos({ itens, estoques, admin, consulta, inativos, buscar, executar }) {
  const [termo, setTermo] = useState(consulta);
  const [mostrarInativos, setMostrarInativos] = useState(inativos);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(produtoVazio);
  const [movimentos, setMovimentos] = useState({});
  const ativos = estoques.filter((e) => e.ativo);

  useEffect(() => setTermo(consulta), [consulta]);
  useEffect(() => setMostrarInativos(inativos), [inativos]);

  function editar(produto) {
    setEditando(produto.id);
    setForm({ nome: produto.nome, codigoDeBarras: produto.codigoDeBarras, quantidade: String(produto.quantidade), preco: String(produto.preco), estoqueId: produto.estoqueId });
  }

  async function salvar(event) {
    event.preventDefault();
    const dados = {
      nome: form.nome,
      codigoDeBarras: form.codigoDeBarras,
      preco: Number(form.preco),
      estoqueId: form.estoqueId,
    };
    if (!editando) dados.quantidade = Number(form.quantidade);
    const ok = await executar(
      () => api(editando ? `/produtos/${editando}` : '/produtos', { method: editando ? 'PATCH' : 'POST', body: dados }),
      editando ? 'Produto atualizado.' : 'Produto cadastrado.',
    );
    if (ok) { setEditando(null); setForm(produtoVazio); }
  }

  function mover(produto) {
    const alteracao = Number(movimentos[produto.id] ?? 1);
    if (!Number.isInteger(alteracao) || alteracao === 0) {
      window.alert('Informe um número inteiro diferente de zero. Use positivo para entrada e negativo para saída.');
      return;
    }
    executar(() => api(`/produtos/${produto.id}/estoque`, { method: 'POST', body: { alteracao } }), 'Saldo atualizado.');
  }

  return <section>
    <div className="page-heading"><div><p className="eyebrow">CATÁLOGO</p><h1>Produtos</h1><p className="muted">Pesquise, cadastre e acompanhe os saldos.</p></div></div>
    <form className="toolbar panel" onSubmit={(e) => { e.preventDefault(); buscar(termo, mostrarInativos); }}>
      <input aria-label="Buscar produto" placeholder="Nome ou código de barras" value={termo} onChange={(e) => setTermo(e.target.value)} />
      <button className="button primary">Buscar</button>
      {admin && <label className="check-label"><input type="checkbox" checked={mostrarInativos} onChange={(e) => setMostrarInativos(e.target.checked)} /> Incluir inativos</label>}
    </form>

    {admin && <form className="panel form-grid" onSubmit={salvar}>
      <div className="panel-title"><div><p className="eyebrow">{editando ? 'EDIÇÃO' : 'NOVO ITEM'}</p><h2>{editando ? 'Editar produto' : 'Cadastrar produto'}</h2></div>{editando && <button type="button" className="button ghost" onClick={() => { setEditando(null); setForm(produtoVazio); }}>Cancelar</button>}</div>
      <label>Nome<input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} minLength="2" maxLength="160" required /></label>
      <label>Código de barras<input value={form.codigoDeBarras} onChange={(e) => setForm({ ...form, codigoDeBarras: e.target.value })} maxLength="64" required /></label>
      <label>Preço (R$)<input type="number" min="0" step="0.01" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} required /></label>
      {!editando && <label>Quantidade inicial<input type="number" min="0" step="1" value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: e.target.value })} required /></label>}
      <label>Estoque<select value={form.estoqueId} onChange={(e) => setForm({ ...form, estoqueId: e.target.value })} required><option value="">Selecione</option>{ativos.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}</select></label>
      <button className="button primary" disabled={!ativos.length}>{editando ? 'Salvar alterações' : 'Cadastrar produto'}</button>
      {!ativos.length && <p className="muted">Cadastre ou ative um estoque antes de criar produtos.</p>}
    </form>}

    <div className="panel table-panel"><div className="panel-title"><h2>Itens encontrados</h2><span className="muted">{itens.length} registro(s)</span></div>
      <div className="table-scroll"><table><thead><tr><th>Produto</th><th>Código</th><th>Estoque</th><th>Saldo</th><th>Preço</th><th>Status</th><th>Ações</th></tr></thead><tbody>
        {itens.map((p) => <tr key={p.id}><td><strong>{p.nome}</strong></td><td>{p.codigoDeBarras}</td><td>{estoques.find((e) => e.id === p.estoqueId)?.nome || '—'}</td><td>{p.quantidade}</td><td>{dinheiro(p.preco)}</td><td><span className={`badge ${p.ativo ? 'success' : 'neutral'}`}>{p.ativo ? 'Ativo' : 'Inativo'}</span></td><td><div className="actions">
          {p.ativo && <><input className="delta" aria-label={`Movimento de saldo para ${p.nome}`} type="number" step="1" value={movimentos[p.id] ?? 1} onChange={(e) => setMovimentos({ ...movimentos, [p.id]: e.target.value })} /><button className="button small" onClick={() => mover(p)}>Movimentar</button></>}
          {admin && <><button className="button small ghost" onClick={() => editar(p)}>Editar</button><button className="button small ghost" onClick={() => executar(() => api(`/produtos/${p.id}/status`, { method: 'PATCH', body: { ativo: !p.ativo } }), p.ativo ? 'Produto inativado.' : 'Produto ativado.')}>{p.ativo ? 'Inativar' : 'Ativar'}</button></>}
        </div></td></tr>)}
        {!itens.length && <tr><td colSpan="7" className="empty">Nenhum produto nesta consulta.</td></tr>}
      </tbody></table></div>
    </div>
  </section>;
}

function Estoques({ itens, admin, executar }) {
  const vazio = { nome: '', descricao: '' };
  const [form, setForm] = useState(vazio);
  const [editando, setEditando] = useState(null);
  function iniciarEdicao(item) { setEditando(item.id); setForm({ nome: item.nome, descricao: item.descricao || '' }); }
  async function salvar(event) {
    event.preventDefault();
    const dados = { nome: form.nome, descricao: form.descricao || null };
    const ok = await executar(() => api(editando ? `/estoques/${editando}` : '/estoques', { method: editando ? 'PATCH' : 'POST', body: dados }), editando ? 'Estoque atualizado.' : 'Estoque cadastrado.');
    if (ok) { setForm(vazio); setEditando(null); }
  }
  return <section><div className="page-heading"><div><p className="eyebrow">LOCAIS</p><h1>Estoques</h1><p className="muted">Estoques inativos não recebem novos produtos.</p></div></div>
    {admin && <form className="panel form-grid" onSubmit={salvar}><div className="panel-title"><h2>{editando ? 'Editar estoque' : 'Novo estoque'}</h2>{editando && <button type="button" className="button ghost" onClick={() => { setEditando(null); setForm(vazio); }}>Cancelar</button>}</div>
      <label>Nome<input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} minLength="2" maxLength="120" required /></label>
      <label>Descrição<input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} maxLength="2000" /></label>
      <button className="button primary">{editando ? 'Salvar alterações' : 'Cadastrar estoque'}</button>
    </form>}
    <div className="panel table-panel"><div className="panel-title"><h2>Locais cadastrados</h2><span className="muted">{itens.length} registro(s)</span></div><div className="table-scroll"><table><thead><tr><th>Nome</th><th>Descrição</th><th>Status</th>{admin && <th>Ações</th>}</tr></thead><tbody>
      {itens.map((e) => <tr key={e.id}><td><strong>{e.nome}</strong></td><td>{e.descricao || '—'}</td><td><span className={`badge ${e.ativo ? 'success' : 'neutral'}`}>{e.ativo ? 'Ativo' : 'Inativo'}</span></td>{admin && <td><div className="actions"><button className="button small ghost" onClick={() => iniciarEdicao(e)}>Editar</button><button className="button small ghost" onClick={() => executar(() => api(`/estoques/${e.id}/status`, { method: 'PATCH', body: { ativo: !e.ativo } }), e.ativo ? 'Estoque inativado.' : 'Estoque ativado.')}>{e.ativo ? 'Inativar' : 'Ativar'}</button></div></td>}</tr>)}
      {!itens.length && <tr><td colSpan={admin ? '4' : '3'} className="empty">Nenhum estoque cadastrado.</td></tr>}
    </tbody></table></div></div>
  </section>;
}

function Usuarios({ itens, usuarioAtual, executar }) {
  const vazio = { nome: '', email: '', senha: '', perfil: 'operador' };
  const [form, setForm] = useState(vazio);
  const [editando, setEditando] = useState(null);
  const [erroLocal, setErroLocal] = useState('');
  function iniciarEdicao(u) { setEditando(u.id); setForm({ nome: u.nome, email: u.email, senha: '', perfil: u.perfil }); setErroLocal(''); }
  async function salvar(event) {
    event.preventDefault(); setErroLocal('');
    if (!editando && form.senha.length < 10) { setErroLocal('A senha precisa ter pelo menos 10 caracteres.'); return; }
    const dados = { nome: form.nome, email: form.email, perfil: form.perfil };
    if (form.senha) dados.senha = form.senha;
    const ok = await executar(() => api(editando ? `/usuarios/${editando}` : '/usuarios', { method: editando ? 'PATCH' : 'POST', body: dados }), editando ? 'Usuário atualizado.' : 'Usuário criado.');
    if (ok) { setForm(vazio); setEditando(null); }
  }
  return <section><div className="page-heading"><div><p className="eyebrow">ACESSO</p><h1>Usuários</h1><p className="muted">Área restrita ao perfil admin.</p></div></div>
    <form className="panel form-grid" onSubmit={salvar}><div className="panel-title"><h2>{editando ? 'Editar usuário' : 'Cadastrar usuário'}</h2>{editando && <button type="button" className="button ghost" onClick={() => { setEditando(null); setForm(vazio); }}>Cancelar</button>}</div>
      <label>Nome<input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} minLength="2" maxLength="120" required /></label>
      <label>E-mail<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
      <label>Senha <small>{editando ? '(vazia mantém a atual)' : '(10+ caracteres, maiúscula, minúscula e número)'}</small><input type="password" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} minLength="10" pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{10,72}" autoComplete="new-password" required={!editando} /></label>
      <label>Perfil<select value={form.perfil} onChange={(e) => setForm({ ...form, perfil: e.target.value })}><option value="operador">Operador</option><option value="admin">Admin</option></select></label>
      {erroLocal && <p className="alert error">{erroLocal}</p>}<button className="button primary">{editando ? 'Salvar usuário' : 'Criar usuário'}</button>
    </form>
    <div className="panel table-panel"><div className="panel-title"><h2>Contas cadastradas</h2><span className="muted">{itens.length} registro(s)</span></div><div className="table-scroll"><table><thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Status</th><th>Ações</th></tr></thead><tbody>
      {itens.map((u) => <tr key={u.id}><td><strong>{u.nome}</strong></td><td>{u.email}</td><td>{u.perfil}</td><td><span className={`badge ${u.ativo ? 'success' : 'neutral'}`}>{u.ativo ? 'Ativo' : 'Inativo'}</span></td><td><div className="actions"><button className="button small ghost" onClick={() => iniciarEdicao(u)}>Editar</button><button className="button small ghost" disabled={u.id === usuarioAtual.id && u.ativo} onClick={() => executar(() => api(`/usuarios/${u.id}/status`, { method: 'PATCH', body: { ativo: !u.ativo } }), u.ativo ? 'Usuário inativado.' : 'Usuário ativado.')}>{u.ativo ? 'Inativar' : 'Ativar'}</button></div></td></tr>)}
      {!itens.length && <tr><td colSpan="5" className="empty">Nenhum usuário cadastrado.</td></tr>}
    </tbody></table></div></div>
  </section>;
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('tcc26_token'));
  const [usuario, setUsuario] = useState(null);
  const [pagina, setPagina] = useState('inicio');
  const [dados, setDados] = useState({ produtos: [], estoques: [], usuarios: [] });
  const [consulta, setConsulta] = useState('');
  const [incluirInativos, setIncluirInativos] = useState(false);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [carregandoAuth, setCarregandoAuth] = useState(Boolean(token));
  const [carregandoDados, setCarregandoDados] = useState(false);
  const admin = usuario?.perfil === 'admin';

  const sair = useCallback(() => {
    limparToken(); setToken(null); setUsuario(null);
    setDados({ produtos: [], estoques: [], usuarios: [] });
    setPagina('inicio');
  }, []);

  useEffect(() => {
    if (!token) { setCarregandoAuth(false); return undefined; }
    let ativo = true;
    api('/auth/me').then((res) => { if (ativo) setUsuario(res.usuario); })
      .catch((error) => {
        if (!ativo) return;
        if (error.status === 401) sair();
        else setErro(error.message);
      })
      .finally(() => { if (ativo) setCarregandoAuth(false); });
    return () => { ativo = false; };
  }, [token, sair]);

  const carregar = useCallback(async (q = '', inativos = false) => {
    if (!usuario) return;
    setCarregandoDados(true); setErro('');
    try {
      const busca = new URLSearchParams({ limit: '100', offset: '0', inativos: inativos ? 'true' : 'false' });
      if (q.trim()) busca.set('q', q.trim());
      const [p, e, u] = await Promise.all([
        api(`/produtos?${busca.toString()}`),
        api('/estoques'),
        admin ? api('/usuarios') : Promise.resolve({ data: [] }),
      ]);
      setDados({ produtos: p.data, estoques: e.data, usuarios: u.data });
    } catch (error) {
      if (error.status === 401) sair();
      else setErro(error.message);
    } finally { setCarregandoDados(false); }
  }, [usuario, admin, sair]);

  useEffect(() => { if (usuario) carregar().catch((error) => setErro(error.message)); }, [usuario, carregar]);

  async function login(email, senha) {
    const res = await api('/auth/login', { method: 'POST', body: { email, senha } });
    salvarToken(res.token); setToken(res.token); setUsuario(res.usuario); setPagina('inicio');
  }

  async function executar(acao, sucesso) {
    setErro(''); setAviso('');
    try {
      await acao(); setAviso(sucesso);
      await carregar(consulta, incluirInativos);
      return true;
    } catch (error) {
      if (error.status === 401) sair();
      else setErro(error.message);
      return false;
    }
  }

  function buscarProdutos(q, inativos) {
    setConsulta(q); setIncluirInativos(inativos);
    carregar(q, inativos);
  }

  if (!token) return <Login onLogin={login} />;
  if (carregandoAuth || !usuario) return <main className="loading">Validando sua sessão…</main>;

  const menu = [['inicio', 'Resumo'], ['produtos', 'Produtos'], ['estoques', 'Estoques'], ...(admin ? [['usuarios', 'Usuários']] : [])];
  return <div className="app-shell">
    <aside className="sidebar"><div className="brand"><span className="brand-mark">E</span><div><strong>Estoque</strong><small>PAINEL DE CONTROLE</small></div></div>
      <nav>{menu.map(([id, nome]) => <button key={id} className={pagina === id ? 'nav-item active' : 'nav-item'} onClick={() => setPagina(id)}>{nome}</button>)}</nav>
      <div className="sidebar-footer"><span className="avatar">{usuario.nome.slice(0, 1).toUpperCase()}</span><div><strong>{usuario.nome}</strong><small>{usuario.perfil}</small></div></div>
    </aside>
    <main className="main-area"><header className="topbar"><div><p className="eyebrow">SISTEMA DE ESTOQUE</p><h1>{menu.find(([id]) => id === pagina)?.[1]}</h1></div><button className="button ghost" onClick={sair}>Sair</button></header>
      {erro && <p className="alert error" role="alert">{erro}</p>}
      {aviso && <p className="alert success" role="status">{aviso}</p>}
      {carregandoDados && <p className="muted">Atualizando informações…</p>}
      {pagina === 'inicio' && <Resumo produtos={dados.produtos} estoques={dados.estoques} />}
      {pagina === 'produtos' && <Produtos itens={dados.produtos} estoques={dados.estoques} admin={admin} consulta={consulta} inativos={incluirInativos} buscar={buscarProdutos} executar={executar} />}
      {pagina === 'estoques' && <Estoques itens={dados.estoques} admin={admin} executar={executar} />}
      {pagina === 'usuarios' && admin && <Usuarios itens={dados.usuarios} usuarioAtual={usuario} executar={executar} />}
      <footer className="footer">TCC26 · Painel interno de controle de estoque</footer>
    </main>
  </div>;
}

