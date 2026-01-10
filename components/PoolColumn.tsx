
import React, { useState, useRef, useEffect } from 'react';
import { Mail, Clock, ArrowRight, MessageSquare, Filter, Zap, ArchiveRestore, Layers, Download } from 'lucide-react';
import { Task, TaskStatus } from '../types';

interface PoolColumnProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  selectedTaskId?: string;
  onTakeTask: (taskId: string) => void;
  onMoveTask: (taskId: string, status: TaskStatus, assigneeId?: string) => void;
}

export const PoolColumn: React.FC<PoolColumnProps> = ({ tasks, onSelectTask, selectedTaskId, onTakeTask, onMoveTask }) => {
  const [hoveredTask, setHoveredTask] = useState<Task | null>(null);
  const [tagFilter, setTagFilter] = useState<string | 'ALL'>('ALL');
  const [isDragOver, setIsDragOver] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const poolTasks = tasks.filter((t) => t.status === TaskStatus.POOL);
  
  // Extraire les tags uniques
  const allTags = Array.from(new Set(poolTasks.flatMap(t => t.tags || [])));

  const filteredTasks = poolTasks.filter(t => {
      if (tagFilter === 'ALL') return true;
      return t.tags?.includes(tagFilter);
  });

  const handleMouseEnter = (task: Task) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
        setHoveredTask(task);
    }, 700);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredTask(null);
  };

  // Correction bug : Forcer la fermeture du tooltip si la tâche disparait (est prise)
  const handleTakeTaskClick = (e: React.MouseEvent, taskId: string) => {
      e.stopPropagation();
      setHoveredTask(null);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      onTakeTask(taskId);
  };

  useEffect(() => {
    return () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  // Détermine la classe CSS en fonction du type de ticket (Couleurs renforcées)
  const getTaskColorClass = (task: Task, isSelected: boolean) => {
      const baseClass = "bg-white border-l-[6px]"; // Bordure plus épaisse
      
      if (isSelected) return 'bg-blue-50 border-blue-400 ring-2 ring-blue-300 border-l-[6px] border-l-blue-600';
      
      // Urgent (Priorité 1)
      if (task.tags?.includes('Urgent')) return `${baseClass} border-l-red-600 bg-red-50/50 hover:border-red-400 border-t border-r border-b border-gray-100`;

      // Zombie (Réveil d'archive) -> Violet
      if (task.isZombie) return `${baseClass} border-l-purple-600 bg-purple-50/50 hover:border-purple-400 border-t border-r border-b border-gray-100`;
      
      // Conversation dense (+3 messages) -> Orange/Attention
      if (task.messages.length > 3) return `${baseClass} border-l-orange-500 hover:border-orange-300 border-t border-r border-b border-gray-100`;
      
      // Nouveau standard -> Bleu
      return `${baseClass} border-l-blue-500 hover:border-blue-300 border-t border-r border-b border-gray-100`;
  };

  // --- Drag & Drop Handlers ---

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
      e.dataTransfer.setData('taskId', taskId);
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault(); // Nécesaire pour autoriser le drop
      setIsDragOver(true);
  };

  const handleDragLeave = () => {
      setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const taskId = e.dataTransfer.getData('taskId');
      if (taskId) {
          // Déplacer vers le Pool (Désassigner)
          onMoveTask(taskId, TaskStatus.POOL, undefined);
      }
  };

  return (
    <div 
        className={`w-80 flex flex-col border-r border-gray-200 bg-white h-full flex-shrink-0 relative transition-colors ${isDragOver ? 'bg-blue-50/50' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
    >
      <div className="p-4 border-b border-gray-100 bg-white relative z-10">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2 mb-3">
          <Mail size={16} />
          Réception (Pool)
          <span className="ml-auto bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {poolTasks.length}
          </span>
        </h2>

        {/* Tag Filters */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
             <button
                onClick={() => setTagFilter('ALL')}
                className={`flex-shrink-0 px-2 py-1 text-[10px] font-bold uppercase rounded border transition-colors ${tagFilter === 'ALL' ? 'bg-slate-800 text-white border-slate-800' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
             >
                 TOUT
             </button>
             {allTags.map(tag => (
                 <button
                    key={tag}
                    onClick={() => setTagFilter(tag)}
                    className={`flex-shrink-0 px-2 py-1 text-[10px] font-bold uppercase rounded border transition-colors ${tagFilter === tag ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200 hover:bg-blue-50'}`}
                 >
                     {tag}
                 </button>
             ))}
        </div>
      </div>

      {isDragOver && (
          <div className="absolute inset-0 z-20 bg-blue-100/80 backdrop-blur-sm flex items-center justify-center border-2 border-dashed border-blue-400 m-2 rounded-xl">
              <div className="text-blue-700 font-bold flex flex-col items-center gap-2 animate-bounce">
                  <Download size={32} />
                  <span>Relâcher pour désassigner</span>
              </div>
          </div>
      )}

      <div className="flex-1 overflow-y-auto p-2 space-y-2 relative">
        {filteredTasks.length === 0 ? (
          <div className="text-center p-8 text-gray-400 text-sm">
            Tout est calme... 🏖️
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => handleDragStart(e, task.id)}
              onClick={() => onSelectTask(task)}
              onMouseEnter={() => handleMouseEnter(task)}
              onMouseLeave={handleMouseLeave}
              className={`group relative p-3 rounded-lg transition-all cursor-pointer hover:shadow-md ${getTaskColorClass(task, selectedTaskId === task.id)}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-medium text-slate-500 bg-white/50 px-1.5 py-0.5 rounded border border-gray-100">
                  {task.id}
                </span>
                
                {/* Visual Badges */}
                <div className="flex gap-1">
                     {task.isZombie && <ArchiveRestore size={12} className="text-purple-600" title="Dossier réveillé (Archive)" />}
                     {task.messages.length > 3 && <Layers size={12} className="text-orange-500" title="Conversation longue" />}
                     {task.unread && <Zap size={12} className="text-blue-500" title="Nouveau message" />}
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={10} />
                  {task.receivedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                 {/* AI Tag */}
                {task.tags && task.tags.length > 0 && (
                    <span className={`text-[10px] uppercase font-bold px-1.5 rounded ${task.tags.includes('Urgent') ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                        {task.tags[0]}
                    </span>
                )}
              </div>

              <h3 className={`text-sm font-semibold mb-1 leading-snug ${task.unread ? 'text-slate-900' : 'text-slate-600'}`}>
                {task.subject}
              </h3>
              
              <div className="flex justify-between items-center mb-3">
                  <p className="text-xs text-gray-500 truncate max-w-[140px]">
                    {task.clientName}
                  </p>
                  
                  {/* Message Count Indicator */}
                  <div className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border ${task.messages.length > 3 ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-slate-50 text-slate-400 border-slate-100'}`} title="Nombre de messages">
                      <MessageSquare size={10} />
                      {task.messages.length}
                  </div>
              </div>
              
              <button
                onClick={(e) => handleTakeTaskClick(e, task.id)}
                className="w-full text-xs bg-white border border-gray-200 text-gray-700 py-1.5 rounded flex items-center justify-center gap-1 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
              >
                S'attribuer
                <ArrowRight size={12} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Fixed Preview Panel */}
      {hoveredTask && (
          <div className="fixed left-80 top-20 z-50 w-72 bg-white rounded-r-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-left-2 duration-200 pointer-events-none">
             <div className="bg-slate-800 text-white p-2 text-[10px] font-bold uppercase tracking-wider">
                 Aperçu rapide
             </div>
             <div className="p-3 bg-white max-h-64 overflow-hidden relative">
                <p className="text-xs text-gray-500 mb-2 font-mono">{hoveredTask.clientName}</p>
                <div className="text-xs text-slate-700 line-clamp-6">
                    {hoveredTask.messages[hoveredTask.messages.length - 1]?.content || "Aucun contenu..."}
                </div>
                <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white to-transparent"></div>
             </div>
          </div>
      )}
    </div>
  );
};
