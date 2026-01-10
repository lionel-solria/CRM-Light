
import React from 'react';
import { LayoutGrid, Database, FlaskConical, Settings, Bell, LogOut, HelpCircle } from 'lucide-react';
import { CURRENT_USER_ID } from '../constants';
import { User } from '../types';

interface SidebarProps {
  users: User[];
  onOpenAdmin: () => void;
  onOpenSimulation: () => void;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  activeView: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
    users,
    onOpenAdmin, 
    onOpenSimulation, 
    onOpenNotifications,
    onOpenSettings,
    onOpenHelp,
    activeView 
}) => {
  const currentUser = users.find(u => u.id === CURRENT_USER_ID);

  return (
    <nav className="w-16 h-full bg-slate-900 flex flex-col items-center py-6 flex-shrink-0 z-50 shadow-xl border-r border-slate-800">
      {/* Logo Area */}
      <div className="mb-8">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50">
           <span className="font-bold text-white text-lg">L</span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex flex-col gap-4 w-full px-2">
        <NavItem 
            icon={<LayoutGrid size={20} />} 
            isActive={true} 
            label="Tableau de bord" 
        />
        <NavItem 
            icon={<Bell size={20} />} 
            isActive={false} 
            label="Notifications" 
            badge={3}
            onClick={onOpenNotifications}
        />
        <div className="w-full h-px bg-slate-800 my-2"></div>
        <NavItem 
            icon={<FlaskConical size={20} />} 
            isActive={false} 
            label="Simulateur" 
            onClick={onOpenSimulation}
            colorClass="text-indigo-400 hover:text-indigo-300"
        />
        <NavItem 
            icon={<Database size={20} />} 
            isActive={false} 
            label="Base de données" 
            onClick={onOpenAdmin}
        />
      </div>

      {/* Bottom Area */}
      <div className="mt-auto flex flex-col gap-4 w-full px-2 items-center">
        <NavItem 
            icon={<HelpCircle size={20} />} 
            isActive={false} 
            label="Aide" 
            onClick={onOpenHelp}
        />
        <NavItem 
            icon={<Settings size={20} />} 
            isActive={false} 
            label="Paramètres" 
            onClick={onOpenSettings}
        />
        
        <div className="mt-2 pt-4 border-t border-slate-800 w-full flex flex-col items-center gap-3">
             <div className="relative group cursor-pointer">
                <img 
                    src={currentUser?.avatar || 'https://ui-avatars.com/api/?name=User'} 
                    alt="Profile" 
                    className="w-9 h-9 rounded-full border-2 border-slate-700 group-hover:border-blue-500 transition-colors object-cover"
                />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-900 rounded-full"></div>
             </div>
             <button className="text-slate-500 hover:text-red-400 transition-colors">
                <LogOut size={18} />
             </button>
        </div>
      </div>
    </nav>
  );
};

const NavItem: React.FC<{ 
    icon: React.ReactNode, 
    isActive: boolean, 
    label: string, 
    onClick?: () => void,
    badge?: number,
    colorClass?: string
}> = ({ icon, isActive, label, onClick, badge, colorClass }) => {
    return (
        <button 
            onClick={onClick}
            className={`
                group relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 mx-auto
                ${isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'bg-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-100'}
                ${colorClass ? colorClass : ''}
            `}
            title={label}
        >
            {icon}
            {badge && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-slate-900">
                    {badge}
                </span>
            )}
            
            {/* Tooltip on Hover */}
            <div className="absolute left-14 bg-slate-900 text-white text-xs font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-slate-700 shadow-xl">
                {label}
            </div>
        </button>
    )
}
