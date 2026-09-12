import React, { useState, useEffect, useCallback } from "react";
import {
  UserCheck, Plus, MessageCircle, ArrowRight,
  X, Check, Trash2, Phone, Mail, DollarSign, FileText, RefreshCw, Loader2,
  Archive, RotateCcw
} from "lucide-react";
import WhatsAppIcon from '../../../components/icons/WhatsAppIcon';
import { useAuth } from "../../../context/AuthContext";
import { supabase, isSupabaseConfigured } from "../../../lib/supabaseClient";

// ─── Gerador de ID Universal determinístico ───────────────────────────────────
export const generateUniversalId = (lead) => {
  if (lead?.universalId) return lead.universalId;
  const year = new Date().getFullYear();
  const seedStr = String(lead?.id || lead?.phone || Date.now());
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const seq = Math.abs(hash % 900) + 100;
  const cleanName = (lead?.name || 'CLIENTE')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 6)
    .toUpperCase() || 'CLIENTE';
  return `CLI-${year}-${seq}-${cleanName}`;
};

// ─── Mapeamento de campos Supabase → estado local ────────────────────────────
// Colunas esperadas na tabela "leads":
//   id, universal_id, nome, servico, telefone, email, origem, valor_estimado, etapa, criado_em, observacoes
const mapRow = (row) => {
  const leadObj = {
    id: row.id,
    name: row.nome ?? "",
    service: row.servico ?? "",
    phone: row.telefone ?? "",
    email: row.email ?? "",
    source: row.origem ?? "Site",
    estimatedValue: row.valor_estimado ?? "A definir",
    stage: (row.status || row.etapa || "novo").toLowerCase(),
    date: row.criado_em
      ? new Date(row.criado_em).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
      : "",
    notes: row.mensagem || row.observacoes || "",
  };
  leadObj.universalId = row.universal_id || generateUniversalId(leadObj);
  return leadObj;
};

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

  // Estado para edição inline do valor negociado no card
  const [editingLeadId, setEditingLeadId] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const startEditingValue = (lead) => {
    setEditingLeadId(lead.id);
    setEditingValue(lead.estimatedValue && lead.estimatedValue !== "A definir" ? lead.estimatedValue : "");
  };

  const saveEditingValue = async (leadId) => {
    const finalVal = editingValue.trim()
      ? (editingValue.trim().startsWith("R$") ? editingValue.trim() : `R$ ${editingValue.trim()}`)
      : "A definir";

    setLeads((prev) => {
      const updated = prev.map((l) => (l.id === leadId ? { ...l, estimatedValue: finalVal } : l));
      try {
        localStorage.setItem("admin_leads", JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("leads").update({ valor_estimado: finalVal }).eq("id", leadId);
      } catch (err) {
        console.warn("Erro ao atualizar valor estimado no Supabase:", err);
      }
    }

    logActivity?.("EDIT_LEAD_VAL", "leads", `Atualizou valor estimado do lead ${leadId} para ${finalVal}`);
    showToast(`Valor estimado atualizado para ${finalVal}!`);
    setEditingLeadId(null);
    setEditingValue("");
  };

  const cancelEditingValue = () => {
    setEditingLeadId(null);
    setEditingValue("");
  };

  // ── Carregar leads com sincronização em nuvem e persistência de exclusões ──
  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    const deletedIds = JSON.parse(localStorage.getItem("admin_deleted_lead_ids") || "[]");
    let resultLeads = [];

    // 1. Tenta carregar exclusivamente da tabela oficial de leads do Supabase
    if (isSupabaseConfigured && supabase) {
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

    // 2. Mescla com leads gravados localmente caso haja algum offline
    try {
      const localLeads = JSON.parse(localStorage.getItem("admin_leads") || "[]");
      const combined = [...resultLeads, ...localLeads];

      // Deduplicação estrita por ID e por Telefone normalizado
      const normalizePhone = (p) => (p || "").replace(/\D/g, "");
      const seenIds = new Set();
      const seenPhones = new Set();
      const unique = [];

      for (const lead of combined) {
        if (!lead || !lead.id) continue;
        const strId = String(lead.id);
        const normPhone = normalizePhone(lead.phone);

        // Se o lead foi explicitamente removido pelo usuário, não ressuscita
        if (deletedIds.includes(strId)) continue;

        if (seenIds.has(strId)) continue;
        if (normPhone && seenPhones.has(normPhone)) continue;

        seenIds.add(strId);
        if (normPhone) seenPhones.add(normPhone);

        // Garante que o Universal ID esteja sempre presente
        if (!lead.universalId) {
          lead.universalId = generateUniversalId(lead);
        }

        unique.push(lead);
      }

      resultLeads = unique;
    } catch (e) {
      console.warn("Erro ao consolidar leads:", e);
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

  // ── Arquivar / Reativar lead ──────────────────────────────────────────────
  const archiveLead = async (leadId) => {
    setLeads((prev) => {
      const updated = prev.map((l) => (l.id === leadId ? { ...l, stage: "perdido" } : l));
      try {
        localStorage.setItem("admin_leads", JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("leads").update({ status: "perdido", etapa: "perdido" }).eq("id", leadId);
      } catch (err) {
        console.warn("Erro ao arquivar no Supabase:", err);
      }
    }

    logActivity?.("ARCHIVE_LEAD", "leads", `Lead ${leadId} movido para Arquivado`);
    showToast("Lead movido para a etapa 5. Arquivado!", "info");
  };

  const restoreLead = async (leadId) => {
    setLeads((prev) => {
      const updated = prev.map((l) => (l.id === leadId ? { ...l, stage: "novo" } : l));
      try {
        localStorage.setItem("admin_leads", JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("leads").update({ status: "novo", etapa: "novo" }).eq("id", leadId);
      } catch (err) {
        console.warn("Erro ao reativar no Supabase:", err);
      }
    }

    logActivity?.("RESTORE_LEAD", "leads", `Lead ${leadId} reativado para Novo Lead`);
    showToast("Lead reativado e retornado para 1. Novo Lead!", "success");
  };

  // ── Avançar etapa com Disparo Automático para Pagamentos e CRM ───────────────
  const moveStage = async (leadId, nextStage) => {
    const leadToMove = leads.find((l) => l.id === leadId);
    const universalId = leadToMove?.universalId || generateUniversalId(leadToMove || { id: leadId });

    setLeads((prev) => {
      const updated = prev.map((l) => (l.id === leadId ? { ...l, stage: nextStage, universalId } : l));
      try {
        localStorage.setItem("admin_leads", JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("leads").update({ 
          status: nextStage, 
          etapa: nextStage,
          universal_id: universalId 
        }).eq("id", leadId);
      } catch (err) {
        console.warn("Erro ao atualizar etapa no Supabase:", err);
      }
    }

    logActivity?.("MOVE_LEAD", "leads", `Lead ${leadId} avançado para "${nextStage}"`);

    // GATILHO AUTOMÁTICO AO FECHAR LEAD (Etapa 4. Fechado / Ganho)
    if (nextStage === "fechado" && leadToMove) {
      // 1. Atualizar ou Criar Cliente no CRM de Clientes (admin_clients) com status 'Ativo'
      try {
        const clients = JSON.parse(localStorage.getItem("admin_clients") || "[]");
        const normalizePhone = (p) => (p || "").replace(/\D/g, "");
        const leadPhoneNorm = normalizePhone(leadToMove.phone);
        const existingIdx = clients.findIndex(
          (c) =>
            (c.universalId && c.universalId === universalId) ||
            (leadPhoneNorm && normalizePhone(c.phone) === leadPhoneNorm) ||
            (c.name && c.name.toLowerCase() === leadToMove.name.toLowerCase())
        );

        if (existingIdx >= 0) {
          clients[existingIdx] = {
            ...clients[existingIdx],
            universalId,
            status: "Ativo",
            category: leadToMove.service || clients[existingIdx].category || "Retratos Pessoais",
            notes: leadToMove.notes || clients[existingIdx].notes,
          };
        } else {
          clients.unshift({
            id: `cli_${Date.now()}`,
            universalId,
            name: leadToMove.name,
            role: "Cliente Particular",
            category: leadToMove.service || "Retratos Pessoais",
            email: leadToMove.email || "",
            phone: leadToMove.phone || "",
            totalSpent: "R$ 0,00",
            sessionsCount: 1,
            status: "Ativo",
            lastSession: "Fechamento / Em Agendamento",
            notes: leadToMove.notes || `Cliente originado do Funil de Leads [${universalId}]`,
          });
        }
        localStorage.setItem("admin_clients", JSON.stringify(clients));
      } catch (err) {
        console.warn("Erro ao atualizar admin_clients:", err);
      }

      // 2. Disparo Automático para o Módulo de Pagamentos (admin_payments)
      try {
        const payments = JSON.parse(localStorage.getItem("admin_payments") || "[]");
        const leadPhoneNorm = (leadToMove.phone || "").replace(/\D/g, "");
        const leadNameNorm = (leadToMove.name || "").toLowerCase().trim();
        const existingPayIdx = payments.findIndex((p) => 
          (p.universalId && p.universalId === universalId) ||
          (leadNameNorm && p.clientName && p.clientName.toLowerCase().trim() === leadNameNorm) ||
          (leadPhoneNorm && p.phone && (p.phone || "").replace(/\D/g, "") === leadPhoneNorm)
        );

        if (existingPayIdx >= 0) {
          payments[existingPayIdx] = {
            ...payments[existingPayIdx],
            universalId: payments[existingPayIdx].universalId || universalId,
            clientName: leadToMove.name,
            phone: leadToMove.phone || payments[existingPayIdx].phone,
            email: leadToMove.email || payments[existingPayIdx].email,
          };
          localStorage.setItem("admin_payments", JSON.stringify(payments));
        } else {
          const now = new Date();
          const year = now.getFullYear();
          const seq = Math.floor(100 + Math.random() * 900);
          const inv = `FAT-${year}-${seq}`;
          const finalAmount = leadToMove.estimatedValue && leadToMove.estimatedValue !== "A definir"
            ? (leadToMove.estimatedValue.startsWith("R$") ? leadToMove.estimatedValue : `R$ ${leadToMove.estimatedValue}`)
            : "R$ 850,00";

          const autoPayment = {
            id: `pay_${Date.now()}`,
            invoice: inv,
            universalId,
            clientName: leadToMove.name,
            phone: leadToMove.phone,
            email: leadToMove.email,
            description: `Ensaio ${leadToMove.service || "Fotográfico"}`,
            amount: finalAmount,
            depositAmount: "R$ 0,00",
            remainingAmount: finalAmount,
            method: "Aguardando Definição",
            status: "Pendente",
            dueDate: new Date(now.getTime() + 7 * 86400000).toLocaleDateString("pt-BR"),
            paidAt: null,
            statusColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
          };
          payments.unshift(autoPayment);
          localStorage.setItem("admin_payments", JSON.stringify(payments));
        }
      } catch (err) {
        console.warn("Erro ao disparar pagamento automático:", err);
      }

      showToast(`Lead fechado com sucesso! Fatura gerada automaticamente em Pagamentos com ID Universal "${universalId}".`);
      return;
    }

    showToast(`Avançado para "${stages.find((s) => s.key === nextStage)?.label}"!`);
  };

  // ── Deletar lead ───────────────────────────────────────────────────────────
  const deleteLead = async (id, name) => {
    if (!window.confirm(`Remover lead "${name}"?`)) return;

    // Registra exclusão permanente no navegador
    const deletedIds = JSON.parse(localStorage.getItem("admin_deleted_lead_ids") || "[]");
    if (!deletedIds.includes(String(id))) {
      deletedIds.push(String(id));
      localStorage.setItem("admin_deleted_lead_ids", JSON.stringify(deletedIds));
    }

    setLeads((prev) => {
      const filtered = prev.filter((l) => l.id !== id);
      try {
        localStorage.setItem("admin_leads", JSON.stringify(filtered));
      } catch (_) {}
      return filtered;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("leads").delete().eq("id", id);
      } catch (err) {
        console.warn("Erro ao remover do Supabase:", err);
      }
    }

    logActivity?.("REMOCAO_LEAD", "leads", `Removeu lead: ${name}`);
    showToast("Lead removido com sucesso!", "error");
  };

  // ── Adicionar novo lead ────────────────────────────────────────────────────
  const handleAddLead = async (e) => {
    e.preventDefault();
    if (!newLead.name.trim() || !newLead.phone.trim()) {
      showToast("Preencha pelo menos nome e telefone.", "error");
      return;
    }
    setSaving(true);
    let createdLead = null;
    const universalId = generateUniversalId(newLead);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error: sbError } = await supabase
          .from("leads")
          .insert([{
            nome: newLead.name,
            servico: newLead.service,
            telefone: newLead.phone,
            email: newLead.email,
            valor_estimado: newLead.estimatedValue || "A definir",
            observacoes: newLead.notes || "",
            mensagem: newLead.notes || "",
            etapa: newLead.stage || "novo",
            status: newLead.stage || "novo",
            origem: newLead.source || "Manual",
            universal_id: universalId,
          }])
          .select()
          .single();

        if (!sbError && data) {
          createdLead = mapRow(data);
        }
      } catch (err) {
        console.warn("Erro ao adicionar no Supabase:", err);
      }
    }

    if (!createdLead) {
      createdLead = {
        id: `lead_${Date.now()}`,
        universalId,
        name: newLead.name,
        service: newLead.service,
        phone: newLead.phone,
        email: newLead.email,
        source: newLead.source || "Manual",
        estimatedValue: newLead.estimatedValue || "A definir",
        stage: newLead.stage || "novo",
        date: new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
        notes: newLead.notes || "",
      };
    }

    setLeads((prev) => {
      const updated = [createdLead, ...prev];
      try {
        localStorage.setItem("admin_leads", JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });

    logActivity?.("NOVO_LEAD", "leads", `Novo lead criado: ${newLead.name} [${universalId}]`);
    showToast(`Lead "${newLead.name}" adicionado com ID "${universalId}"!`);
    setNewLead(EMPTY_FORM);
    setShowModal(false);
    setSaving(false);
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
                          {/* Universal ID badge & Delete */}
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className="font-mono text-[9px] font-bold text-gold bg-gold/10 border border-gold/20 px-1.5 py-0.5 rounded">
                              {lead.universalId || generateUniversalId(lead)}
                            </span>
                            <button
                              onClick={() => deleteLead(lead.id, lead.name)}
                              className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-red-400/60 hover:text-red-400 transition-all shrink-0"
                              title="Remover Lead"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="flex items-start justify-between gap-1">
                            <span className="text-xs font-bold text-white block">{lead.name}</span>
                          </div>
                          <p className="text-xs text-gold-300 font-medium mt-0.5">{lead.service}</p>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{lead.notes}</p>
                        </div>

                        {/* Valor Estimado com Edição Inline no Card */}
                        <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                          {editingLeadId === lead.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                placeholder="R$ 850,00"
                                autoFocus
                                className="w-24 px-1.5 py-0.5 rounded bg-black border border-gold text-white text-[11px] font-mono focus:outline-none"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveEditingValue(lead.id);
                                  if (e.key === "Escape") cancelEditingValue();
                                }}
                              />
                              <button
                                onClick={() => saveEditingValue(lead.id)}
                                className="p-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/40 transition-colors"
                                title="Confirmar novo valor"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                onClick={cancelEditingValue}
                                className="p-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/40 transition-colors"
                                title="Cancelar"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEditingValue(lead)}
                              className="group/val flex items-center gap-1 font-mono text-emerald-400 font-semibold text-[11px] hover:text-emerald-300 transition-colors text-left"
                              title="Clique para editar o valor acordado"
                            >
                              <span>{lead.estimatedValue || "A definir"}</span>
                              <span className="text-[10px] text-slate-500 opacity-60 group-hover/val:opacity-100 transition-opacity">✏️</span>
                            </button>
                          )}
                          <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                            {lead.source}
                          </span>
                        </div>

                        {/* Card Action Buttons */}
                        <div className="pt-1 flex items-center justify-between gap-1.5">
                          {lead.phone && (
                            <a
                              href={`https://wa.me/55${lead.phone.replace(/\D/g, "")}?text=Olá%20${encodeURIComponent(lead.name)},%20sou%20da%20Agências%20Araújo!`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 transition-colors"
                              title="Chamar no WhatsApp"
                            >
                              <WhatsAppIcon className="w-3.5 h-3.5 text-green-400" />
                            </a>
                          )}

                          {lead.stage !== "perdido" ? (
                            <>
                              <button
                                onClick={() => archiveLead(lead.id)}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 px-2 py-1 rounded-lg transition-colors"
                                title="Mover este lead para 5. Arquivado"
                              >
                                <Archive className="w-3 h-3 text-slate-400" />
                                <span>Arquivar</span>
                              </button>

                              {nextStage && (
                                <button
                                  onClick={() => moveStage(lead.id, nextStage)}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-gold hover:text-gold-light bg-gold/10 hover:bg-gold/20 px-2 py-1 rounded-lg transition-colors ml-auto"
                                >
                                  <span>Avançar</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                            </>
                          ) : (
                            <div className="flex items-center gap-1.5 ml-auto">
                              <button
                                onClick={() => restoreLead(lead.id)}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded-lg transition-colors"
                                title="Reativar e mover de volta para 1. Novo Lead"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Reativar</span>
                              </button>
                              <button
                                onClick={() => deleteLead(lead.id, lead.name)}
                                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                title="Excluir permanentemente"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
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
                    <option value="perdido">5. Arquivado</option>
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
