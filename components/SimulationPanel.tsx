import React from 'react';
import { FlaskConical, MailPlus, Reply, ArchiveRestore, X, User, CheckCircle2, RotateCcw } from 'lucide-react';

interface SimulationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNewLead: () => void;
  onReplyToOpen: () => void;
  onReplyToArchived: () => void;
  onColleagueReply: () => void;
  onSellsyUpdate: () => void;
  onReset: () => void;
}

export const SimulationPanel: React.FC<SimulationPanelProps> = ({ 
  isOpen, 
  onClose, 
  onNewLead, 
  onReplyToOpen, 
  onReplyToArchived,
  onColleagueReply,
  onSellsyUpdate,
  onReset
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 left-4 w-72 bg-white rounded-xl shadow-2xl border border-indigo-200 overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-5">
      <div className="bg-indigo-600 p-3 flex justify-between items-center text-white">
        <div className="flex items-center gap-2 font-bold text-sm">
            <FlaskConical size={16} />
            <span>Simulateur d'événements</span>
        </div>
        <button onClick={onClose} className="hover:bg-indigo-700 p-1 rounded">
            <X size={14} />
        </button>
      </div>
      
      <div className="p-2 space-y-1 bg-white">
        <button 
            onClick={onNewLead}
            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3 group border border-transparent hover:border-gray-100"
        >
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <MailPlus size={16} />
            </div>
            <div>
                <p className="text-xs font-bold text-slate-800">Nouveau Lead</p>
                <p className="text-[10px] text-gray-500">Créer une tâche dans POOL</p>
            </div>
        </button>

        <button 
            onClick={onReplyToOpen}
            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3 group border border-transparent hover:border-gray-100"
        >
            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <Reply size={16} />
            </div>
            <div>
                <p className="text-xs font-bold text-slate-800">Réponse Client</p>
                <p className="text-[10px] text-gray-500">Sur dossier ouvert</p>
            </div>
        </button>
        
        <button 
            onClick={onColleagueReply}
            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3 group border border-transparent hover:border-gray-100"
        >
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <User size={16} />
            </div>
            <div>
                <p className="text-xs font-bold text-slate-800">Réponse Collègue</p>
                <p className="text-[10px] text-gray-500">Bob ou Charlie répondent</p>
            </div>
        </button>

        <button 
            onClick={onReplyToArchived}
            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3 group border border-transparent hover:border-gray-100"
        >
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <ArchiveRestore size={16} />
            </div>
            <div>
                <p className="text-xs font-bold text-slate-800">Réveil Archivé</p>
                <p className="text-[10px] text-gray-500">Le "Zombie Thread"</p>
            </div>
        </button>
        
        <button 
            onClick={onSellsyUpdate}
            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3 group border border-transparent hover:border-gray-100"
        >
            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                <CheckCircle2 size={16} />
            </div>
            <div>
                <p className="text-xs font-bold text-slate-800">Webhook Sellsy</p>
                <p className="text-[10px] text-gray-500">Validation contact externe</p>
            </div>
        </button>
      </div>
      
      <div className="bg-gray-50 p-2 border-t border-gray-100 flex justify-center">
        <button 
            onClick={onReset}
            className="text-[10px] font-bold text-red-400 hover:text-red-600 flex items-center gap-1 uppercase tracking-wide transition-colors"
        >
            <RotateCcw size={10} /> Reset Données
        </button>
      </div>
    </div>
  );
};