
import React, { useState } from 'react';
import { Settings, X, User, Bell, Plug, Moon, Sun, Monitor, Save, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('GENERAL');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Settings size={20} className="text-slate-600" /> Paramètres
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded transition-colors"><X size={20} /></button>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar Tabs */}
            <div className="w-48 bg-slate-50 border-r border-gray-200 p-2 flex flex-col gap-1">
                <button onClick={() => setActiveTab('GENERAL')} className={`text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${activeTab === 'GENERAL' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200/50'}`}>
                    <Monitor size={16} /> Général
                </button>
                <button onClick={() => setActiveTab('PROFILE')} className={`text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${activeTab === 'PROFILE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200/50'}`}>
                    <User size={16} /> Profil
                </button>
                <button onClick={() => setActiveTab('NOTIFS')} className={`text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${activeTab === 'NOTIFS' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200/50'}`}>
                    <Bell size={16} /> Notifications
                </button>
                <button onClick={() => setActiveTab('INTEGRATIONS')} className={`text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${activeTab === 'INTEGRATIONS' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200/50'}`}>
                    <Plug size={16} /> Intégrations
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
                {activeTab === 'GENERAL' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wide">Apparence</h3>
                            <div className="flex gap-4">
                                <div className="border-2 border-blue-500 bg-blue-50 p-3 rounded-lg flex flex-col items-center gap-2 w-24 cursor-pointer">
                                    <Sun size={24} className="text-blue-600" />
                                    <span className="text-xs font-bold text-blue-700">Clair</span>
                                </div>
                                <div className="border border-gray-200 p-3 rounded-lg flex flex-col items-center gap-2 w-24 cursor-pointer hover:border-gray-300 opacity-50">
                                    <Moon size={24} className="text-slate-600" />
                                    <span className="text-xs font-medium text-slate-600">Sombre</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wide">Langue</h3>
                            <select className="w-full border-gray-300 rounded-lg text-sm p-2.5">
                                <option>Français (France)</option>
                                <option>English (US)</option>
                            </select>
                        </div>
                    </div>
                )}
                 {activeTab === 'PROFILE' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <img src="https://ui-avatars.com/api/?name=Alice&background=0D8ABC&color=fff&rounded=true&bold=true" className="w-16 h-16 rounded-full border-2 border-gray-200" />
                            <div>
                                <button className="text-xs bg-white border border-gray-300 px-3 py-1.5 rounded font-medium hover:bg-gray-50">Changer l'avatar</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Prénom</label>
                                <input type="text" value="Alice" className="w-full border-gray-300 rounded-lg text-sm bg-gray-50" readOnly />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nom</label>
                                <input type="text" value="Agent" className="w-full border-gray-300 rounded-lg text-sm bg-gray-50" readOnly />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                            <input type="text" value="alice@lightcrm.com" className="w-full border-gray-300 rounded-lg text-sm bg-gray-50" readOnly />
                        </div>
                    </div>
                )}
                {activeTab === 'INTEGRATIONS' && (
                    <div className="space-y-4">
                        <div className="p-4 border border-green-200 bg-green-50 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl shadow-sm">⚡</div>
                                <div>
                                    <p className="font-bold text-slate-800">Sellsy CRM</p>
                                    <p className="text-xs text-green-700 flex items-center gap-1"><Check size={10} /> Connecté</p>
                                </div>
                            </div>
                            <button className="text-xs text-red-600 font-medium hover:underline">Déconnecter</button>
                        </div>
                        <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl shadow-sm">🤖</div>
                                <div>
                                    <p className="font-bold text-slate-800">n8n Automation</p>
                                    <p className="text-xs text-blue-700 flex items-center gap-1"><Check size={10} /> Workflow actif</p>
                                </div>
                            </div>
                            <button className="text-xs text-slate-500 font-medium hover:underline">Configurer</button>
                        </div>
                    </div>
                )}
                {activeTab === 'NOTIFS' && (
                     <div className="space-y-4">
                        <label className="flex items-center justify-between cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors">
                            <span className="text-sm font-medium text-slate-700">Sons de notification</span>
                            <div className="w-10 h-5 bg-blue-600 rounded-full relative">
                                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                            </div>
                        </label>
                        <label className="flex items-center justify-between cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors">
                            <span className="text-sm font-medium text-slate-700">Alertes navigateur</span>
                            <div className="w-10 h-5 bg-blue-600 rounded-full relative">
                                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                            </div>
                        </label>
                        <label className="flex items-center justify-between cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors">
                            <span className="text-sm font-medium text-slate-700">Emails récapitulatifs</span>
                            <div className="w-10 h-5 bg-gray-300 rounded-full relative">
                                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                            </div>
                        </label>
                    </div>
                )}
            </div>
        </div>
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 text-slate-600 text-sm font-medium hover:text-slate-800 mr-2">Annuler</button>
            <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Save size={16} /> Enregistrer
            </button>
        </div>
      </div>
    </div>
  );
};
