import React, { useState, useEffect } from 'react';
import { 
  FileCheck, ShieldCheck, Check, Clock, AlertTriangle, 
  Calendar, DollarSign, User, Phone, CheckCircle2, ArrowRight, Sparkles
} from 'lucide-react';
import WhatsAppIcon from './icons/WhatsAppIcon';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export default function ContractAcceptanceView({ onBackToSite }) {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionStatus, setActionStatus] = useState(null); // 'accepted' | 'revision'
  const [submitting, setSubmitting] = useState(false);

  // Extract token from URL path: /contrato/:token or query param ?token=...
  const getTokenFromUrl = () => {
    const path = window.location.pathname;
    const parts = path.split('/contrato/');
    if (parts.length > 1 && parts[1]) {
      return parts[1].split('/')[0].split('?')[0].trim();
    }
    const params = new URLSearchParams(window.location.search);
    return params.get('token') || '';
  };

  const token = getTokenFromUrl();

  useEffect(() => {
    async function loadContract() {
      setLoading(true);
      if (!token) {
        setLoading(false);
        return;
      }

      let found = null;

      // 1. Try Supabase first
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('contratos')
            .select('*')
            .or(`token.eq.${token},contract_number.eq.${token},universal_id.eq.${token}`)
            .limit(1);

          if (!error && data && data.length > 0) {
            const row = data[0];
            found = {
              id: row.id,
              contractNumber: row.contract_number,
              universalId: row.universal_id,
              clientName: row.client_name,
              clientCpf: row.client_cpf,
              phone: row.phone,
              serviceTitle: row.service_title,
              totalAmount: row.total_amount,
              depositAmount: row.deposit_amount,
              remainingAmount: row.remaining_amount,
              eventDate: row.event_date,
              eventTime: row.event_time,
              signedStatus: row.status === 'aceito' || row.status === 'Assinado Digitalmente' ? 'Assinado Digitalmente' : (row.status || 'Aguardando Assinatura'),
              signedAt: row.assinado_em ? new Date(row.assinado_em).toLocaleString('pt-BR') : null,
              revisaoSolicitada: Boolean(row.revisao_solicitada),
              revisaoAt: row.revisao_at,
              token: row.token,
            };
          }
        } catch (err) {
          console.warn('Erro ao buscar contrato no Supabase:', err);
        }
      }

      // 2. Fallback to localStorage if not found or offline
      if (!found) {
        try {
          const localList = JSON.parse(localStorage.getItem('admin_contracts') || '[]');
          const localMatch = localList.find(c => 
            c.token === token || 
            c.contractNumber === token || 
            c.universalId === token
          );
          if (localMatch) {
            found = localMatch;
          }
        } catch (_) {}
      }

      if (found) {
        setContract(found);
        if (found.signedStatus === 'Assinado Digitalmente') {
          setActionStatus('accepted');
        } else if (found.revisaoSolicitada) {
          setActionStatus('revision');
        }
      }

      setLoading(false);
    }

    loadContract();
  }, [token]);

  // Handle Client Digital Acceptance
  const handleAcceptContract = async () => {
    if (!contract) return;
    setSubmitting(true);

    const nowIso = new Date().toISOString();
    const nowFormatted = new Date().toLocaleString('pt-BR');

    // 1. Update local state & localStorage immediately for instant feedback
    setContract(prev => ({
      ...prev,
      signedStatus: 'Assinado Digitalmente',
      signedAt: nowFormatted,
      revisaoSolicitada: false,
    }));
    setActionStatus('accepted');
    setSubmitting(false);

    try {
      const localList = JSON.parse(localStorage.getItem('admin_contracts') || '[]');
      const updatedList = localList.map(c => {
        if (c.token === contract.token || c.id === contract.id) {
          return {
            ...c,
            signedStatus: 'Assinado Digitalmente',
            signedAt: nowFormatted,
            revisaoSolicitada: false,
            statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          };
        }
        return c;
      });
      localStorage.setItem('admin_contracts', JSON.stringify(updatedList));

      // Move to Agenda Queue (admin_pending_schedules) as contract is now accepted!
      const pendingList = JSON.parse(localStorage.getItem('admin_pending_schedules') || '[]');
      const uid = contract.universalId || contract.contractNumber;
      if (!pendingList.some(item => (item.universalId || item.id) === uid)) {
        pendingList.unshift({
          id: `sched_rem_${Date.now()}`,
          universalId: uid,
          clientName: contract.clientName,
          phone: contract.phone,
          service: contract.serviceTitle,
          depositAmount: contract.depositAmount,
          contractNumber: contract.contractNumber,
          createdAt: nowIso,
        });
        localStorage.setItem('admin_pending_schedules', JSON.stringify(pendingList));
      }

      window.dispatchEvent(new Event('storage'));
    } catch (_) {}

    // 2. Sync to Supabase in background
    if (isSupabaseConfigured && supabase && contract.token) {
      try {
        await supabase
          .from('contratos')
          .update({
            status: 'Assinado Digitalmente',
            assinado_em: nowIso,
            revisao_solicitada: false,
          })
          .eq('token', contract.token);
      } catch (err) {
        console.warn('Erro ao atualizar contrato no Supabase:', err);
      }
    }
  };

  // Handle Client Review Request
  const handleRequestRevision = async () => {
    if (!contract) return;
    setSubmitting(true);
    const today = new Date().toLocaleDateString('pt-BR');

    setContract(prev => ({
      ...prev,
      revisaoSolicitada: true,
      revisaoAt: today,
    }));
    setActionStatus('revision');
    setSubmitting(false);

    try {
      const localList = JSON.parse(localStorage.getItem('admin_contracts') || '[]');
      const updatedList = localList.map(c => {
        if (c.token === contract.token || c.id === contract.id) {
          return {
            ...c,
            revisaoSolicitada: true,
            revisaoAt: today,
          };
        }
        return c;
      });
      localStorage.setItem('admin_contracts', JSON.stringify(updatedList));
      window.dispatchEvent(new Event('storage'));
    } catch (_) {}

    if (isSupabaseConfigured && supabase && contract.token) {
      try {
        await supabase
          .from('contratos')
          .update({
            revisao_solicitada: true,
            revisao_at: today,
          })
          .eq('token', contract.token);
      } catch (err) {
        console.warn('Erro ao registrar revisão no Supabase:', err);
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 text-white flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-serif text-gold-300">Carregando Minuta Contratual...</p>
        <p className="text-xs text-slate-500 mt-1 font-mono">Agências Araújo Fotografia</p>
      </div>
    );
  }

  // Contract not found
  if (!contract) {
    return (
      <div className="min-h-screen bg-dark-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-amber-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-serif font-bold text-white mb-2">Contrato Não Localizado</h1>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          O link de assinatura informado pode ter expirado ou não está ativo no momento. Entre em contato com a equipe para receber uma nova via.
        </p>
        <a
          href="https://wa.me/5521974299780?text=Olá!%20Estou%20com%20dúvidas%20sobre%20meu%20contrato%20na%20Agências%20Araújo."
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-2"
        >
          <WhatsAppIcon className="w-4 h-4 text-green-400" />
          <span>Falar com Agências Araújo</span>
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 selection:bg-gold-500 selection:text-black py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Top Branding Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-300 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Minuta Oficial • Cessão de Imagem (Lei 9.610/98)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
            Agências Araújo Fotografia
          </h1>
          <p className="text-xs text-slate-400 font-sans">
            Eternizando momentos, contando histórias com arte, sensibilidade e excelência.
          </p>
        </div>

        {/* Status Banner */}
        {actionStatus === 'accepted' ? (
          <div className="p-6 rounded-3xl bg-gradient-to-b from-emerald-500/20 to-emerald-950/40 border border-emerald-500/40 text-center space-y-3 shadow-2xl animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-serif font-bold text-emerald-200">
              Contrato Aceito &amp; Confirmado com Sucesso!
            </h2>
            <p className="text-sm text-slate-200 leading-relaxed font-sans max-w-lg mx-auto">
              <strong>Obrigado pela preferência e pela confiança na Agências Araújo!</strong> 📷✨<br />
              <span className="text-gold-300 italic">"Eternizando momentos, contando histórias com arte e elegância."</span>
            </p>
            <p className="text-xs text-slate-400">
              Autenticação digital concluída em {contract.signedAt || 'agora'}. Sua produção já está liberada para agendamento oficial.
            </p>
            <div className="pt-2">
              <a
                href={`https://wa.me/5521974299780?text=${encodeURIComponent(`🎉 Olá Agências Araújo! Confirmo o aceite digital do meu contrato ${contract.contractNumber} [ID: ${contract.universalId || contract.contractNumber}].\n\nObrigado pela preferência e pela confiança na Agências Araújo! 📷✨\n"Eternizando momentos, contando histórias com arte, sensibilidade e excelência."`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-dark-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all"
              >
                <WhatsAppIcon className="w-4 h-4 text-dark-950" />
                <span>Enviar Confirmação no WhatsApp da Agência</span>
              </a>
            </div>
          </div>
        ) : actionStatus === 'revision' ? (
          <div className="p-6 rounded-3xl bg-amber-500/15 border border-amber-500/30 text-center space-y-3 shadow-2xl animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-serif font-bold text-amber-200">
              Solicitação de Revisão Registrada
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
              Nossa equipe entrará em contato para esclarecer dúvidas e ajustar os termos necessários.
            </p>
            <a
              href={`https://wa.me/5521974299780?text=${encodeURIComponent(`Olá Agências Araújo! Gostaria de conversar sobre ajustes no meu contrato ${contract.contractNumber}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all"
            >
              <WhatsAppIcon className="w-4 h-4 text-green-400" />
              <span>Conversar com a Agência no WhatsApp</span>
            </a>
          </div>
        ) : null}

        {/* Contract Card */}
        <div className="rounded-3xl bg-slate-900/80 border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-md">
          
          {/* Top Bar of Card */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Número do Contrato</span>
              <span className="text-base font-serif font-bold text-gold">{contract.contractNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">ID Universal</span>
              <span className="text-xs font-mono font-bold text-slate-200 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                {contract.universalId || contract.contractNumber}
              </span>
            </div>
          </div>

          {/* Parties & Service Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1 p-3.5 rounded-xl bg-black/40 border border-white/5">
              <span className="text-slate-400 uppercase font-semibold text-[10px] block">Contratante</span>
              <span className="text-white font-bold text-sm block">{contract.clientName}</span>
              <span className="text-slate-400 font-mono block">Doc: {contract.clientCpf || 'Sob consulta'}</span>
              <span className="text-slate-400 font-mono block">WhatsApp: {contract.phone}</span>
            </div>

            <div className="space-y-1 p-3.5 rounded-xl bg-black/40 border border-white/5">
              <span className="text-slate-400 uppercase font-semibold text-[10px] block">Serviço Contratado</span>
              <span className="text-gold-300 font-bold text-sm block">{contract.serviceTitle}</span>
              <span className="text-slate-400 block">
                Data Prevista: <strong>{contract.eventDate || 'A definir'}</strong>
                {contract.eventTime && ` às ${contract.eventTime}`}
              </span>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-gold/10 via-black/40 to-black/40 border border-gold/30 space-y-2 text-xs">
            <span className="text-gold-300 uppercase font-bold text-[10px] tracking-wider block">Condições Financeiras</span>
            <div className="flex justify-between items-center text-slate-300">
              <span>Valor Total da Produção:</span>
              <span className="font-serif font-bold text-white text-base">{contract.totalAmount}</span>
            </div>
            {contract.depositAmount && contract.depositAmount !== 'R$ 0,00' && (
              <div className="flex justify-between items-center text-emerald-400 font-sans">
                <span>✓ Sinal Pago (Garantia de Reserva):</span>
                <span className="font-mono font-bold">{contract.depositAmount}</span>
              </div>
            )}
            {contract.remainingAmount && contract.remainingAmount !== 'R$ 0,00' && (
              <div className="flex justify-between items-center text-amber-300 font-sans border-t border-white/10 pt-1.5">
                <span>Saldo a Acertar na Produção:</span>
                <span className="font-mono font-bold">{contract.remainingAmount}</span>
              </div>
            )}
          </div>

          {/* Legal Clauses */}
          <div className="space-y-3 pt-2 text-xs text-slate-300">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-white/10 pb-1.5">
              Termos Contratuais &amp; Cessão de Uso de Imagem
            </h3>
            
            <div className="space-y-2 text-[11px] leading-relaxed text-slate-300">
              <p>
                <strong>1. Cessão de Imagem (Lei 9.610/98):</strong> O(A) Contratante autoriza a captação e veiculação das imagens produzidas exclusivamente para fins de acervo pessoal do cliente e divulgação institucional artística do portfólio da Agências Araújo.
              </p>
              <p>
                <strong>2. Agendamento &amp; Cancelamento:</strong> O cancelamento ou reagendamento de datas deve ser comunicado com antecedência mínima de 72 horas para preservação de disponibilidade de estúdio e equipe técnica.
              </p>
              <p>
                <strong>3. Entrega &amp; Tratamento:</strong> A entrega das fotografias tratadas em alta resolução dar-se-á em até 30 dias úteis após a conclusão da sessão de fotos.
              </p>
            </div>
          </div>

          {/* Action Buttons if not accepted yet */}
          {actionStatus !== 'accepted' && (
            <div className="pt-4 border-t border-white/10 space-y-3">
              <p className="text-[11px] text-center text-slate-400">
                Ao clicar em <strong>"Aceitar Contrato &amp; Termos"</strong>, você autentica digitalmente a contratação do serviço com validade jurídica.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleAcceptContract}
                  className="w-full py-3.5 px-4 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-xl shadow-gold/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>1. Aceitar Contrato &amp; Termos</span>
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleRequestRevision}
                  className="w-full py-3.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/15 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>2. Solicitar Revisão / Dúvidas</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-500 space-y-1">
          <p>Agências Araújo | Fotografia, Newborn, Ensaios &amp; Audiovisual RJ</p>
          <p>Dúvidas ou suporte: (21) 97429-9780 • Rio de Janeiro, RJ</p>
        </div>

      </div>
    </div>
  );
}
