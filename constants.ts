
import { Task, TaskStatus, WorkflowStep, SellsyStatus, User } from './types';

export const CURRENT_USER_ID = 'u1';

export const USERS: User[] = [
  { id: 'u1', name: 'Alice', initials: 'AL', avatar: 'https://picsum.photos/seed/alice/200' },
  { id: 'u2', name: 'Bob', initials: 'BO', avatar: 'https://picsum.photos/seed/bob/200' },
  { id: 'u3', name: 'Charlie', initials: 'CH', avatar: 'https://picsum.photos/seed/charlie/200' },
  { id: 'u4', name: 'David', initials: 'DA', avatar: 'https://picsum.photos/seed/david/200' },
];

export const MOCK_TASKS: Task[] = [
  {
    id: '#T-8X29',
    subject: 'Demande de devis site web vitrine',
    clientName: 'Jean Dupont',
    clientEmail: 'j.dupont@start-up.io',
    clientPhone: '06 12 34 56 78',
    companyName: 'StartUp IO',
    status: TaskStatus.ASSIGNED,
    step: WorkflowStep.ESTIMATION,
    sellsyStatus: SellsyStatus.SYNCED,
    assigneeId: 'u1',
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    updatedAt: new Date(Date.now()),
    unread: true,
    tags: ['Commercial', 'Web'],
    messages: [
      {
        id: 'm1',
        sender: 'CLIENT',
        senderName: 'Jean Dupont',
        content: 'Bonjour, nous souhaiterions refaire notre site vitrine. Budget env. 2k€.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
      {
        id: 'm2',
        sender: 'AGENT',
        senderName: 'Alice',
        content: 'Bonjour Jean, merci pour votre demande. Avez-vous une charte graphique ?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20),
      },
      {
        id: 'm3',
        sender: 'CLIENT',
        senderName: 'Jean Dupont',
        content: 'Oui tout est prêt sur Figma. Ci-joint les maquettes et le cahier des charges.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        attachments: [
            { id: 'a1', name: 'Maquettes_Home_v3.fig', type: 'file', size: '12 MB', url: '#' },
            { id: 'a2', name: 'Cahier_Des_Charges.pdf', type: 'file', size: '1.4 MB', url: '#' },
            { id: 'a3', name: 'logo_preview.png', type: 'image', size: '450 KB', url: 'https://picsum.photos/id/1/400/300' }
        ]
      }
    ],
    quoteItems: [
      { id: 'q1', description: 'Intégration Homepage', quantity: 1, unitPrice: 450 },
      { id: 'q2', description: 'Page Contact + Formulaire', quantity: 1, unitPrice: 200 },
    ],
    events: [
        { id: 'e1', type: 'EMAIL_RECEIVED', description: 'Email reçu de Jean Dupont', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) },
        { id: 'e2', type: 'STATUS_CHANGE', description: 'Passage en Qualification', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22) },
        { id: 'e3', type: 'EMAIL_SENT', description: 'Réponse envoyée par Alice', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20) },
        { id: 'e4', type: 'SELLSY_SYNC', description: 'Contact créé dans Sellsy', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18) }
    ]
  },
  {
    id: '#T-9A12',
    subject: 'Problème facturation Avril',
    clientName: 'Sarah Connor',
    clientEmail: 'sarah@skynet.com',
    companyName: 'Skynet',
    status: TaskStatus.POOL,
    step: WorkflowStep.QUALIFICATION,
    sellsyStatus: SellsyStatus.UNKNOWN,
    assigneeId: undefined,
    receivedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 30),
    unread: true,
    tags: ['Facturation', 'Urgent'],
    messages: [
      {
        id: 'm4',
        sender: 'CLIENT',
        senderName: 'Sarah Connor',
        content: 'Bonjour, je n\'ai pas reçu la facture pour la prestation d\'Avril. Voici celle de Mars pour référence.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        attachments: [
            { id: 'a4', name: 'Facture_Mars_2024.pdf', type: 'file', size: '240 KB', url: '#' }
        ]
      }
    ],
    quoteItems: [],
    events: [
        { id: 'e5', type: 'EMAIL_RECEIVED', description: 'Email reçu de Sarah Connor', timestamp: new Date(Date.now() - 1000 * 60 * 30) }
    ]
  },
  {
    id: '#T-7B44',
    subject: 'Renouvellement contrat maintenance',
    clientName: 'Marc Zuckerberg',
    clientEmail: 'marc@meta.com',
    clientPhone: '+1 650 555 0199',
    status: TaskStatus.ASSIGNED,
    step: WorkflowStep.VALIDATION,
    sellsyStatus: SellsyStatus.SYNCED,
    assigneeId: 'u2',
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    unread: false,
    tags: ['Commercial', 'Renouvellement'],
    messages: [
      {
        id: 'm5',
        sender: 'CLIENT',
        senderName: 'Marc',
        content: 'On part sur un an de plus ?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
      }
    ],
    quoteItems: [
      { id: 'q3', description: 'Maintenance Annuelle 2024', quantity: 1, unitPrice: 1200 },
    ],
    events: []
  },
  {
    id: '#T-3C21',
    subject: 'Partenariat commercial',
    clientName: 'Unknown Sender',
    clientEmail: 'contact@spam.com',
    status: TaskStatus.POOL,
    step: WorkflowStep.QUALIFICATION,
    sellsyStatus: SellsyStatus.UNKNOWN,
    assigneeId: undefined,
    receivedAt: new Date(Date.now() - 1000 * 60 * 15),
    updatedAt: new Date(Date.now() - 1000 * 60 * 15),
    unread: true,
    tags: ['Spam', 'Autre'],
    messages: [
         {
        id: 'm6',
        sender: 'CLIENT',
        senderName: 'Unknown',
        content: 'Bonjour, seriez-vous intéressés par des leads qualifiés ?',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
      }
    ],
    quoteItems: [],
    events: []
  },
  {
    id: '#T-1Z99',
    subject: 'Bug sur la page login',
    clientName: 'Bill Gates',
    clientEmail: 'bill@microsoft.com',
    clientPhone: '+1 425 555 0100',
    companyName: 'Microsoft',
    status: TaskStatus.ASSIGNED,
    step: WorkflowStep.QUALIFICATION,
    sellsyStatus: SellsyStatus.SYNCED,
    assigneeId: 'u3', // Charlie
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    updatedAt: new Date(Date.now()),
    unread: true,
    tags: ['Support', 'Technique'],
    messages: [
      {
        id: 'm7',
        sender: 'CLIENT',
        senderName: 'Bill',
        content: 'Le bouton login ne marche plus sur mobile. Screenshot joint.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
        attachments: [
            { id: 'a5', name: 'bug_mobile.jpg', type: 'image', size: '2.1 MB', url: 'https://picsum.photos/id/2/300/600' }
        ]
      }
    ],
    quoteItems: [],
    events: []
  }
];
