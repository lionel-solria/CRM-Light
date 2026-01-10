
import React from 'react';
import { HelpCircle, X, Keyboard, BookOpen, MessageCircle, ExternalLink } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50">
            <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <HelpCircle size={24} className="text-indigo-600" /> Centre d'Aide
                </h2>
                <p className="text-xs text-slate-500 mt-1">Documentation, raccourcis et support.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-4">
                <a href="#" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-center group">
                    <BookOpen size={24} className="text-indigo-600 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-sm text-slate-700">Guide Utilisateur</span>
                </a>
                <a href="#" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-center group">
                    <MessageCircle size={24} className="text-indigo-600 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-sm text-slate-700">Contacter le Support</span>
                </a>
                <a href="#" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-center group">
                    <ExternalLink size={24} className="text-indigo-600 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-sm text-slate-700">API Documentation</span>
                </a>
            </div>

            {/* FAQ */}
            <div>
                <h3 className="text-sm font-bold uppercase text-slate-500 mb-4 tracking-wider">Questions Fréquentes</h3>
                <div className="space-y-3">
                    <details className="group bg-gray-50 rounded-lg p-3 cursor-pointer">
                        <summary className="font-medium text-slate-800 flex items-center justify-between list-none">
                            Comment attribuer un ticket à un collègue ?
                            <span className="group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <p className="text-sm text-slate-600 mt-2 pl-2 border-l-2 border-indigo-200">
                            Glissez-déposez le ticket depuis la colonne "En cours" directement sur l'avatar de votre collègue dans la barre de filtres.
                        </p>
                    </details>
                    <details className="group bg-gray-50 rounded-lg p-3 cursor-pointer">
                        <summary className="font-medium text-slate-800 flex items-center justify-between list-none">
                            Comment fonctionne la synchronisation Sellsy ?
                            <span className="group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <p className="text-sm text-slate-600 mt-2 pl-2 border-l-2 border-indigo-200">
                            LightCRM détecte automatiquement si l'email client existe dans Sellsy. Si non, utilisez le bouton "Client Inconnu" pour créer la fiche. Une fois lié, vous pouvez envoyer des devis.
                        </p>
                    </details>
                    <details className="group bg-gray-50 rounded-lg p-3 cursor-pointer">
                        <summary className="font-medium text-slate-800 flex items-center justify-between list-none">
                            Qu'est-ce qu'un "Zombie Thread" ?
                            <span className="group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <p className="text-sm text-slate-600 mt-2 pl-2 border-l-2 border-indigo-200">
                            C'est un dossier archivé qui reçoit une nouvelle réponse client. Il réapparaît automatiquement dans le Pool avec une bordure violette spécifique.
                        </p>
                    </details>
                </div>
            </div>

            {/* Shortcuts */}
            <div>
                 <h3 className="text-sm font-bold uppercase text-slate-500 mb-4 tracking-wider flex items-center gap-2">
                    <Keyboard size={16} /> Raccourcis Clavier
                 </h3>
                 <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                     <div className="flex justify-between text-sm border-b border-gray-100 py-1">
                         <span className="text-slate-600">Envoyer le message</span>
                         <kbd className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono font-bold text-slate-700">Enter</kbd>
                     </div>
                     <div className="flex justify-between text-sm border-b border-gray-100 py-1">
                         <span className="text-slate-600">Saut de ligne</span>
                         <kbd className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono font-bold text-slate-700">Shift + Enter</kbd>
                     </div>
                     <div className="flex justify-between text-sm border-b border-gray-100 py-1">
                         <span className="text-slate-600">Fermer modale</span>
                         <kbd className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono font-bold text-slate-700">Esc</kbd>
                     </div>
                      <div className="flex justify-between text-sm border-b border-gray-100 py-1">
                         <span className="text-slate-600">Ouvrir Spotlight</span>
                         <kbd className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono font-bold text-slate-700">Cmd + K</kbd>
                     </div>
                 </div>
            </div>
        </div>

        <div className="p-4 bg-gray-50 text-center text-xs text-gray-400 border-t border-gray-200">
            Version 1.4.2 • Build 2024.05.20
        </div>
      </div>
    </div>
  );
};
