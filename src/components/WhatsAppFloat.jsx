import React from 'react';
import WhatsAppIcon from './icons/WhatsAppIcon';
import { CONTACT_INFO } from '../config/contact';

export default function WhatsAppFloat() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center justify-center">
      {/* Pulsing ring */}
      <span className="absolute w-14 h-14 rounded-full bg-[#25D366] opacity-75 animate-ping pointer-events-none" />

      {/* Main official WhatsApp button */}
      <a
        href={`https://wa.me/${CONTACT_INFO.whatsapp.number}?text=${encodeURIComponent(CONTACT_INFO.whatsapp.defaultMessage)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="relative z-10 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-2xl shadow-emerald-600/50 transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-white/20"
        title="Falar no WhatsApp oficial"
        aria-label="Falar no WhatsApp com Agências Araújo"
      >
        <WhatsAppIcon className="w-8 h-8 text-white fill-white drop-shadow-md" />
      </a>
    </div>
  );
}
