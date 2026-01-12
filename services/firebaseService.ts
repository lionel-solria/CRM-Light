
import { 
    collection, 
    onSnapshot, 
    doc, 
    updateDoc, 
    addDoc, 
    arrayUnion, 
    query, 
    orderBy,
    Timestamp,
    writeBatch
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { Task, TaskStatus, WorkflowStep, Message, QuoteItem, SellsyStatus } from '../types';
import { MOCK_TASKS } from '../constants';

const TASKS_COLLECTION = 'tasks';

// --- MOCK STATE (Pour le mode hors-ligne/démo) ---
let mockTasks = [...MOCK_TASKS];
const mockObservers = new Set<(tasks: Task[]) => void>();

const notifyMockObservers = () => {
    // Tri par date de mise à jour décroissante
    const sorted = [...mockTasks].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    mockObservers.forEach(cb => cb(sorted));
};

// --- HELPERS ---
const convertTaskDates = (doc: any): Task => {
    const data = doc.data();
    return {
        ...data,
        id: doc.id,
        receivedAt: data.receivedAt?.toDate ? data.receivedAt.toDate() : new Date(data.receivedAt || Date.now()),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now()),
        messages: (data.messages || []).map((m: any) => ({
            ...m,
            timestamp: m.timestamp?.toDate ? m.timestamp.toDate() : new Date(m.timestamp || Date.now())
        })),
        events: (data.events || []).map((e: any) => ({
            ...e,
            timestamp: e.timestamp?.toDate ? e.timestamp.toDate() : new Date(e.timestamp || Date.now())
        }))
    } as Task;
};

// --- READ ---

export const subscribeToTasks = (callback: (tasks: Task[]) => void) => {
    // Si Firebase est bien configuré ET initialisé
    if (isFirebaseConfigured && db) {
        try {
            const q = query(collection(db, TASKS_COLLECTION), orderBy('updatedAt', 'desc'));
            
            return onSnapshot(q, (snapshot) => {
                const tasks = snapshot.docs.map(convertTaskDates);
                callback(tasks);
            }, (error) => {
                console.error("Erreur connexion Firestore (Fallback Mode Démo):", error);
                // En cas d'erreur (ex: permission denied), on bascule sur le mock
                callback(mockTasks); 
            });
        } catch (e) {
            console.error("Exception Firestore:", e);
            // Fallback immédiat
            mockObservers.add(callback);
            callback([...mockTasks]);
            return () => mockObservers.delete(callback);
        }
    } else {
        // Mode Démo / Local
        mockObservers.add(callback);
        // Appel initial
        callback([...mockTasks].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
        return () => mockObservers.delete(callback);
    }
};

// --- WRITE ---

export const addTask = async (task: Partial<Task>) => {
    if (isFirebaseConfigured && db) {
        try {
            await addDoc(collection(db, TASKS_COLLECTION), {
                ...task,
                receivedAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });
            return;
        } catch (e) { console.error("Erreur écriture:", e); }
    } 
    
    // Fallback Mock
    const newTask = {
        ...task,
        id: `#T-${Math.floor(Math.random()*10000)}M`,
        updatedAt: new Date(),
        receivedAt: new Date(),
        messages: task.messages || [],
        events: task.events || [],
        quoteItems: task.quoteItems || []
    } as Task;
    mockTasks = [newTask, ...mockTasks];
    notifyMockObservers();
};

export const updateTaskStatus = async (taskId: string, status: TaskStatus, assigneeId?: string) => {
    if (isFirebaseConfigured && db) {
        try {
            const taskRef = doc(db, TASKS_COLLECTION, taskId);
            await updateDoc(taskRef, {
                status,
                assigneeId: assigneeId === undefined ? null : assigneeId,
                updatedAt: Timestamp.now()
            });
            return;
        } catch (e) { console.error("Erreur écriture:", e); }
    }

    // Fallback Mock
    mockTasks = mockTasks.map(t => {
        if (t.id === taskId) {
            return { ...t, status, assigneeId: assigneeId || undefined, updatedAt: new Date() };
        }
        return t;
    });
    notifyMockObservers();
};

export const updateTaskStep = async (taskId: string, step: WorkflowStep) => {
    if (isFirebaseConfigured && db) {
        try {
            const taskRef = doc(db, TASKS_COLLECTION, taskId);
            await updateDoc(taskRef, { step, updatedAt: Timestamp.now() });
            return;
        } catch (e) { console.error("Erreur écriture:", e); }
    }

    mockTasks = mockTasks.map(t => (t.id === taskId ? { ...t, step, updatedAt: new Date() } : t));
    notifyMockObservers();
};

export const addMessageToTask = async (taskId: string, message: Message) => {
    if (isFirebaseConfigured && db) {
        try {
            const taskRef = doc(db, TASKS_COLLECTION, taskId);
            await updateDoc(taskRef, {
                messages: arrayUnion(message),
                updatedAt: Timestamp.now(),
                unread: message.sender === 'CLIENT'
            });
            return;
        } catch (e) { console.error("Erreur écriture:", e); }
    }

    mockTasks = mockTasks.map(t => {
        if (t.id === taskId) {
            return { 
                ...t, 
                messages: [...t.messages, message], 
                updatedAt: new Date(),
                unread: message.sender === 'CLIENT' 
            };
        }
        return t;
    });
    notifyMockObservers();
};

export const updateQuoteItems = async (taskId: string, items: QuoteItem[]) => {
    if (isFirebaseConfigured && db) {
        try {
            const taskRef = doc(db, TASKS_COLLECTION, taskId);
            await updateDoc(taskRef, { quoteItems: items, updatedAt: Timestamp.now() });
            return;
        } catch (e) { console.error("Erreur écriture:", e); }
    }

    mockTasks = mockTasks.map(t => (t.id === taskId ? { ...t, quoteItems: items, updatedAt: new Date() } : t));
    notifyMockObservers();
};

export const syncSellsyStatus = async (taskId: string) => {
    if (isFirebaseConfigured && db) {
        try {
            const taskRef = doc(db, TASKS_COLLECTION, taskId);
            await updateDoc(taskRef, { sellsyStatus: SellsyStatus.SYNCED, updatedAt: Timestamp.now() });
            return;
        } catch (e) { console.error("Erreur écriture:", e); }
    }

    mockTasks = mockTasks.map(t => (t.id === taskId ? { ...t, sellsyStatus: SellsyStatus.SYNCED, updatedAt: new Date() } : t));
    notifyMockObservers();
};

export const seedDatabase = async () => {
    if (isFirebaseConfigured && db) {
        const batch = writeBatch(db);
        MOCK_TASKS.forEach(task => {
            const docRef = doc(collection(db, TASKS_COLLECTION));
            batch.set(docRef, {
                ...task,
                receivedAt: Timestamp.fromDate(task.receivedAt),
                updatedAt: Timestamp.fromDate(task.updatedAt),
                messages: task.messages.map(m => ({...m, timestamp: Timestamp.fromDate(m.timestamp)})),
                events: task.events.map(e => ({...e, timestamp: Timestamp.fromDate(e.timestamp)}))
            });
        });
        await batch.commit();
        alert("Base de données Firebase initialisée !");
    } else {
        // En mode mock, seed = reset
        mockTasks = [...MOCK_TASKS];
        notifyMockObservers();
        alert("Données locales réinitialisées !");
    }
};
