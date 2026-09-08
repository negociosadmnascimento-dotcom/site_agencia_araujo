import React, { useState } from 'react';
import { 
  Send, Check, Sparkles, Copy, Phone, 
  Clock, ShieldCheck, CheckCheck, RefreshCw 
} from 'lucide-react';
import WhatsAppIcon from '../../../components/icons/WhatsAppIcon';
import { useAuth } from '../../../context/AuthContext';

export default function WhatsAppModule() {
  const { isSuperAdmin, logActivity } = useAuth();
  const [testNumber, setTestNumber] = useState('');
  const [customMsg, setCustomMsg] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const templates = [
    {
      id: 'tpl_01',
      title: '1. Resposta Rápida de Orçamento (Site)',
      category: 'Atendimento Inicial',
      text: 'Olá {NOME}, tudo bem? Aqui é da Agências Araújo Fotografia & Audiovisual RJ. Recebemos sua mensagem em nosso site e queremos preparar uma proposta exclusiva para sua produção. Podemos conversar agora por aqui?',
    },
    {
      id: 'tpl_02',
      title: '2. Envio de Proposta Exclusiva com Link',
      category: 'Comercial',
      text: 'Olá {NOME}! Sua proposta comercial para {SERVICO} está disponível em nosso portal exclusivo e seguro: {LINK_PROPOSTA}. O orçamento inclui todos os detalhes de produção, prazos e condições especiais.',
    },
    {
      id: 'tpl_03',
      title: '3. Lembrete de Ensaio (24h antes)',
      category: 'Produção & Agenda',
      text: 'Olá {NOME}! Passando para confirmar nosso ensaio fotográfico amanhã às {HORARIO} na locação {LOCAL}. Não se esqueça de separar os figurinos e acessórios combinados. Estamos ansiosos para criar registros extraordinários!',
    },
    {
      id: 'tpl_04',
      title: '4. Galeria Pronta para Seleção de Fotos',
      category: 'Pós-Produção',
      text: 'Olá {NOME}! As prévias do seu ensaio já estão disponíveis em sua galeria privada e protegida: {LINK_GALERIA}. Selecione suas fotos favoritas para o tratamento fino de imagem.',
    },
  ];

  const handleCopyTemplate = (tpl) => {
    navigator.clipboard.writeText(tpl.text);
    setCopiedId(tpl.id);
    logActivity('COPIA_TEMPLATE_WHATSAPP', 'whatsapp', `Copiou template "${tpl.title}"`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendTest = (e) => {
    e.preventDefault();
    if (!testNumber) return;
    const cleanNumber = testNumber.replace(/\D/g, '');
    const encoded = encodeURIComponent(customMsg || 'Olá! Mensagem de teste da Agências Araújo Fotografia RJ.');
    logActivity('DISPARO_WHATSAPP', 'whatsapp', `Disparou mensagem para ${testNumber}`);
    window.open(`https://wa.me/55${cleanNumber}?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-2">
            <WhatsAppIcon className="w-3.5 h-3.5 text-green-400" />
            <span>Módulo 11 • Central Oficial WhatsApp</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white">Central de Atendimento WhatsApp</h1>
          <p className="text-slate-400 text-xs">
            Templates pré-definidos de alto padrão e automações de contato para o número (21) 97429-9780
          </p>
        </div>

        {/* WhatsApp Official Status */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>(21) 97429-9780 • Conectado</span>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Templates 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gold-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Modelos Oficiais de Mensagens Rápidas</span>
          </h2>

          <div className="space-y-4">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="rounded-3xl bg-slate-900/70 border border-white/10 p-5 space-y-3 hover:border-gold/30 transition-all shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">{tpl.title}</h3>
                    <span className="text-[10px] font-mono text-slate-400">{tpl.category}</span>
                  </div>

                  <button
                    onClick={() => handleCopyTemplate(tpl)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
                  >
                    {copiedId === tpl.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-gold" />
                        <span>Copiar Texto</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-300 bg-black/40 p-3.5 rounded-2xl border border-white/5 leading-relaxed font-mono">
                  {tpl.text}
                </p>

                <div className="flex items-center justify-end">
                  <button
                    onClick={() => setCustomMsg(tpl.text)}
                    className="text-xs text-gold hover:text-gold-light font-semibold hover:underline"
                  >
                    Usar no Disparador Direto →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right col: Direct Dispatcher */}
        <div className="space-y-6">
          <div className="rounded-3xl bg-slate-900/80 border border-emerald-500/30 p-6 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-400" />
              <span>Disparador Rápido</span>
            </h2>
            <p className="text-xs text-slate-400">
              Envie mensagem direta para qualquer número sem precisar salvar na agenda telefônica.
            </p>

            <form onSubmit={handleSendTest} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Número do Cliente (com DDD)
                </label>
                <input
                  type="tel"
                  required
                  value={testNumber}
                  onChange={(e) => setTestNumber(e.target.value)}
                  placeholder="(21) 99999-9999"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-xs focus:border-emerald-400 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mensagem Personalizada
                </label>
                <textarea
                  rows={4}
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  placeholder="Digite sua mensagem ou selecione um dos templates..."
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-xs focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-dark-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <WhatsAppIcon className="w-4 h-4 text-white" />
                <span>Abrir Conversa no WhatsApp</span>
              </button>
            </form>
          </div>

          {/* Quick Info */}
          <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-5 text-xs text-slate-400 space-y-2">
            <span className="font-bold text-white block">Regra de Atendimento Ágil</span>
            <p>
              Leads respondidos nos primeiros 10 minutos após envio de formulário apresentam taxa de conversão 3x superior.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
