
import React, { useState, useEffect } from 'react';
import { UserPlus, Building2, Save, X, Search, CheckCircle2, AlertCircle, Loader2, Phone, Mail, PlusCircle } from 'lucide-react';
import { Task, SellsyStatus } from '../types';

interface ContactModalProps {
  task: Task;
  onClose: () => void;
  onUpdateContact: (taskId: string, details: { name: string, company: string, phone: string }) => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ task, onClose, onUpdateContact }) => {
  const [loading, setLoading] = useState(true);
  const [sellsyState, setSellsyState] = useState<'FOUND' | 'NOT_FOUND' | 'CHECKING'>('CHECKING');
  
  const [name, setName] = useState(task.clientName);
  const [company, setCompany] = useState(task.companyName || '');
  const [phone, setPhone] = useState(task.clientPhone || '');
  
  // New state for company matching
  const [companyStatus, setCompanyStatus] = useState<'EXISTING' | 'NEW' | 'UNKNOWN'>('UNKNOWN');

  // Simulation d'un appel API Sellsy au montage
  useEffect(() => {
    const checkSellsy = async () => {
      setSellsyState('CHECKING');
      setTimeout(() => {
        // Logique simulée : Si le statut est déjà SYNCED ou si l'email ne contient pas "spam", on trouve
        if (task.sellsyStatus === SellsyStatus.SYNCED) {
           setSellsyState('FOUND');
           setCompanyStatus('EXISTING');
        } else {
           setSellsyState('NOT_FOUND');
           // Si une société est déjà renseignée, on présume qu'elle est nouvelle
           if (task.companyName) setCompanyStatus('NEW');
        }
        setLoading(false);
      }, 1000);
    };
    checkSellsy();
  }, [task]);

  // Détecte le changement de nom de société
  const handleCompanyChange = (val: string) => {
      setCompany(val);
      // Simulation: Si on tape quelque chose et qu'on était pas déjà sync, ça devient une nouvelle société
      if (val.length > 2 && sellsyState !== 'FOUND') {
          setCompanyStatus('NEW');
      } else if (val.length === 0) {
          setCompanyStatus('UNKNOWN');
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulation API Update
    setTimeout(() => {
        onUpdateContact(task.id, { name, company, phone });
        onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className={`p-5 border-b flex justify-between items-center ${sellsyState === 'FOUND' ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-full ${sellsyState === 'FOUND' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                {loading ? <Loader2 size={20} className="animate-spin" /> : sellsyState === 'FOUND' ? <CheckCircle2 size={20} /> : <UserPlus size={20} />}
             </div>
             <div>
                <h3 className={`font-bold text-lg ${sellsyState === 'FOUND' ? 'text-green-800' : 'text-slate-800'}`}>
                    {loading ? 'Recherche Sellsy...' : sellsyState === 'FOUND' ? 'Contact Sellsy Identifié' : 'Qualification Contact'}
                </h3>
                <p className="text-xs opacity-80 text-slate-600">
                    {loading ? 'Interrogation de l\'API...' : sellsyState === 'FOUND' ? 'Ce contact est déjà synchronisé.' : 'Créez ou reliez ce contact à Sellsy.'}
                </p>
             </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            {/* Read Only / Search Key */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center gap-3">
                <Mail size={18} className="text-gray-400" />
                <div className="flex-1">
                    <p className="text-xs font-bold text-gray-500 uppercase">Email (Clé unique)</p>
                    <p className="text-sm font-mono text-slate-900">{task.clientEmail}</p>
                </div>
                <div className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Read-only</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Nom Complet</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            className="w-full pl-9 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 bg-white text-slate-900" 
                            placeholder="Prénom Nom"
                        />
                        <UserPlus size={16} className="absolute left-3 top-3 text-gray-400" />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Téléphone</label>
                    <div className="relative">
                        <input 
                            type="tel" 
                            value={phone} 
                            onChange={e => setPhone(e.target.value)} 
                            className="w-full pl-9 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 bg-white text-slate-900" 
                            placeholder="+33 6..."
                        />
                        <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Smart Company Input */}
            <div className="space-y-1">
                <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-500 uppercase">Société</label>
                    {companyStatus === 'NEW' && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 rounded font-bold">Nouv. Société</span>}
                    {companyStatus === 'EXISTING' && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 rounded font-bold">Existante</span>}
                </div>
                <div className="relative group">
                    <input 
                        type="text" 
                        value={company} 
                        onChange={e => handleCompanyChange(e.target.value)} 
                        className={`w-full pl-9 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 text-slate-900 transition-colors ${companyStatus === 'NEW' ? 'bg-green-50 border-green-300' : 'bg-white border-gray-300'}`} 
                        placeholder="Rechercher ou créer une société..."
                    />
                    <Building2 size={16} className={`absolute left-3 top-3 ${companyStatus === 'NEW' ? 'text-green-600' : 'text-gray-400'}`} />
                    
                    {/* Visual Indicator for Create Action */}
                    {companyStatus === 'NEW' && (
                        <div className="absolute right-3 top-2.5 flex items-center gap-1 text-green-600 animate-in fade-in">
                            <PlusCircle size={14} />
                            <span className="text-xs font-bold">Créer</span>
                        </div>
                    )}
                </div>
                {companyStatus === 'UNKNOWN' && (
                    <p className="text-[10px] text-gray-400">Si la société n'est pas trouvée, saisissez son nom pour la créer.</p>
                )}
            </div>

            {/* API Status Info */}
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-200">
                <Search size={14} className="text-blue-500" />
                <span>
                    Source: API Sellsy v2 • 
                    {companyStatus === 'NEW' ? ' Création requise' : companyStatus === 'EXISTING' ? ' Fiche liée' : ' En attente'}
                </span>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-gray-100 mt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">
                    Annuler
                </button>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {sellsyState === 'FOUND' ? 'Mettre à jour' : 'Enregistrer & Lier'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};
