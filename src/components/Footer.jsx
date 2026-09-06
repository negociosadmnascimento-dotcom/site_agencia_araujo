import React from 'react';
import { Instagram, Mail, MapPin, Sparkles, Heart } from 'lucide-react';
import WhatsAppIcon from './icons/WhatsAppIcon';
import { CONTACT_INFO } from '../config/contact';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-stone-100 dark:bg-dark-950 border-t border-stone-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-sm w-full transition-colors duration-300">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info (Span 2) */}
          <div className="lg:col-span-2">
            <a href="#inicio" className="inline-block mb-4">
              <img
                src="/images/logo-transparent.png"
                alt="Agências Araújo"
                className="h-16 sm:h-20 w-auto object-contain mix-blend-multiply dark:mix-blend-screen drop-shadow-sm"
              />
            </a>
            
            <p className="font-script text-2xl text-gold-700 dark:text-gold-300 mb-4">
              "{CONTACT_INFO.tagline}"
            </p>
            
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mb-6">
              Excelência em fotografia, ensaios e produções audiovisuais no Rio de Janeiro. Sensibilidade humana aliada à tecnologia de ponta para contar histórias que duram para sempre.
            </p>

            <div className="flex items-center gap-3">
              <a
                href={CONTACT_INFO.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-700 hover:border-pink-500/50 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-pink-600 dark:hover:text-white transition-colors shadow-sm"
                title="Instagram"
              >
                <Instagram className="w-5 h-5 text-pink-500 dark:text-pink-400" />
              </a>

              <a
                href={`https://wa.me/${CONTACT_INFO.whatsapp.number}?text=${encodeURIComponent(CONTACT_INFO.whatsapp.defaultMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-700 hover:border-emerald-500/50 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-white transition-colors shadow-sm"
                title="WhatsApp Oficial"
              >
                <WhatsAppIcon className="w-5 h-5 text-emerald-500 dark:text-emerald-400 fill-emerald-500 dark:fill-emerald-400" />
              </a>

              <a
                href={`mailto:${CONTACT_INFO.email.address}`}
                className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-700 hover:border-gold-500/50 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-gold-600 dark:hover:text-white transition-colors shadow-sm"
                title="E-mail"
              >
                <Mail className="w-5 h-5 text-gold-600 dark:text-gold" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Navegação
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#inicio" className="hover:text-gold-600 dark:hover:text-gold transition-colors">Início</a>
              </li>
              <li>
                <a href="#diferenciais" className="hover:text-gold-600 dark:hover:text-gold transition-colors">Nossos Diferenciais</a>
              </li>
              <li>
                <a href="#servicos" className="hover:text-gold-600 dark:hover:text-gold transition-colors">Serviços Oficiais</a>
              </li>
              <li>
                <a href="#portfolio" className="hover:text-gold-600 dark:hover:text-gold transition-colors">Galeria de Fotos</a>
              </li>
              <li>
                <a href="#sobre" className="hover:text-gold-600 dark:hover:text-gold transition-colors">Sobre a Agência</a>
              </li>
              <li>
                <a href="#orcamento" className="hover:text-gold-600 dark:hover:text-gold transition-colors">Solicitar Orçamento</a>
              </li>
            </ul>
          </div>

          {/* Specialties */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Especialidades
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#servicos" className="hover:text-gold-600 dark:hover:text-gold transition-colors">Newborn & Bebês</a>
              </li>
              <li>
                <a href="#servicos" className="hover:text-gold-600 dark:hover:text-gold transition-colors">Ensaios Femininos & Moda</a>
              </li>
              <li>
                <a href="#servicos" className="hover:text-gold-600 dark:hover:text-gold transition-colors">Casamentos & Celebrações</a>
              </li>
              <li>
                <a href="#servicos" className="hover:text-gold-600 dark:hover:text-gold transition-colors">Vídeo Maker Cinematográfico</a>
              </li>
              <li>
                <a href="#servicos" className="hover:text-gold-600 dark:hover:text-gold transition-colors">Retratos Corporativos</a>
              </li>
              <li>
                <a href="#servicos" className="hover:text-gold-600 dark:hover:text-gold transition-colors">Eventos Sociais RJ</a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Atendimento
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gold-600 dark:text-gold shrink-0 mt-0.5" />
                <span className="text-slate-600 dark:text-slate-400">Rio de Janeiro - RJ e Região Metropolitana</span>
              </li>
              <li className="flex items-start gap-2">
                <WhatsAppIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400 fill-emerald-500 dark:fill-emerald-400 shrink-0 mt-0.5" />
                <a
                  href={`https://wa.me/${CONTACT_INFO.whatsapp.number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  {CONTACT_INFO.whatsapp.display}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Instagram className="w-4 h-4 text-pink-500 dark:text-pink-400 shrink-0 mt-0.5" />
                <a href={CONTACT_INFO.instagram.url} target="_blank" rel="noopener noreferrer" className="hover:text-pink-600 dark:hover:text-white transition-colors">
                  @agenciasaraujo
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-gold-600 dark:text-gold shrink-0 mt-0.5" />
                <a href={`mailto:${CONTACT_INFO.email.address}`} className="hover:text-gold-600 dark:hover:text-white transition-colors">
                  {CONTACT_INFO.email.address}
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-8 border-t border-stone-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {currentYear} {CONTACT_INFO.legalName}. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            Feito com carinho para eternizar momentos no RJ.
          </p>
        </div>
      </div>
    </footer>
  );
}
