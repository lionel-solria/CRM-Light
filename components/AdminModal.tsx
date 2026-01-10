
import React, { useState } from 'react';
import { Database, X, Users, Layers, Filter, RotateCcw, UserPlus, Save } from 'lucide-react';
import { Task, TaskStatus, User } from '../types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  users: User[];
  onAddUser: (name: string, initials: string) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, tasks, users, onAddUser }) => {
  const [activeTab, setActiveTab] = useState<'TASKS' | 'USERS'>('TASKS');
  
  // Filters State
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState<string | 'ALL' | 'UNASSIGNED'>('ALL');

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserInitials, setNewUserInitials] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);

  if (!isOpen) return null;

  // Global Stats
  const total = tasks.length;
  const pool = tasks.filter(t => t.status === TaskStatus.POOL).length;
  const assigned = tasks.filter(t => t.status === TaskStatus.ASSIGNED).length;
  const pending = tasks.filter(t => t.status === TaskStatus.PENDING).length;
  const archived = tasks.filter(t => t.status === TaskStatus.ARCHIVED).length;

  // Filter Logic
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
    
    let matchesAssignee = true;
    if (assigneeFilter === 'ALL') {
        matchesAssignee = true;
    } else if (assigneeFilter === 'UNASSIGNED') {
        matchesAssignee = !task.assigneeId;
    } else {
        matchesAssignee = task.assigneeId === assigneeFilter;
    }

    return matchesStatus && matchesAssignee;
  });

  const resetFilters = () => {
      setStatusFilter('ALL');
      setAssigneeFilter('ALL');
  };

  const handleSubmitNewUser = (e: React.FormEvent) => {
      e.preventDefault();
      if(newUserName && newUserInitials) {
          onAddUser(newUserName, newUserInitials);
          setNewUserName('');
          setNewUserInitials('');
          setIsAddingUser(false);
      }
  };

  const hasActiveFilters = statusFilter !== 'ALL' || assigneeFilter !== 'ALL';

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-4 bg-slate-800 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Database size={20} className="text-blue-400" />
            <div>
              <h2 className="text-lg font-bold">Base de données (Admin)</h2>
              <p className="text-xs text-slate-400 font-mono">Firestore Clone • {total} Documents</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
            <button 
                onClick={() => setActiveTab('TASKS')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'TASKS' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                <Layers size={16} />
                Tâches & Dossiers
            </button>
            <button 
                onClick={() => setActiveTab('USERS')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'USERS' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                <Users size={16} />
                Collaborateurs
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-white flex flex-col">
            {activeTab === 'TASKS' ? (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 border-b border-gray-200 flex-shrink-0">
                        <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                            <p className="text-xs text-gray-500 uppercase font-bold">Total</p>
                            <p className="text-2xl font-bold text-slate-800">{total}</p>
                        </div>
                        <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                            <p className="text-xs text-gray-500 uppercase font-bold">En réception</p>
                            <p className="text-2xl font-bold text-blue-600">{pool}</p>
                        </div>
                        <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                            <p className="text-xs text-gray-500 uppercase font-bold">En cours</p>
                            <p className="text-2xl font-bold text-orange-500">{assigned}</p>
                        </div>
                        <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                            <p className="text-xs text-gray-500 uppercase font-bold">En attente</p>
                            <p className="text-2xl font-bold text-amber-500">{pending}</p>
                        </div>
                        <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                            <p className="text-xs text-gray-500 uppercase font-bold">Archivés</p>
                            <p className="text-2xl font-bold text-gray-400">{archived}</p>
                        </div>
                    </div>

                    {/* Filters Bar */}
                    <div className="p-3 border-b border-gray-100 flex items-center gap-3 bg-white sticky top-0 z-10">
                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                            <Filter size={16} />
                            Filtres :
                        </div>
                        
                        <select 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'ALL')}
                            className="text-sm border-gray-300 rounded-md py-1.5 pl-3 pr-8 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                            <option value="ALL">Tous les statuts</option>
                            <option value={TaskStatus.POOL}>Réception (POOL)</option>
                            <option value={TaskStatus.ASSIGNED}>En cours (WIP)</option>
                            <option value={TaskStatus.PENDING}>En attente (PENDING)</option>
                            <option value={TaskStatus.ARCHIVED}>Archivés</option>
                        </select>

                        <select 
                            value={assigneeFilter} 
                            onChange={(e) => setAssigneeFilter(e.target.value)}
                            className="text-sm border-gray-300 rounded-md py-1.5 pl-3 pr-8 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                            <option value="ALL">Tous les assignés</option>
                            <option value="UNASSIGNED">Non assigné</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>

                        {hasActiveFilters && (
                            <button 
                                onClick={resetFilters}
                                className="text-xs flex items-center gap-1 text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1.5 rounded transition-colors ml-auto"
                            >
                                <RotateCcw size={12} />
                                Réinitialiser
                            </button>
                        )}
                        
                        <div className="ml-auto text-xs text-gray-400 font-mono">
                            {filteredTasks.length} résultat(s)
                        </div>
                    </div>

                    {/* Table */}
                    <div className="p-0 flex-1 overflow-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-100 sticky top-0">
                                <tr>
                                    <th className="p-3 border-b">ID</th>
                                    <th className="p-3 border-b">Sujet</th>
                                    <th className="p-3 border-b">Client</th>
                                    <th className="p-3 border-b">Status</th>
                                    <th className="p-3 border-b">Assigné à</th>
                                    <th className="p-3 border-b">Dernière MàJ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredTasks.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-400 italic">
                                            Aucune tâche ne correspond à vos critères.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTasks.map(task => {
                                        const assigneeUser = users.find(u => u.id === task.assigneeId);
                                        return (
                                            <tr key={task.id} className="hover:bg-blue-50/50 transition-colors font-mono group">
                                                <td className="p-3 font-semibold text-blue-600">{task.id}</td>
                                                <td className="p-3 font-sans font-medium text-slate-800 truncate max-w-[200px]" title={task.subject}>
                                                    {task.subject}
                                                </td>
                                                <td className="p-3 text-slate-600">
                                                    <div className="flex flex-col">
                                                        <span>{task.clientName}</span>
                                                        <span className="text-[10px] text-gray-400">{task.companyName}</span>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    {task.status === TaskStatus.POOL && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">POOL</span>}
                                                    {task.status === TaskStatus.ASSIGNED && <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-bold">WIP</span>}
                                                    {task.status === TaskStatus.PENDING && <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-bold">PENDING</span>}
                                                    {task.status === TaskStatus.ARCHIVED && <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs font-bold">ARCHIVED</span>}
                                                </td>
                                                <td className="p-3 text-gray-500">
                                                    {assigneeUser ? (
                                                        <div className="flex items-center gap-2">
                                                            <img src={assigneeUser.avatar} alt="" className="w-5 h-5 rounded-full" />
                                                            <span className="text-xs">{assigneeUser.name}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-300">-</span>
                                                    )}
                                                </td>
                                                <td className="p-3 text-gray-400 text-xs">{task.updatedAt.toLocaleTimeString()}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div className="p-4">
                    {/* Add User Bar */}
                    <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
                        {!isAddingUser ? (
                             <button 
                                onClick={() => setIsAddingUser(true)}
                                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-medium"
                             >
                                 <UserPlus size={18} /> Ajouter un collaborateur
                             </button>
                        ) : (
                             <form onSubmit={handleSubmitNewUser} className="flex items-center gap-3 animate-in fade-in">
                                 <div className="flex-1">
                                     <input 
                                        autoFocus
                                        type="text" 
                                        placeholder="Nom complet" 
                                        className="w-full text-sm rounded border-gray-300"
                                        value={newUserName}
                                        onChange={e => setNewUserName(e.target.value)}
                                        required
                                     />
                                 </div>
                                 <div className="w-24">
                                     <input 
                                        type="text" 
                                        placeholder="Initiales" 
                                        className="w-full text-sm rounded border-gray-300 uppercase"
                                        value={newUserInitials}
                                        onChange={e => setNewUserInitials(e.target.value)}
                                        maxLength={3}
                                        required
                                     />
                                 </div>
                                 <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                                     <Save size={18} />
                                 </button>
                                 <button type="button" onClick={() => setIsAddingUser(false)} className="text-gray-400 hover:text-gray-600 p-2">
                                     <X size={18} />
                                 </button>
                             </form>
                        )}
                    </div>

                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-100 sticky top-0">
                            <tr>
                                <th className="p-3 border-b">Avatar</th>
                                <th className="p-3 border-b">Nom</th>
                                <th className="p-3 border-b">ID</th>
                                <th className="p-3 border-b">Initiales</th>
                                <th className="p-3 border-b">Charge actuelle</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map(user => {
                                const activeTasks = tasks.filter(t => t.assigneeId === user.id && t.status === TaskStatus.ASSIGNED).length;
                                return (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-3">
                                            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-gray-200" />
                                        </td>
                                        <td className="p-3 font-medium text-slate-800">{user.name}</td>
                                        <td className="p-3 font-mono text-gray-500">{user.id}</td>
                                        <td className="p-3"><span className="bg-gray-200 px-2 py-1 rounded text-xs font-bold text-gray-700">{user.initials}</span></td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${activeTasks > 2 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                                {activeTasks} Dossiers
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
        
        <div className="p-3 bg-gray-50 border-t border-gray-200 text-xs text-center text-gray-400">
             Vue administrateur en lecture seule. Données temps réel.
        </div>
      </div>
    </div>
  );
};
