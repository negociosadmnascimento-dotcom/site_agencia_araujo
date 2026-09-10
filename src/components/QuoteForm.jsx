import React, { useState } from 'react';
import { Send, CheckCircle2, Mail, Phone, User, Calendar, FileText, Sparkles, Clock, AlertCircle } from 'lucide-react';
import WhatsAppIcon from './icons/WhatsAppIcon';
import { CONTACT_INFO } from '../config/contact';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export default function QuoteForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: 'Newborn & Bebês',
    date: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Format phone input
  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);

    if (val.length > 6) {
      val = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
    } else if (val.length > 2) {
      val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    } else if (val.length > 0) {
      val = `(${val}`;
    }

    setFormData({ ...formData, phone: val });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      setErrorMessage('Por favor, preencha nome, telefone e sua mensagem para continuar.');
      return;
    }

    setIsSubmitting(true);

    // Template 1: Resposta Rápida de Orçamento (aligned with WhatsApp module official templates)
    const template1 = `Olá! Acabei de enviar uma solicitação de orçamento pelo site da Agências Araújo.\n\n` +
      `*Nome:* ${formData.name}\n` +
      `*Serviço:* ${formData.service}\n` +
      `*Telefone:* ${formData.phone}\n` +
      `*E-mail:* ${formData.email || 'Não informado'}\n` +
      `*Data Prevista:* ${formData.date || 'A combinar'}\n\n` +
      `*Detalhes:* ${formData.message}\n\n` +
      `_Aguardo o retorno para produzir registros extraordinários!_`;

    const whatsappUrl = `https://wa.me/${CONTACT_INFO.whatsapp.number}?text=${encodeURIComponent(template1)}`;

    // 1. Gravação direta na nuvem (Supabase) para sincronização multi-dispositivo
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('form_submissions').insert([{
          name: formData.name,
          email: formData.email || '',
          phone: formData.phone,
          service: formData.service,
          event_date: formData.date || 'A combinar',
          message: formData.message,
          tenant_id: 'tenant_001',
          read: false,
          source: 'Formulário do Site',
        }]);

        await supabase.from('leads').insert([{
          nome: formData.name,
          servico: formData.service,
          telefone: formData.phone,
          email: formData.email || '',
          mensagem: formData.message,
          origem: 'site',
          status: 'novo',
        }]);
      } catch (sbErr) {
        console.warn('Erro ao persistir no Supabase:', sbErr);
      }
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);

      // Persistência no banco local do SaaS (conectado ao painel Admin)
      try {
        const formattedDate = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
        
        // 1. Envia para a Caixa de Entrada de Formulários (FormsInboxModule)
        const existingForms = JSON.parse(localStorage.getItem('site_form_submissions') || '[]');
        const newFormEntry = {
          id: 'sub_' + Date.now(),
          name: formData.name,
          email: formData.email || '',
          phone: formData.phone,
          service: formData.service,
          eventDate: formData.date || 'A combinar',
          message: formData.message,
          createdAt: formattedDate,
          read: false,
          source: 'Formulário do Site',
        };
        existingForms.unshift(newFormEntry);
        localStorage.setItem('site_form_submissions', JSON.stringify(existingForms));

        // 2. Envia para o Funil de Vendas de Leads (LeadsModule)
        const existingLeads = JSON.parse(localStorage.getItem('admin_leads') || '[]');
        const newLeadEntry = {
          id: 'lead_' + Date.now(),
          name: formData.name,
          service: formData.service,
          phone: formData.phone,
          email: formData.email || '',
          source: 'Formulário do Site (Orçamento)',
          estimatedValue: 'A definir',
          stage: 'novo',
          date: formattedDate,
          notes: `[Orçamento]: ${formData.message} | Data solicitada: ${formData.date || 'A combinar'}`,
        };
        existingLeads.unshift(newLeadEntry);
        localStorage.setItem('admin_leads', JSON.stringify(existingLeads));
      } catch (err) {
        console.error('Erro ao registrar formulário no admin:', err);
      }

      // Open WhatsApp automatically in a new tab
      window.open(whatsappUrl, '_blank');
    }, 600);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      service: 'Newborn & Bebês',
      date: '',
      message: ''
    });
    setSubmitted(false);
  };

  return (
    <section id="orcamento" className="py-24 relative overflow-hidden bg-stone-100/70 dark:bg-dark-950 w-full transition-colors duration-300">
      {/* Background Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gold-glow pointer-events-none -z-10" />

      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Direct Contact Info & Assurance */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/90 dark:bg-gold/15 border border-amber-300/80 dark:border-gold/30 text-amber-950 dark:text-gold-300 text-xs font-bold uppercase tracking-widest mb-4 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-gold" />
                <span>Atendimento Personalizado</span>
              </div>

              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-6">
                Solicite Seu <span className="gold-text">Orçamento</span> Sem Compromisso
              </h2>

              <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-8">
                Preencha o formulário ao lado e nossa equipe entrará em contato prontamente com a proposta sob medida para eternizar seu momento.
              </p>

              {/* Direct channels */}
              <div className="space-y-4 mb-8">
                <a
                  href={`https://wa.me/${CONTACT_INFO.whatsapp.number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl glass-card border border-stone-200 dark:border-slate-800 hover:border-emerald-500/50 transition-all group shadow-sm"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <WhatsAppIcon className="w-6 h-6 fill-emerald-500 dark:fill-emerald-400 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-medium">WhatsApp Direto</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {CONTACT_INFO.whatsapp.display}
                    </span>
                  </div>
                </a>

                <a
                  href={`mailto:${CONTACT_INFO.email.address}`}
                  className="flex items-center gap-4 p-4 rounded-2xl glass-card border border-stone-200 dark:border-slate-800 hover:border-gold-500/50 transition-all group shadow-sm"
                >
                  <div className="w-12 h-12 rounded-xl bg-gold/20 text-gold-700 dark:text-gold flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-medium">E-mail Oficial</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold transition-colors">
                      {CONTACT_INFO.email.address}
                    </span>
                  </div>
                </a>
              </div>
            </div>

            {/* Quick trust box */}
            <div className="p-5 rounded-2xl bg-stone-100 dark:bg-dark-900/90 border border-stone-300 dark:border-gold-500/30 shadow-sm">
              <div className="flex items-center gap-2 text-gold-700 dark:text-gold text-xs font-bold uppercase tracking-wider mb-1">
                <Clock className="w-4 h-4" />
                <span>Resposta Rápida</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Respondemos todas as mensagens com atenção individualizada e opções de pacotes adaptados ao seu sonho.
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl glass-card border border-stone-200 dark:border-gold-500/30 p-8 sm:p-10 shadow-2xl relative">
              
              {submitted ? (
                <div className="py-12 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white mb-2">
                    Mensagem Encaminhada com Sucesso!
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mb-6">
                    Sua solicitação de orçamento foi estruturada e aberta no WhatsApp da <strong>Agências Araújo</strong>. Caso a janela não tenha aberto automaticamente, clique no botão abaixo.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <a
                      href={`https://wa.me/${CONTACT_INFO.whatsapp.number}?text=${encodeURIComponent(
                        `*ORÇAMENTO AGÊNCIAS ARAÚJO*\nNome: ${formData.name}\nServiço: ${formData.service}\nTelefone: ${formData.phone}\n${formData.message}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
                    >
                      <WhatsAppIcon className="w-4 h-4 text-dark-950 fill-dark-950" />
                      <span>Abrir no WhatsApp</span>
                    </a>

                    <button
                      onClick={resetForm}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold uppercase tracking-wider transition-colors"
                    >
                      Enviar Outra Mensagem
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {errorMessage && (
                    <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Nome */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                        Seu Nome Completo *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Ex: Mariana Silva"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-dark-950/80 border border-stone-300 dark:border-slate-700/80 focus:border-gold-600 dark:focus:border-gold focus:outline-none text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* WhatsApp */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                        Telefone / WhatsApp *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          placeholder="(21) 99999-9999"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-dark-950/80 border border-stone-300 dark:border-slate-700/80 focus:border-gold-600 dark:focus:border-gold focus:outline-none text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* E-mail */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                        Seu E-mail
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="seuemail@exemplo.com"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-dark-950/80 border border-stone-300 dark:border-slate-700/80 focus:border-gold-600 dark:focus:border-gold focus:outline-none text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Serviço de Interesse */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                        Serviço Desejado *
                      </label>
                      <select
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-dark-950/80 border border-stone-300 dark:border-slate-700/80 focus:border-gold-600 dark:focus:border-gold focus:outline-none text-slate-900 dark:text-white text-sm transition-colors"
                      >
                        <option value="Newborn & Bebês">Newborn & Bebês</option>
                        <option value="Ensaio Feminino / Moda">Ensaio Feminino / Moda</option>
                        <option value="Casamento & Pré-Wedding">Casamento & Pré-Wedding</option>
                        <option value="Gestante & Família">Gestante & Família</option>
                        <option value="15 Anos & Debutante">15 Anos & Debutante</option>
                        <option value="Vídeo Maker / Audiovisual">Vídeo Maker / Audiovisual</option>
                        <option value="Retrato Corporativo">Retrato Corporativo</option>
                        <option value="Eventos Sociais em Geral">Eventos Sociais em Geral</option>
                      </select>
                    </div>
                  </div>

                  {/* Data Prevista */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                      Data ou Período Previsto (Opcional)
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        placeholder="Ex: Próximo mês / Outubro / A definir"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-dark-950/80 border border-stone-300 dark:border-slate-700/80 focus:border-gold-600 dark:focus:border-gold focus:outline-none text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Mensagem */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                      Conte-nos sobre o que você deseja registrar *
                    </label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3.5 top-3.5" />
                      <textarea
                        name="message"
                        required
                        rows="4"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Descreva detalhes como local, quantidade de pessoas, se é estúdio ou externa, e suas dúvidas principais..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-dark-950/80 border border-stone-300 dark:border-slate-700/80 focus:border-gold-600 dark:focus:border-gold focus:outline-none text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 transition-colors resize-none"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs sm:text-sm uppercase tracking-wider hover:brightness-110 shadow-xl shadow-gold/25 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-dark-950 border-t-transparent rounded-full animate-spin" />
                        Processando Orçamento...
                      </span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Enviar Solicitação para Agências Araújo</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-center text-slate-400">
                    Sua mensagem será encaminhada diretamente para a equipe oficial no WhatsApp e/ou e-mail.
                  </p>

                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}