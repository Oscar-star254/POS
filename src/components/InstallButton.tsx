import React, { useEffect, useState } from 'react';
import { Check, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallButton({ compact = false }: { compact?: boolean }) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(
    () => window.matchMedia('(display-mode: standalone)').matches,
  );

  useEffect(() => {
    const handlePrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const install = async () => {
    if (installed) return;
    if (!installPrompt) {
      window.alert('To install Zawadi POS, open your browser menu and choose “Install app” or “Add to Home Screen”.');
      return;
    }
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') setInstalled(true);
    setInstallPrompt(null);
  };

  return (
    <button
      type="button"
      onClick={install}
      className={compact ? 'btn-ghost px-2.5 py-1.5 text-xs' : 'btn-ghost w-full justify-center py-2.5'}
      title={installed ? 'Zawadi POS is installed' : 'Install Zawadi POS on this device'}
    >
      {installed ? <Check size={14} /> : <Download size={14} />}
      <span className={compact ? 'hidden md:inline' : ''}>
        {installed ? 'Installed' : 'Download app'}
      </span>
    </button>
  );
}
