
import React from 'react';
import { Bell, X, Check, Clock } from 'lucide-react';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const notifs = [
      { id: 1, text: "Sarah Connor a répondu au ticket #T-9A12", time: "2 min", type: "message" },
      { id: 2, text: "Opportunité #T-8X29 synchronisée Sellsy", time: "1h", type: "sync" },
      { id: 3, text: "Nouveau lead assigné : StartUp IO", time: "3h", type: "assign" }
  ];

  return (
    // Positioned relative to sidebar (left: 64px)
    <div className="fixed top-0 left-16 h-full w-80 bg-white shadow-2xl border-r border-gray-200 z-40 animate-in slide-in-from-left-10 duration-200">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <Bell size={18} className="text-blue-600" /> Notifications
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto h-full pb-20">
            {notifs.map(n => (
                <div key={n.id} className="p-4 border-b border-gray-50 hover:bg-blue-50 transition-colors cursor-pointer group">
                    <p className="text-sm text-slate-800 font-medium mb-1 group-hover:text-blue-700">{n.text}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={10} /> {n.time}
                    </div>
                </div>
            ))}
             <div className="p-8 text-center text-gray-400 text-xs">
                Aucune autre notification récente.
            </div>
        </div>
    </div>
  );
};
