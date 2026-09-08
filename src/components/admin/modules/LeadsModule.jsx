import React, { useState, useEffect, useCallback } from "react";
import {
  UserCheck, Plus, MessageCircle, ArrowRight,
  X, Check, Trash2, Phone, Mail, DollarSign, FileText, RefreshCw, Loader2
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { supabase, isSupabaseConfigured } from "../../../lib/supabaseClient";

// ─── Mapeamento de campos Supabase → estado local ────────────────────────────
// Colunas esperadas na tabela "leads":
//   id, nome, servico, telefone, email, origem, valor_estimado, etapa, criado_em, observacoes
const mapRow = (row) => ({
  id: row.id,
  name: row.nome ?? "",
  service: row.servico ?? "",
  phone: row.telefone ?? "",
  email: row.email ?? "",
  source: row.origem ?? "",
  estimatedValue: row.valor_estimado ?? "",
  stage: row.etapa ?? "novo",
  date: row.criado_em
    ? new Date(row.criado_em).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
    : "",
  notes: row.observacoes ?? "",
});

const EMPTY_FORM = {
  name: "",
  service: "",
  phone: "",
  email: "",
  estimatedValue: "",
  notes: "",
  stage: "novo",
  source: "Manual",
};

export default function LeadsModule() {
  const { logActivity } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newLead, setNewLead] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Carregar leads com sincronização híbrida (Supabase + Site Submissions) ──
  const SEED_LEADS = [
    {
      id: "lead_01",
      name: "Camila Mendonça",
      service: "Retratos Pessoais & Branding",
      phone: "(21) 99123-4567",
      email: "camila.mendonca@gmail.com",
      source: "Formulário do Site",
      estimatedValue: "R$ 2.800,00",
      stage: "novo",
      date: "Hoje, 14:20",
      notes: "Solicitou ensaio ao ar livre na Urca ou Copacabana."
    },
    {
      id: "lead_02",
      name: "Diretoria Hospital Copa D'Or",
      service: "Fotos Corporativas Equipe Médica",
      phone: "(21) 98877-1122",
      email: "rh@copador.com.br",
      source: "WhatsApp Direto",
      estimatedValue: "R$ 7.500,00",
      stage: "contato",
      date: "Hoje, 11:15",
      notes: "Precisam de fotos de 15 médicos especialistas para o anuário."
    },
    {
      id: "lead_03",
      name: "Restaurante Fogo & Brasa Barra",
      service: "Gastronomia & Vídeo Reels",
      phone: "(21) 97766-3344",
      email: "gerencia@fogoebasa.com",
      source: "Instagram",
      estimatedValue: "R$ 3.900,00",
      stage: "proposta",
      date: "Ontem",
      notes: "Proposta enviada por WhatsApp. Aguardando aprovação do sócio."
    },
    {
      id: "lead_04",
      name: "Beatriz & Guilherme",
      service: "Casamento & Pré-Wedding",
      phone: "(21) 98122-3344",
      email: "bia.guilherme@gmail.com",
      source: "Indicação",
      estimatedValue: "R$ 9.800,00",
      stage: "fechado",
      date: "Há 2 dias",
      notes: "Sinal de 50% pago via Pix. Contrato assinado."
    }
  ];

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    let resultLeads = [];

    // 1. Tenta carregar do Supabase se configurado
    if (isSupabaseConfigured) {
      try {
        const { data, error: sbError } = await supabase
          .from("leads")
          .select("*")
          .order("criado_em", { ascending: false });

        if (!sbError && data && data.length > 0) {
          resultLeads = data.map(mapRow);
        }
      } catch (err) {
        console.warn("Supabase query fallback:", err);
      }
    }

    // 2. Mescla com entradas do formulário do site e leads gravados localmente
    try {
      const localLeads = JSON.parse(localStorage.getItem("admin_leads") || "[]");
      const siteSubmissions = JSON.parse(localStorage.getItem("site_form_submissions") || "[]");

      // Converte submissões de formulário ainda não presentes em leads
      const convertedSite = siteSubmissions.map(sub => ({
        id: "from_" + sub.id,
        name: sub.name,
        service: sub.service,
        phone: sub.phone,
        email: sub.email || "",
        source: sub.source || "Formulário do Site",
        estimatedValue: "A definir",
        stage: "novo",
        date: sub.createdAt || "Hoje",
        notes: sub.message || (sub.eventDate ? `Data solicitada: ${sub.eventDate}` : ""),
      }));

      // Combina leads locais + site + seeds sem duplicação de IDs
      const allCombined = [...localLeads, ...convertedSite, ...SEED_LEADS];
      const uniqueMap = new Map();

      // Prioriza dados do Supabase se houver
      resultLeads.forEach(l => uniqueMap.set(l.id, l));
      allCombined.forEach(l => {
        if (!uniqueMap.has(l.id) && !uniqueMap.has(l.phone)) {
          uniqueMap.set(l.id, l);
        }
      });

      resultLeads = Array.from(uniqueMap.values());
    } catch (e) {
      if (resultLeads.length === 0) resultLeads = SEED_LEADS;
    }

    setLeads(resultLeads);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  // ── Estágios do Kanban ─────────────────────────────────────────────────────
  const stages = [
    { key: "novo", label: "1. Novo Lead", color: "border-blue-500/40 text-blue-400 bg-blue-500/10" },
    { key: "contato", label: "2. Em Atendimento", color: "border-amber-500/40 text-amber-400 bg-amber-500/10" },
    { key: "proposta", label: "3. Proposta Enviada", color: "border-purple-500/40 text-purple-400 bg-purple-500/10" },
    { key: "fechado", label: "4. Fechado / Ganho", color: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10" },
    { key: "perdido", label: "5. Arquivado", color: "border-slate-600 text-slate-400 bg-slate-800/40" },
  ];

  const getNextStage = (current) => {
    const order = ["novo", "contato", "proposta", "fechado"];
    const idx = order.indexOf(current);
    return idx !== -1 && idx < order.length - 1 ? order[idx + 1] : null;
  };

  // ── Avançar etapa ──────────────────────────────────────────────────────────
  const moveStage = async (leadId, nextStage) => {
    // Atualiza estado local
    setLeads((prev) => {
      const updated = prev.map((l) => (l.id === leadId ? { ...l, stage: nextStage } : l));
      try {
        localStorage.setItem("admin_leads", JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });

    if (isSupabaseConfigured) {
      try {
        await supabase.from("leads").update({ etapa: nextStage }).eq("id", leadId);
      } catch (err) {
        console.warn("Erro ao atualizar etapa no Supabase:", err);
      }
    }

    logActivity?.("MOVE_LEAD", "leads", `Lead ${leadId} avançado para "${nextStage}"`);
    showToast(`Avançado para "${stages.find((s) => s.key === nextStage)?.label}"!`);
  };

  // ── Deletar lead ───────────────────────────────────────────────────────────
  const deleteLead = async (id, name) => {
    if (!window.confirm(`Remover lead "${name}"?`)) return;
    setLeads((prev) => {
      const filtered = prev.filter((l) => l.id !== id);
      try {
        localStorage.setItem("admin_leads", JSON.stringify(filtered));
      } catch (_) {}
      return filtered;
    });

    if (isSupabaseConfigured) {
      try {
        await supabase.from("leads").delete().eq("id", id);
      } catch (err) {
        console.warn("Erro ao remover do Supabase:", err);
      }
    }

    logActivity?.("REMOCAO_LEAD", "leads", `Removeu lead: ${name}`);
    showToast("Lead removido.", "error");
  };

  // ── Adicionar novo lead ────────────────────────────────────────────────────
  const handleAddLead = async (e) => {
    e.preventDefault();
    if (!newLead.name.trim() || !newLead.phone.trim()) {
      showToast("Preencha pelo menos nome e telefone.", "error");
      return;
    }
    setSaving(true);
    const { data, error: sbError } = await supabase
      .from("leads")
      .insert([{
        nome: newLead.name,
        servico: newLead.service,
        telefone: newLead.phone,
        email: newLead.email,
        valor_estimado: newLead.estimatedValue,
        observacoes: newLead.notes,
        etapa: newLead.stage,
        origem: newLead.source,
      }])
      .select()
      .single();

    setSaving(false);
    if (sbError) {
      showToast("Erro ao salvar lead: " + sbError.message, "error");
      return;
    }
    setLeads((prev) => [mapRow(data), ...prev]);
    logActivity("NOVO_LEAD", "leads", `Novo lead criado: ${newLead.name}`);
    showToast(`Lead "${newLead.name}" adicionado ao funil!`);
    setNewLead(EMPTY_FORM);
    setShowModal(false);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[999] px-5 py-3 rounded-2xl text-sm font-semibold shadow-2xl flex items-center gap-2 ${
          toast.type === "error" ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
        }`}>
          {toast.type === "error" ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-300 text-xs font-mono mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Funil de Vendas • Pipeline de Oportunidades</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white">Funil de Oportunidades (Leads)</h1>
          <p className="text-slate-400 text-xs">
            Acompanhe o ciclo completo de cada contato, da primeira mensagem ao fechamento do contrato.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadLeads}
            title="Atualizar leads"
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:border-gold/30 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-gold/20 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Lead</span>
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-3">
          <X className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-slate-900/60 border border-white/10 p-4 min-h-[480px] animate-pulse" />
          ))}
        </div>
      )}

      {/* Kanban Pipeline Columns */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {stages.map((stage) => {
            const stageLeads = leads.filter((l) => l.stage === stage.key);
            return (
              <div
                key={stage.key}
                className="rounded-2xl bg-slate-900/60 border border-white/10 p-4 flex flex-col min-h-[480px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${stage.color}`}>
                    {stage.label}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">{stageLeads.length}</span>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {stageLeads.map((lead) => {
                    const nextStage = getNextStage(lead.stage);
                    return (
                      <div
                        key={lead.id}
                        className="p-4 rounded-xl bg-black/40 border border-white/5 hover:border-gold/30 transition-all space-y-3 group"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-xs font-bold text-white block">{lead.name}</span>
                            <button
                              onClick={() => deleteLead(lead.id, lead.name)}
                              className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-red-400/60 hover:text-red-400 transition-all shrink-0"
                              title="Remover"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-xs text-gold-300 font-medium mt-0.5">{lead.service}</p>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{lead.notes}</p>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                          <span className="font-mono text-emerald-400 font-semibold text-[11px]">
                            {lead.estimatedValue || "—"}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                            {lead.source}
                          </span>
                        </div>

                        {/* Card Action Buttons */}
                        <div className="pt-1 flex items-center justify-between gap-2">
                          {lead.phone && (
                            <a
                              href={`https://wa.me/55${lead.phone.replace(/\D/g, "")}?text=Olá%20${encodeURIComponent(lead.name)},%20sou%20da%20Agências%20Araújo!`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 transition-colors"
                              title="Chamar no WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {nextStage && (
                            <button
                              onClick={() => moveStage(lead.id, nextStage)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-gold hover:text-gold-light bg-gold/10 hover:bg-gold/20 px-2 py-1 rounded-lg transition-colors ml-auto"
                            >
                              <span>Avançar</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {stageLeads.length === 0 && (
                    <div className="h-32 flex items-center justify-center text-center p-4 border border-dashed border-white/10 rounded-xl">
                      <span className="text-xs text-slate-500">Nenhum lead nesta etapa</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Lead Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[998] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-gold/30 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-white/5">
              <h2 className="text-lg font-serif font-bold text-white">Novo Lead Manual</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-xl text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLead} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={newLead.name}
                    onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                    placeholder="Ex: Maria da Silva"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Telefone / WhatsApp *</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={newLead.phone}
                      onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                      placeholder="(21) 99999-9999"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">E-mail</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={newLead.email}
                      onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                      placeholder="email@exemplo.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Serviço de Interesse</label>
                  <input
                    type="text"
                    value={newLead.service}
                    onChange={(e) => setNewLead({ ...newLead, service: e.target.value })}
                    placeholder="Ex: Casamento, Corporativo..."
                    className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Valor Estimado</label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={newLead.estimatedValue}
                      onChange={(e) => setNewLead({ ...newLead, estimatedValue: e.target.value })}
                      placeholder="R$ 0,00"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Observações</label>
                  <div className="relative">
                    <FileText className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                    <textarea
                      rows={3}
                      value={newLead.notes}
                      onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                      placeholder="Detalhes, preferências, contexto..."
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none resize-none"
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Etapa Inicial</label>
                  <select
                    value={newLead.stage}
                    onChange={(e) => setNewLead({ ...newLead, stage: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                  >
                    <option value="novo">1. Novo Lead</option>
                    <option value="contato">2. Em Atendimento</option>
                    <option value="proposta">3. Proposta Enviada</option>
                    <option value="fechado">4. Fechado / Ganho</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 text-slate-300 text-xs font-semibold hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-gold-gradient text-dark-950 text-xs font-bold uppercase tracking-wider hover:brightness-110 shadow-lg flex items-center gap-2 transition-all disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {saving ? "Salvando..." : "Adicionar Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
