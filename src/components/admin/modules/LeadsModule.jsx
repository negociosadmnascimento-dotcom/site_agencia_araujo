import React, { useState } from 'react';
import { 
  UserCheck, Plus, Search, Filter, MessageCircle, ArrowRight, 
  DollarSign, Clock, CheckCircle, XCircle, Sparkles, Phone, Eye 
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function LeadsModule() {
  const { isSuperAdmin } = useAuth();
  const [selectedStage, setSelectedStage] = useState('Todos');

  const [leads, setLeads] = useState([
    {
      id: 'lead_01',
      name: 'Camila Mendonça',
      service: 'Retratos Pessoais & Branding',
      phone: '(21) 99123-4567',
      email: 'camila.mendonca@gmail.com',
      source: 'Formulário do Site',
      estimatedValue: 'R$ 2.800,00',
      stage: 'novo',
      date: 'Hoje, 14:20',
      notes: 'Solicitou ensaio ao ar livre na Urca ou Copacabana.'
    },
    {
      id: 'lead_02',
      name: 'Diretoria Hospital Copa D\'Or',
      service: 'Fotos Corporativas Equipe Médica',
      phone: '(21) 98877-1122',
      email: 'rh@copador.com.br',
      source: 'WhatsApp Direto',
      estimatedValue: 'R$ 7.500,00',
      stage: 'contato',
      date: 'Hoje, 11:15',
      notes: 'Precisam de fotos de 15 médicos especialistas para o anuário.'
    },
    {
      id: 'lead_03',
      name: 'Restaurante Fogo & Brasa Barra',
      service: 'Gastronomia & Vídeo Reels',
      phone: '(21) 97766-3344',
      email: 'gerencia@fogoebasa.com',
      source: 'Instagram',
      estimatedValue: 'R$ 3.900,00',
      stage: 'proposta',
      date: 'Ontem',
      notes: 'Proposta enviada por WhatsApp. Aguardando aprovação do sócio.'
    },
    {
      id: 'lead_04',
      name: 'Beatriz & Guilherme',
      service: 'Casamento & Pré-Wedding',
      phone: '(21) 98122-3344',
      email: 'bia.guilherme@gmail.com',
      source: 'Indicação',
      estimatedValue: 'R$ 9.800,00',
      stage: 'fechado',
      date: 'Há 2 dias',
      notes: 'Sinal de 50% pago via Pix. Contrato assinado.'
    },
    {
      id: 'lead_05',
      name: 'Studio Fitness Barra',
      service: 'Campanha de Marketing',
      phone: '(21) 99344-5566',
      email: 'contato@studiofitness.com',
      source: 'Formulário do Site',
      estimatedValue: 'R$ 1.500,00',
      stage: 'perdido',
      date: 'Há 5 dias',
      notes: 'Optou por postergar para o próximo semestre.'
    },
  ]);

  const stages = [
    { key: 'novo', label: '1. Novo Lead', color: 'border-blue-500/40 text-blue-400 bg-blue-500/10' },
    { key: 'contato', label: '2. Em Atendimento', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
    { key: 'proposta', label: '3. Proposta Enviada', color: 'border-purple-500/40 text-purple-400 bg-purple-500/10' },
    { key: 'fechado', label: '4. Fechado / Ganho', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
    { key: 'perdido', label: '5. Arquivado', color: 'border-slate-600 text-slate-400 bg-slate-800/40' },
  ];

  const moveStage = (leadId, nextStage) => {
    setLeads(leads.map(l => l.id === leadId ? { ...l, stage: nextStage } : l));
  };

  const getNextStage = (currentStage) => {
    const order = ['novo', 'contato', 'proposta', 'fechado'];
    const idx = order.indexOf(currentStage);
    if (idx !== -1 && idx < order.length - 1) return order[idx + 1];
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-300 text-xs font-mono mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Módulo 04 • Pipeline & Funil de Vendas</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white">Funil de Oportunidades (Leads)</h1>
          <p className="text-slate-400 text-xs">
            Acompanhe o ciclo completo de cada contato, da primeira mensagem ao fechamento do contrato
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 bg-black/40 px-3 py-2 rounded-xl border border-white/10">
            Total em Pipeline: <strong className="text-gold">{isSuperAdmin ? 'R$ 25.500,00' : '••••••••'}</strong>
          </span>
        </div>
      </div>

      {/* Kanban Pipeline Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stages.map((stage) => {
          const stageLeads = leads.filter(l => l.stage === stage.key);
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
                <span className="text-xs font-mono font-bold text-slate-400">
                  {stageLeads.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {stageLeads.map((lead) => {
                  const nextStage = getNextStage(lead.stage);
                  return (
                    <div
                      key={lead.id}
                      className="p-4 rounded-xl bg-black/40 border border-white/5 hover:border-gold/30 transition-all space-y-3 relative group"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white block truncate">{lead.name}</span>
                          <span className="text-[10px] font-mono text-slate-500">{lead.date}</span>
                        </div>
                        <p className="text-xs text-gold-300 font-medium mt-0.5">{lead.service}</p>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{lead.notes}</p>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                        <span className="font-mono text-emerald-400 font-semibold">
                          {isSuperAdmin ? lead.estimatedValue : '••••••'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                          {lead.source}
                        </span>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-2 flex items-center justify-between gap-2">
                        <a
                          href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(lead.name)},%20sou%20da%20Agências%20Araújo!`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 transition-colors"
                          title="Chamar no WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>

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
    </div>
  );
}
