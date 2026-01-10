
import React, { useState } from 'react';
import { 
  MessageSquare, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  UserPlus, 
  Building2,
  Archive,
  Phone,
  BrainCircuit,
  X,
  History,
  PauseCircle,
  PlayCircle
} from 'lucide-react';
import { Task, SellsyStatus, WorkflowStep, QuoteItem, TaskStatus } from '../types';
import { Chat } from './Chat';
import { Quoter } from './Quoter';
import { ContactModal } from './ContactModal';
import { generateTaskSummary } from '../services/ai';

interface WorkspaceProps {
  task?: Task;
  onUpdateQuote: (taskId: string, items: QuoteItem[]) => void;
  onSendMessage: (taskId: string, text: string) => void;
  onUpdateStep: (taskId: string, step: WorkflowStep) => void;
  onSyncSellsy: (taskId: string) => void;
  onArchiveTask: (taskId: string) => void;
  onTogglePending: (taskId: string) => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({ 
  task, 
  onUpdateQuote, 
  onSendMessage,
  onUpdateStep,
  onSyncSellsy,
  onArchiveTask,
  onTogglePending
}) => {
  const [activeTab, setActiveTab] = useState<'CHAT' | 'QUOTE'>('CHAT');
  const [showContactModal, setShowContactModal] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showEvents, setShowEvents] = useState(false);

  if (!task) {
    return (
      <div className="flex-1 h-full flex items-center justify-center bg-gray-50 text-gray-400 flex-col gap-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <MessageSquare size={32} className="opacity-50" />
        </div>
        <p>Sélectionnez un dossier pour commencer à travailler</p>
      </div>
    );
  }

  const steps = Object.values(WorkflowStep);
  const currentStepIndex = steps.indexOf(task.step);
  const isPending = task.status === TaskStatus.PENDING;

  const handleContactUpdate = (taskId: string, details: { name: string, company: string, phone: string }) => {
      onSyncSellsy(taskId);
  };

  const handleSummarize = async () => {
      if (summary) {
          setSummary(null); // Toggle off
          return;
      }
      setIsSummarizing(true);
      const res = await generateTaskSummary(task);
      setSummary(res);
      setIsSummarizing(false);
  };

  // Workflow : Envoyer l'opportunité et archiver
  const handleFinalize = () => {
      if(window.confirm("Êtes-vous sûr de vouloir créer l'opportunité dans Sellsy et archiver ce ticket ?")) {
          onSyncSellsy(task.id); // Simule l'envoi API
          // On attend un peu pour simuler le retour API avant d'archiver
          setTimeout(() => {
              onUpdateStep(task.id, WorkflowStep.SENT);
              onArchiveTask(task.id);
          }, 1000);
      }
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-white overflow-hidden relative">
      {/* Header */}
      <header className={`h-auto border-b border-gray-200 bg-white p-4 shadow-sm z-10 transition-colors ${isPending ? 'bg-amber-50/30' : ''}`}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                {task.id}
              </span>
              {task.sellsyStatus === SellsyStatus.UNKNOWN ? (
                <button 
                  onClick={() => setShowContactModal(true)}
                  className="flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md font-medium hover:bg-orange-200 transition-colors animate-pulse"
                >
                  <AlertCircle size={12} />
                  Client Inconnu • Créer ?
                </button>
              ) : (
                <button 
                    onClick={() => setShowContactModal(true)}
                    className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-md font-medium hover:bg-green-200"
                >
                  <CheckCircle2 size={12} />
                  Client Sellsy (OK)
                </button>
              )}
              {isPending && (
                   <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                       <PauseCircle size={12} /> EN ATTENTE
                   </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-slate-800">{task.subject}</h1>
            
            <div 
                onClick={() => setShowContactModal(true)}
                className="flex items-center gap-4 text-sm text-gray-500 mt-1 hover:text-blue-600 cursor-pointer transition-colors group"
                title="Voir/Modifier le contact"
            >
              <span className="flex items-center gap-1 group-hover:underline">
                <UserPlus size={14} /> {task.clientName}
              </span>
              {task.companyName && (
                <span className="flex items-center gap-1 group-hover:underline">
                  <Building2 size={14} /> {task.companyName}
                </span>
              )}
              {task.clientPhone && (
                <span className="flex items-center gap-1 group-hover:underline">
                  <Phone size={14} /> {task.clientPhone}
                </span>
              )}
            </div>
          </div>
          
          {/* New Modern Menu */}
          <div className="flex items-center gap-4">
              
              {/* Segmented Control */}
              <div className="flex bg-gray-100/80 p-1 rounded-lg gap-1 border border-gray-100">
                <button
                    onClick={() => setActiveTab('CHAT')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                    activeTab === 'CHAT' 
                        ? 'bg-white text-blue-600 shadow-sm border border-gray-100/50' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                    }`}
                >
                    <MessageSquare size={16} />
                    Conversation
                </button>
                <button
                    onClick={() => setActiveTab('QUOTE')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                    activeTab === 'QUOTE' 
                        ? 'bg-white text-blue-600 shadow-sm border border-gray-100/50' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                    }`}
                >
                    <FileText size={16} />
                    Devis & Facturation
                </button>
              </div>

              {/* Tools Group */}
              <div className="flex items-center gap-2">
                   <button 
                        onClick={handleSummarize}
                        className={`px-3 py-2 rounded-lg border transition-all flex items-center gap-2 ${
                            summary || isSummarizing 
                                ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-sm' 
                                : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-50 hover:text-slate-900 shadow-sm'
                        }`}
                    >
                        <BrainCircuit size={18} className={isSummarizing ? "animate-pulse" : ""} />
                        <span className="text-sm font-medium">Résumé AI</span>
                    </button>

                    <button 
                        onClick={() => setShowEvents(!showEvents)}
                        className={`p-2 rounded-lg border transition-all ${
                            showEvents ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white text-slate-500 border-gray-200 hover:bg-gray-50'
                        }`}
                        title="Historique"
                    >
                        <History size={20} />
                    </button>
              </div>

              <div className="w-px h-6 bg-gray-200 mx-1"></div>
              
              {/* Actions Group */}
              <div className="flex items-center gap-2">
                   <button
                        onClick={() => onTogglePending(task.id)}
                        title={isPending ? "Reprendre le dossier" : "Mettre en attente"}
                        className={`p-2 rounded-full transition-all ${
                            isPending 
                            ? 'bg-amber-100 text-amber-600' 
                            : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                        }`}
                    >
                        {isPending ? <PlayCircle size={22} /> : <PauseCircle size={22} />}
                    </button>

                    <button
                        onClick={() => onArchiveTask(task.id)}
                        title="Archiver"
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                    >
                        <Archive size={22} />
                    </button>
              </div>
          </div>
        </div>
        
        {/* AI Summary Panel */}
        {summary && (
            <div className="mb-4 bg-purple-50 border border-purple-100 rounded-lg p-3 text-sm text-slate-700 relative animate-in fade-in slide-in-from-top-2">
                <button 
                    onClick={() => setSummary(null)}
                    className="absolute top-2 right-2 text-purple-400 hover:text-purple-700"
                >
                    <X size={14} />
                </button>
                <h4 className="text-xs font-bold uppercase text-purple-600 mb-1 flex items-center gap-1">
                    <BrainCircuit size={12} /> Résumé du dossier
                </h4>
                <div className="whitespace-pre-line leading-relaxed">
                    {summary}
                </div>
            </div>
        )}

        {/* Logs Panel */}
        {showEvents && (
            <div className="mb-4 bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-slate-700 relative animate-in fade-in slide-in-from-top-2 max-h-40 overflow-y-auto">
                <h4 className="text-xs font-bold uppercase text-amber-600 mb-2 flex items-center gap-1 sticky top-0 bg-amber-50">
                    <History size={12} /> Journal d'activités
                </h4>
                <ul className="space-y-1">
                    {task.events.length === 0 && <li className="text-gray-400 italic text-xs">Aucun événement enregistré.</li>}
                    {task.events.map(ev => (
                        <li key={ev.id} className="text-xs flex gap-2">
                            <span className="text-gray-400 font-mono">{ev.timestamp.toLocaleTimeString()}</span>
                            <span className="font-semibold text-amber-800">[{ev.type}]</span>
                            <span>{ev.description}</span>
                        </li>
                    ))}
                </ul>
            </div>
        )}

        {/* Stepper */}
        {task.status !== TaskStatus.POOL && (
            <div className="relative mt-4">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -z-10 -translate-y-1/2 rounded"></div>
            <div className="flex justify-between w-full max-w-2xl mx-auto">
                {steps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                
                return (
                    <button 
                    key={step}
                    onClick={() => onUpdateStep(task.id, step)}
                    className={`group flex flex-col items-center gap-2 px-2 transition-all ${isPending ? 'opacity-50 grayscale' : 'bg-white'}`}
                    >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCompleted 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'bg-white border-gray-200 text-gray-300 group-hover:border-blue-300'
                    }`}>
                        {isCompleted ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 rounded-full bg-gray-200" />}
                    </div>
                    <span className={`text-xs font-medium transition-colors ${
                        isCurrent ? 'text-blue-600' : isCompleted ? 'text-slate-600' : 'text-gray-400'
                    }`}>
                        {step}
                    </span>
                    </button>
                );
                })}
            </div>
            </div>
        )}
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'CHAT' ? (
          <Chat 
            task={task} 
            onSendMessage={(text) => onSendMessage(task.id, text)} 
            onFinalize={handleFinalize}
          />
        ) : (
          <Quoter 
            task={task} 
            onUpdateQuote={onUpdateQuote}
            onSendToSellsy={() => {
                // Version simple via devis, ne ferme pas forcément
                onSyncSellsy(task.id);
            }}
          />
        )}
      </div>

      {/* Qualification Modal */}
      {showContactModal && (
          <ContactModal 
            task={task}
            onClose={() => setShowContactModal(false)}
            onUpdateContact={handleContactUpdate}
          />
      )}
    </div>
  );
};
