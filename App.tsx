
import React, { useState, useEffect } from 'react';
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
import { CURRENT_USER_ID, USERS as INITIAL_USERS } from './constants';
import { analyzeTicketCategory } from './services/ai';
import { 
    subscribeToTasks, 
    updateTaskStatus, 
    updateTaskStep, 
    addMessageToTask, 
    updateQuoteItems, 
    syncSellsyStatus,
    seedDatabase,
    addTask
} from './services/firebaseService';

const App: React.FC = () => {
  // TASKS n'est plus initialisé avec MOCK_TASKS, mais un tableau vide qui sera rempli par Firebase
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);
  
  // UI States
  const [showAdmin, setShowAdmin] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  // --- FIREBASE SUBSCRIPTION ---
  useEffect(() => {
    // S'abonne aux changements de la collection 'tasks'
    const unsubscribe = subscribeToTasks((fetchedTasks) => {
        setTasks(fetchedTasks);
    });
    return () => unsubscribe();
  }, []);

  // --- Actions (Delegated to Firebase Service) ---

  const handleTakeTask = (taskId: string) => {
    updateTaskStatus(taskId, TaskStatus.ASSIGNED, CURRENT_USER_ID);
    updateTaskStep(taskId, WorkflowStep.QUALIFICATION);
    setSelectedTaskId(taskId);
  };

  const handleMoveTask = (taskId: string, newStatus: TaskStatus, newAssigneeId?: string) => {
      // Logic local pour déterminer l'assignee
      const task = tasks.find(t => t.id === taskId);
      const assignee = newStatus === TaskStatus.POOL ? undefined : (newAssigneeId || task?.assigneeId);
      
      updateTaskStatus(taskId, newStatus, assignee);
      
      // Deselect if moving to pool or other user
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
    addMessageToTask(taskId, newMessage);
  };

  const handleUpdateQuote = (taskId: string, items: QuoteItem[]) => {
    updateQuoteItems(taskId, items);
  };

  const handleUpdateStep = (taskId: string, step: WorkflowStep) => {
    updateTaskStep(taskId, step);
  };

  const handleSyncSellsy = (taskId: string) => {
     syncSellsyStatus(taskId);
  }

  const handleArchiveTask = (taskId: string) => {
    updateTaskStatus(taskId, TaskStatus.ARCHIVED, tasks.find(t => t.id === taskId)?.assigneeId);
    if (selectedTaskId === taskId) {
      setSelectedTaskId(undefined);
    }
  };

  const handleTogglePending = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if(task) {
        const newStatus = task.status === TaskStatus.PENDING ? TaskStatus.ASSIGNED : TaskStatus.PENDING;
        updateTaskStatus(taskId, newStatus, task.assigneeId);
    }
  };

  // --- Users Actions ---
  const handleAddUser = (name: string, initials: string) => {
      // Pour l'instant on garde les users en local, mais on pourrait aussi faire une collection 'users' dans Firebase
      const newUser: User = {
          id: `u${users.length + 1}`,
          name,
          initials,
          avatar: `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=random`
      };
      setUsers(prev => [...prev, newUser]);
  };

  // --- Simulation Logic (Updated for Firebase) ---

  const handleSimulateNewLead = async () => {
      const id = Math.floor(Math.random() * 10000).toString();
      const subject = 'Demande de contact (Simulée)';
      const content = 'Bonjour, je souhaiterais avoir des informations sur vos offres de maintenance.';
      
      const tag = await analyzeTicketCategory(subject, content);

      const newLead: any = { // Using any for partial Task creation compatible with Firestore
        subject: subject,
        clientName: 'Nouveau Prospect',
        clientEmail: `prospect${id}@test.com`,
        status: TaskStatus.POOL,
        step: WorkflowStep.QUALIFICATION,
        sellsyStatus: SellsyStatus.UNKNOWN,
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
      addTask(newLead);
  };

  // Note: Les autres simulations (ReplyToOpen, etc.) devraient aussi être migrées vers firebaseService
  // pour être "propres", mais pour cet exemple, nous allons nous concentrer sur l'injection de données.
  // Pour la démo, on utilise handleReset pour seeder la base.

  const handleReset = () => {
      if(window.confirm("Initialiser la base de données Firebase avec les données de test ? (Attention aux doublons)")) {
          seedDatabase();
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
        // Les autres simulations sont désactivées temporairement ou nécessiteraient
        // une implémentation complète dans firebaseService
        onReplyToOpen={() => alert("Simulation non disponible en mode Firebase pour le moment")}
        onReplyToArchived={() => alert("Simulation non disponible en mode Firebase pour le moment")}
        onColleagueReply={() => alert("Simulation non disponible en mode Firebase pour le moment")}
        onSellsyUpdate={() => alert("Simulation non disponible en mode Firebase pour le moment")}
        onReset={handleReset} // Le Reset sert maintenant à Seeder la DB
      />

    </div>
  );
};

export default App;
