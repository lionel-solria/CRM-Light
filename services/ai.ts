
import { GoogleGenAI } from "@google/genai";
import { Task, Message } from "../types";

// Initialisation sécurisée (le process.env.API_KEY est injecté par l'environnement)
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_FAST = 'gemini-2.5-flash-preview-09-2025'; // Pour la réactivité

/**
 * Génère une réponse intelligente basée sur l'historique de la conversation
 */
export const generateSmartReply = async (task: Task, senderName: string): Promise<string> => {
  try {
    // Construction du contexte pour l'IA
    const history = task.messages.map(m => `${m.sender === 'AGENT' ? 'Agent' : 'Client'}: ${m.content}`).join('\n');
    
    const prompt = `
      Tu es un assistant service client efficace et professionnel nommé ${senderName}.
      
      Contexte du dossier :
      Sujet : ${task.subject}
      Client : ${task.clientName}
      Société : ${task.companyName || 'Non spécifiée'}
      
      Historique de la conversation :
      ${history}
      
      Tâche : Rédige une réponse courte, polie et professionnelle pour l'Agent.
      La réponse doit faire avancer le dossier (demander des infos manquantes, proposer un rendez-vous, ou confirmer la réception).
      Ne mets pas de guillemets, ne mets pas de préambule, donne juste le texte du mail.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Erreur Gemini Smart Reply:", error);
    return "Désolé, je n'ai pas pu générer de réponse pour le moment.";
  }
};

/**
 * Génère un résumé structuré du dossier
 */
export const generateTaskSummary = async (task: Task): Promise<string> => {
  try {
    const history = task.messages.map(m => `${m.senderName}: ${m.content}`).join('\n');

    const prompt = `
      Analyse cette conversation de support client/vente.
      
      Sujet : ${task.subject}
      Historique :
      ${history}
      
      Génère un résumé très concis (max 3 points) :
      1. État actuel de la demande.
      2. Points bloquants ou infos manquantes.
      3. Prochaine action recommandée pour l'agent.
      
      Format : Utilise des émojis pour structurer (ex: 📌, ⚠️, 🚀). Sois direct.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Erreur Gemini Summary:", error);
    return "Impossible de générer le résumé.";
  }
};

/**
 * Analyse un nouveau ticket pour lui attribuer une catégorie (Tag)
 */
export const analyzeTicketCategory = async (subject: string, content: string): Promise<string> => {
    try {
        const prompt = `
          Tu es un répartiteur de tickets CRM. Analyse cet email entrant.
          
          Sujet : ${subject}
          Contenu : ${content}
          
          Catégorise-le dans UNE SEULE de ces catégories :
          - Commercial (Devis, prix, offre)
          - Support (Bug, problème technique, aide)
          - Admin (Facture, contrat, administratif)
          - Autre (Si rien ne correspond)
          - Urgent (Si le ton est agressif ou demande une action immédiate)
          
          Réponds UNIQUEMENT par le mot de la catégorie.
        `;
    
        const response = await ai.models.generateContent({
          model: MODEL_FAST,
          contents: prompt,
        });
    
        const tag = response.text?.trim() || "Autre";
        // Nettoyage basique pour éviter les phrases
        return tag.split(' ')[0].replace('.', '');
      } catch (error) {
        console.error("Erreur Gemini Categorization:", error);
        return "Autre";
      }
};
