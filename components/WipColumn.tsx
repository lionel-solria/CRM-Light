
import React, { useState, useRef, useEffect } from 'react';
import { LayoutList, User as UserIcon, Users, X, Clock, PlayCircle, PauseCircle, MessageSquare, Layers, ArchiveRestore, UserPlus, ArrowDown } from 'lucide-react';
import { Task, TaskStatus, User } from '../types';
import { CURRENT_USER_ID } from '../constants';

interface WipColumnProps {
  tasks: Task[];
  users: User[];
  onSelectTask: (task: Task) => void;
  selectedTaskId?: string;
  onMoveTask: (taskId: string, status: TaskStatus, assigneeId?: string) => void;
}

export const WipColumn: React.FC<WipColumnProps> = ({ tasks, users, onSelectTask, selectedTaskId, onMoveTask }) => {
  const [viewMode, setViewMode] = useState<'ME' | 'TEAM'>('ME');
  const [selectedTeammateId, setSelectedTeammateId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING'>('ALL');
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragOverTeammateId, setDragOverTeammateId] = useState<string | null>(null);

  // Hover logic with debounce
  const [hoveredTask, setHoveredTask] = useState<Task | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = (task: Task) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
        setHoveredTask(task);
    }, 700); // 700ms delay
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredTask(null);
  };

  useEffect(() => {
    return () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);


  // Filter assigned AND pending tasks
  const wipTasks = tasks.filter((t) => t.status === TaskStatus.ASSIGNED || t.status === TaskStatus.PENDING);
  
  // Counts logic
  const myCount = wipTasks.filter(t => t.assigneeId === CURRENT_USER_ID).length;
  const teamCount = wipTasks.filter(t => t.assigneeId !== CURRENT_USER_ID).length;

  // Global Filter Logic
  const filteredTasks = wipTasks.filter(t => {
    // 1. Assignee Filter
    let assigneeMatch = false;
    if (viewMode === 'ME') {
        assigneeMatch = t.assigneeId === CURRENT_USER_ID;
    } else {
        // Team Mode
        if (selectedTeammateId) {
            assigneeMatch = t.assigneeId === selectedTeammateId;
        } else {
            assigneeMatch = t.assigneeId !== CURRENT_USER_ID;
        }
    }

    // 2. Status Filter
    let statusMatch = false;
    if (statusFilter === 'ALL') {
        statusMatch = true;
    } else if (statusFilter === 'ACTIVE') {
        statusMatch = t.status === TaskStatus.ASSIGNED;
    } else if (statusFilter === 'PENDING') {
        statusMatch = t.status === TaskStatus.PENDING;
    }

    return assigneeMatch && statusMatch;
  });

  const getAssignee = (id?: string): User | undefined => users.find(u => u.id === id);
  const teamUsers = users.filter(u => u.id !== CURRENT_USER_ID);

  const getTaskColorClass = (task: Task, isSelected: boolean) => {
      const isPending = task.status === TaskStatus.PENDING;
      const baseClass = "bg-white border-l-[6px] border-t border-r border-b border-gray-200";

      if (isSelected) return 'bg-white border-blue-400 shadow-sm border-l-[6px] border-l-blue-600 ring-2 ring-blue-100';
      
      if (isPending) return `${baseClass} bg-amber-50/80 border-l-amber-500 border-amber-200 hover:border-amber-300`;
      
      // Zombie Logic (si jamais un ticket zombie arrive ici directement)
      if (task.isZombie) return `${baseClass} bg-purple-50/50 border-l-purple-500 hover:border-purple-300`;
      
      // Urgent (Priorité 1)
      if (task.tags?.includes('Urgent')) return `${baseClass} bg-red-50/30 border-l-red-600 hover:border-red-300`;

      // Dense Logic
      if (task.messages.length > 3) return `${baseClass} border-l-orange-400 hover:border-orange-300`;

      return `${baseClass} hover:border-blue-300 border-l-gray-300`;
  };

  // --- Drag & Drop Handlers ---
  
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Prevent flickering when entering child elements
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
        // Drop dans la zone principale = s'assigner le ticket
        onMoveTask(taskId, TaskStatus.ASSIGNED, CURRENT_USER_ID);
        // On switch la vue pour voir le ticket arriver
        setViewMode('ME');
    }
  };

  // Drop sur avatar collègue
  const handleDragEnterTeammate = (e: React.DragEvent, userId: string) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOverTeammateId(userId);
  }

  const handleDragLeaveTeammate = (e: React.DragEvent) => {
      if (e.currentTarget.contains(e.relatedTarget as Node)) return;
      setDragOverTeammateId(null);
  }

  const handleDropOnTeammate = (e: React.DragEvent, userId: string) => {
      e.stopPropagation();
      e.preventDefault();
      setDragOverTeammateId(null);
      // Reset main drag state too as we are done
      setIsDragOver(false); 
      
      const taskId = e.dataTransfer.getData('taskId');
      if (taskId) {
          onMoveTask(taskId, TaskStatus.ASSIGNED, userId);
      }
  }

  return (
    <div 
        className={`w-80 flex flex-col border-r border-gray-200 bg-white h-full flex-shrink-0 relative transition-colors ${isDragOver ? 'bg-indigo-50/50' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
    >
      {/* Header & Filter */}
      <div className="p-4 border-b border-gray-200 bg-white relative z-10">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2 mb-3">
          <LayoutList size={16} />
          En Cours
        </h2>
        
        {/* Primary Filter: Me vs Team */}
        <div className="flex bg-gray-100 p-1 rounded-lg mb-2">
          <button
            onClick={() => { setViewMode('ME'); setSelectedTeammateId(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${
              viewMode === 'ME'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <UserIcon size={12} />
            Moi
            <span className={`ml-1 text-[10px] px-1.5 rounded-full ${viewMode === 'ME' ? 'bg-blue-100 text-blue-700' : 'bg-gray-300 text-gray-600'}`}>
              {myCount}
            </span>
          </button>
          <button
            onClick={() => setViewMode('TEAM')}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${
              viewMode === 'TEAM'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users size={12} />
            Équipe
            <span className={`ml-1 text-[10px] px-1.5 rounded-full ${viewMode === 'TEAM' ? 'bg-blue-100 text-blue-700' : 'bg-gray-300 text-gray-600'}`}>
              {teamCount}
            </span>
          </button>
        </div>

        {/* Secondary Filter: Status (All, Active, Pending) */}
        <div className="flex gap-1 mb-2">
            <button 
                onClick={() => setStatusFilter('ALL')}
                className={`flex-1 py-1 text-[10px] font-bold uppercase rounded border transition-colors ${statusFilter === 'ALL' ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-500 border-gray-200 hover:bg-gray-50'}`}
            >
                Tout
            </button>
            <button 
                onClick={() => setStatusFilter('ACTIVE')}
                className={`flex-1 py-1 text-[10px] font-bold uppercase rounded border transition-colors flex items-center justify-center gap-1 ${statusFilter === 'ACTIVE' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-gray-200 hover:bg-blue-50'}`}
            >
                <PlayCircle size={10} /> Actifs
            </button>
            <button 
                onClick={() => setStatusFilter('PENDING')}
                className={`flex-1 py-1 text-[10px] font-bold uppercase rounded border transition-colors flex items-center justify-center gap-1 ${statusFilter === 'PENDING' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-500 border-gray-200 hover:bg-amber-50'}`}
            >
                <PauseCircle size={10} /> Attente
            </button>
        </div>

        {/* Team Filters (Avatars) & Drop Zones */}
        <div className={`flex gap-2 pb-1 overflow-x-auto no-scrollbar items-center mt-2 border-t pt-2 transition-colors ${isDragOver ? 'border-blue-200 bg-blue-50/50 rounded-lg p-2' : 'border-gray-100'}`}>
            <span className={`text-[10px] font-medium uppercase mr-1 whitespace-nowrap ${isDragOver ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                {isDragOver ? 'Déposer sur :' : (viewMode === 'TEAM' ? 'Filtrer :' : 'Transférer :')}
            </span>
            {teamUsers.map(user => {
                const isSelected = selectedTeammateId === user.id;
                const isTarget = dragOverTeammateId === user.id;
                
                // Active le mode "Drop Zone" si on drag over la colonne OU spécifiquement l'avatar
                const isDropZoneActive = isDragOver || isTarget;

                return (
                    <div
                        key={user.id}
                        onDragOver={(e) => handleDragEnterTeammate(e, user.id)}
                        onDragLeave={handleDragLeaveTeammate}
                        onDrop={(e) => handleDropOnTeammate(e, user.id)}
                        className={`relative transition-all duration-200 p-1 rounded-xl ${isTarget ? 'scale-110 z-20 bg-green-100' : (isDropZoneActive ? 'bg-white shadow-sm scale-105' : '')}`}
                    >
                        <button 
                            onClick={() => {
                                setViewMode('TEAM');
                                setSelectedTeammateId(isSelected ? null : user.id);
                            }}
                            className={`relative rounded-full transition-all block ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : 'opacity-80 hover:opacity-100'}`}
                            title={`Transférer à ${user.name}`}
                        >
                            <img 
                                src={user.avatar} 
                                alt={user.name} 
                                className={`w-8 h-8 rounded-full border-2 ${isTarget ? 'border-green-500' : (isDropZoneActive ? 'border-blue-300 border-dashed' : 'border-gray-200')}`} 
                            />
                            {isSelected && (
                                <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-0.5 w-3 h-3 flex items-center justify-center">
                                    <X size={8} />
                                </div>
                            )}
                            {isTarget && (
                                <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5 w-4 h-4 flex items-center justify-center animate-bounce">
                                    <UserPlus size={10} />
                                </div>
                            )}
                        </button>
                    </div>
                )
            })}
        </div>
      </div>

      {isDragOver && !dragOverTeammateId && (
          <div className="absolute inset-0 z-20 bg-indigo-50/90 backdrop-blur-[1px] flex items-center justify-center border-2 border-dashed border-indigo-400 m-2 rounded-xl pointer-events-none">
              <div className="text-indigo-600 font-bold flex flex-col items-center gap-2 animate-bounce p-4 bg-white/80 rounded-xl shadow-lg">
                  <ArrowDown size={32} />
                  <span>S'attribuer ce ticket</span>
                  <span className="text-[10px] font-normal text-indigo-400">(Ou glissez sur un collègue pour transférer)</span>
              </div>
          </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 relative">
        {filteredTasks.length === 0 ? (
          <div className="text-center p-8 text-gray-400 text-sm">
            {viewMode === 'TEAM' && selectedTeammateId 
                ? "Ce collaborateur n'a pas de dossier correspondant."
                : statusFilter === 'PENDING' 
                    ? "Aucun dossier en attente." 
                    : "Aucun dossier en cours."}
          </div>
        ) : (
          filteredTasks.map((task) => {
            const assignee = getAssignee(task.assigneeId);
            const isPending = task.status === TaskStatus.PENDING;
            
            return (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                onClick={() => onSelectTask(task)}
                onMouseEnter={() => handleMouseEnter(task)}
                onMouseLeave={handleMouseLeave}
                className={`group relative cursor-pointer p-3 rounded-lg transition-all ${getTaskColorClass(task, selectedTaskId === task.id)}`}
              >
                <div className="flex justify-between items-center mb-2">
                    {isPending ? (
                        <span className="text-[10px] font-bold tracking-wider text-amber-700 uppercase bg-amber-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Clock size={10} /> EN ATTENTE
                        </span>
                    ) : (
                        <div className="flex items-center gap-2">
                             <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase bg-gray-100 px-1.5 py-0.5 rounded">
                                {task.step}
                             </span>
                             {task.isZombie && <ArchiveRestore size={12} className="text-purple-600" title="Zombie Thread" />}
                        </div>
                    )}
                  
                  {assignee && (
                     <img 
                        src={assignee.avatar} 
                        alt={assignee.name}
                        className="w-5 h-5 rounded-full border border-white shadow-sm"
                        title={`Assigné à ${assignee.name}`}
                     />
                  )}
                </div>
                
                <h3 className={`text-sm font-semibold mb-1 leading-snug ${isPending ? 'text-amber-900' : 'text-slate-800'}`}>
                  {task.subject}
                </h3>
                <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500">{task.companyName || task.clientName}</p>
                    <div className="flex items-center gap-2">
                        {/* Message Count */}
                        <div className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border ${task.messages.length > 3 ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-gray-50 text-gray-400 border-gray-100'}`} title="Nombre de messages">
                             {task.messages.length > 3 ? <Layers size={10} /> : <MessageSquare size={10} />}
                             <span>{task.messages.length}</span>
                        </div>
                        {task.unread && <span className="w-2 h-2 bg-blue-500 rounded-full" title="Nouveau message"></span>}
                    </div>
                </div>
              </div>
            );
          })
        )}
      </div>

       {/* Fixed Preview Panel */}
       {hoveredTask && (
          <div 
             className="fixed z-[100] w-72 bg-white rounded-r-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-left-2 duration-200 pointer-events-none"
             style={{ 
                 top: '5rem', // below header roughly
                 left: '40rem' // Assumes 320px + 320px. 
             }}
          >
             <div className="bg-slate-800 text-white p-2 text-[10px] font-bold uppercase tracking-wider flex justify-between">
                 <span>Aperçu en cours</span>
                 <span className="text-gray-400">{hoveredTask.step}</span>
             </div>
             <div className="p-3 bg-white max-h-64 overflow-hidden relative">
                <p className="text-xs text-gray-500 mb-2 font-mono">{hoveredTask.clientName}</p>
                <div className="text-xs text-slate-700 line-clamp-6 whitespace-pre-wrap">
                    {hoveredTask.messages[hoveredTask.messages.length - 1]?.content || "Aucun contenu..."}
                </div>
                <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white to-transparent"></div>
             </div>
          </div>
      )}
    </div>
  );
};
