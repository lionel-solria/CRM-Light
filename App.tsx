
import React, { useState } from 'react';
import { PoolColumn } from './components/PoolColumn';
import { WipColumn } from './components/WipColumn';
import { Workspace } from './components/Workspace';
import { AdminModal } from './components/AdminModal';
import { SimulationPanel } from './components/SimulationPanel';
import { Sidebar } from './components/Sidebar';
import { NotificationsPanel } from './components/NotificationsPanel';
import { SettingsModal } from './components/SettingsModal';
import { HelpModal } from './components/HelpModal';
import { Task, QuoteItem, WorkflowStep, Message, TaskStatus, SellsyStatus, User } from './types';
import { MOCK_TASKS, CURRENT_USER_ID, USERS as INITIAL_USERS } from './constants';
import { analyzeTicketCategory } from './services/ai';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);
  
  // UI States
  const [showAdmin, setShowAdmin] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  // --- Actions ---

  const handleTakeTask = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: TaskStatus.ASSIGNED,
          assigneeId: CURRENT_USER_ID,
          step: WorkflowStep.QUALIFICATION,
          updatedAt: new Date()
        };
      }
      return t;
    }));
    setSelectedTaskId(taskId);
  };

  const handleMoveTask = (taskId: string, newStatus: TaskStatus, newAssigneeId?: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        // Si on le remet dans le pool, on vide l'assignee
        const assignee = newStatus === TaskStatus.POOL ? undefined : (newAssigneeId || t.assigneeId);
        
        return {
          ...t,
          status: newStatus,
          assigneeId: assignee,
          updatedAt: new Date(),
          step: newStatus === TaskStatus.POOL ? t.step : (t.step || WorkflowStep.QUALIFICATION)
        };
      }
      return t;
    }));

    if (taskId === selectedTaskId && (newStatus === TaskStatus.POOL || (newAssigneeId && newAssigneeId !== CURRENT_USER_ID))) {
        setSelectedTaskId(undefined);
    }
  };

  const handleSendMessage = (taskId: string, text: string) => {
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      sender: 'AGENT',
      senderName: 'Moi', 
      content: text,
      timestamp: new Date()
    };

    setTasks(prev => {
        const taskIndex = prev.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return prev;

        const updatedTask = {
          ...prev[taskIndex],
          messages: [...prev[taskIndex].messages, newMessage],
          updatedAt: new Date()
        };

        const newTasks = [...prev];
        newTasks.splice(taskIndex, 1);
        newTasks.unshift(updatedTask);
        return newTasks;
    });
  };

  const handleUpdateQuote = (taskId: string, items: QuoteItem[]) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, quoteItems: items };
      }
      return t;
    }));
  };

  const handleUpdateStep = (taskId: string, step: WorkflowStep) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, step, updatedAt: new Date() };
      }
      return t;
    }));
  };

  const handleSyncSellsy = (taskId: string) => {
     setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
           return { ...t, sellsyStatus: SellsyStatus.SYNCED };
        }
        return t;
     }));
  }

  const handleArchiveTask = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, status: TaskStatus.ARCHIVED };
      }
      return t;
    }));
    if (selectedTaskId === taskId) {
      setSelectedTaskId(undefined);
    }
  };

  const handleTogglePending = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const newStatus = t.status === TaskStatus.PENDING ? TaskStatus.ASSIGNED : TaskStatus.PENDING;
        return { ...t, status: newStatus, updatedAt: new Date() };
      }
      return t;
    }));
  };

  // --- Users Actions ---

  const handleAddUser = (name: string, initials: string) => {
      const newUser: User = {
          id: `u${users.length + 1}`,
          name,
          initials,
          avatar: `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=random`
      };
      setUsers(prev => [...prev, newUser]);
  };

  // --- Simulation Logic ---

  const handleSimulateNewLead = async () => {
      const id = Math.floor(Math.random() * 10000).toString();
      const subject = 'Demande de contact (Simulée)';
      const content = 'Bonjour, je souhaiterais avoir des informations sur vos offres de maintenance.';
      
      const tag = await analyzeTicketCategory(subject, content);

      const newLead: Task = {
        id: `#T-${id}SIM`,
        subject: subject,
        clientName: 'Nouveau Prospect',
        clientEmail: `prospect${id}@test.com`,
        status: TaskStatus.POOL,
        step: WorkflowStep.QUALIFICATION,
        sellsyStatus: SellsyStatus.UNKNOWN,
        receivedAt: new Date(),
        updatedAt: new Date(),
        unread: true,
        tags: [tag],
        messages: [{
            id: `msg-${id}`,
            sender: 'CLIENT',
            senderName: 'Nouveau Prospect',
            content: content,
            timestamp: new Date()
        }],
        quoteItems: [],
        events: []
      };
      setTasks(prev => [newLead, ...prev]);
  };

  const handleSimulateReplyToOpen = () => {
      const openTasks = tasks.filter(t => t.status === TaskStatus.ASSIGNED || t.status === TaskStatus.PENDING || t.status === TaskStatus.POOL);
      if (openTasks.length === 0) {
          alert("Aucun dossier ouvert pour simuler une réponse.");
          return;
      }
      const target = openTasks[Math.floor(Math.random() * openTasks.length)];
      
      const newMessage: Message = {
          id: Math.random().toString(36).substr(2, 9),
          sender: 'CLIENT',
          senderName: target.clientName,
          content: 'Voici les documents demandés. Quand pouvons-nous avancer sur ce sujet ?',
          timestamp: new Date()
      };

      setTasks(prev => {
          const updatedTask = {
              ...target,
              messages: [...target.messages, newMessage],
              unread: true,
              updatedAt: new Date()
          };
          return [updatedTask, ...prev.filter(t => t.id !== target.id)];
      });
  };

  const handleSimulateReplyToArchived = () => {
      const archivedTasks = tasks.filter(t => t.status === TaskStatus.ARCHIVED);
      if (archivedTasks.length === 0) {
          alert("Aucun dossier archivé pour simuler un réveil.");
          return;
      }
      const target = archivedTasks[Math.floor(Math.random() * archivedTasks.length)];

      const newMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        sender: 'CLIENT',
        senderName: target.clientName,
        content: 'Rebonjour, je reviens vers vous concernant ce vieux dossier. Est-ce toujours d\'actualité ?',
        timestamp: new Date()
      };

      setTasks(prev => {
          const updatedTask = {
              ...target,
              status: TaskStatus.POOL,
              assigneeId: undefined,
              isZombie: true,
              messages: [...target.messages, newMessage],
              unread: true,
              updatedAt: new Date(),
              events: [...target.events, { 
                  id: Math.random().toString(), 
                  type: 'EMAIL_RECEIVED', 
                  description: 'Email reçu sur dossier archivé (Retour en Réception)', 
                  timestamp: new Date() 
              }]
          };
           return [updatedTask, ...prev.filter(t => t.id !== target.id)];
      });
  };

  const handleSimulateColleagueReply = () => {
    const eligibleTasks = tasks.filter(t => t.status !== TaskStatus.ARCHIVED);
    if (eligibleTasks.length === 0) return;
    
    const target = eligibleTasks[Math.floor(Math.random() * eligibleTasks.length)];
    const colleague = users.find(u => u.id !== CURRENT_USER_ID) || users[1];

    const newMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        sender: 'AGENT',
        senderName: colleague.name,
        content: 'Je me permets d\'intervenir sur ce point. Le dossier technique est validé.',
        timestamp: new Date()
    };

    setTasks(prev => {
        const updatedTask = {
            ...target,
            messages: [...target.messages, newMessage],
            updatedAt: new Date()
        };
        return [updatedTask, ...prev.filter(t => t.id !== target.id)];
    });
  };

  const handleSimulateSellsyUpdate = () => {
    const notSyncedTasks = tasks.filter(t => t.sellsyStatus === SellsyStatus.UNKNOWN && t.status !== TaskStatus.ARCHIVED);
    if (notSyncedTasks.length === 0) {
        alert("Tous les dossiers actifs sont déjà synchronisés Sellsy.");
        return;
    }
    const target = notSyncedTasks[Math.floor(Math.random() * notSyncedTasks.length)];
    
    setTasks(prev => prev.map(t => {
        if (t.id === target.id) {
            return {
                ...t,
                sellsyStatus: SellsyStatus.SYNCED,
                events: [...t.events, {
                    id: Math.random().toString(),
                    type: 'SELLSY_SYNC',
                    description: 'Contact validé automatiquement par Sellsy (Webhook)',
                    timestamp: new Date()
                }]
            };
        }
        return t;
    }));
  };

  const handleReset = () => {
      if(window.confirm("Réinitialiser toutes les données ?")) {
          setTasks(MOCK_TASKS);
          setUsers(INITIAL_USERS);
          setSelectedTaskId(undefined);
      }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden text-slate-800 relative">
      
      {/* Sidebar Navigation */}
      <Sidebar 
         users={users}
         activeView="DASHBOARD"
         onOpenAdmin={() => setShowAdmin(true)}
         onOpenSimulation={() => setShowSimulation(!showSimulation)}
         onOpenNotifications={() => setShowNotifications(!showNotifications)}
         onOpenSettings={() => setShowSettings(true)}
         onOpenHelp={() => setShowHelp(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
          {/* Column 1: Reception / Pool */}
          <div className="hidden lg:block h-full shadow-lg z-20">
            <PoolColumn 
              tasks={tasks} 
              onSelectTask={(task) => setSelectedTaskId(task.id)}
              selectedTaskId={selectedTaskId}
              onTakeTask={handleTakeTask}
              onMoveTask={handleMoveTask}
            />
          </div>

          {/* Column 2: Work In Progress */}
          <div className={`
             lg:block h-full shadow-md z-10
             ${(!selectedTaskId || tasks.find(t => t.id === selectedTaskId)?.status === TaskStatus.POOL) ? 'hidden' : 'block'}
          `}>
            <WipColumn 
              tasks={tasks}
              users={users}
              onSelectTask={(task) => setSelectedTaskId(task.id)}
              selectedTaskId={selectedTaskId}
              onMoveTask={handleMoveTask}
            />
          </div>

          {/* Column 3: Workspace */}
          <main className="flex-1 h-full min-w-0 bg-white">
            <Workspace 
              task={selectedTask}
              onSendMessage={handleSendMessage}
              onUpdateQuote={handleUpdateQuote}
              onUpdateStep={handleUpdateStep}
              onSyncSellsy={handleSyncSellsy}
              onArchiveTask={handleArchiveTask}
              onTogglePending={handleTogglePending}
            />
          </main>
      </div>

      {/* Modals & Panels */}
      
      <NotificationsPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />

      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />

      <HelpModal 
        isOpen={showHelp} 
        onClose={() => setShowHelp(false)} 
      />

      <AdminModal 
        isOpen={showAdmin} 
        onClose={() => setShowAdmin(false)} 
        tasks={tasks} 
        users={users}
        onAddUser={handleAddUser}
      />

      <SimulationPanel 
        isOpen={showSimulation}
        onClose={() => setShowSimulation(false)}
        onNewLead={handleSimulateNewLead}
        onReplyToOpen={handleSimulateReplyToOpen}
        onReplyToArchived={handleSimulateReplyToArchived}
        onColleagueReply={handleSimulateColleagueReply}
        onSellsyUpdate={handleSimulateSellsyUpdate}
        onReset={handleReset}
      />

    </div>
  );
};

export default App;
