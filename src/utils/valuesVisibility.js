import { useState, useEffect } from 'react';

const EVENT_NAME = 'admin_values_visibility_toggle';
const STORAGE_KEY = 'admin_show_values';

export const getStoredVisibility = () => {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    // Se ainda não foi definido, padrão é true para facilidade do admin ou false se preferir privacidade
    // Se o usuário quer alternar com o ícone, podemos inicializar como true ou ler do storage
    return val === 'true';
  } catch {
    return false;
  }
};

export const setStoredVisibility = (visible) => {
  try {
    localStorage.setItem(STORAGE_KEY, String(visible));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { visible } }));
  } catch (e) {
    console.warn('Erro ao salvar visibilidade de valores:', e);
  }
};

export const toggleStoredVisibility = () => {
  const next = !getStoredVisibility();
  setStoredVisibility(next);
  return next;
};

/**
 * Hook do React para sincronizar o estado do ícone de olho em qualquer módulo do Admin
 */
export const useValuesVisibility = () => {
  const [showValues, setShowValues] = useState(() => getStoredVisibility());

  useEffect(() => {
    const handleToggle = (e) => {
      if (e?.detail?.visible !== undefined) {
        setShowValues(e.detail.visible);
      } else {
        setShowValues(getStoredVisibility());
      }
    };

    window.addEventListener(EVENT_NAME, handleToggle);
    window.addEventListener('storage', handleToggle);

    return () => {
      window.removeEventListener(EVENT_NAME, handleToggle);
      window.removeEventListener('storage', handleToggle);
    };
  }, []);

  const toggle = () => {
    const next = toggleStoredVisibility();
    setShowValues(next);
  };

  return { showValues, toggleShowValues: toggle, setShowValues };
};
