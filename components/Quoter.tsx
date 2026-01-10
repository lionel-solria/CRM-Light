import React, { useState } from 'react';
import { Plus, Trash2, Send, FileText, TrendingUp, Save, Mail } from 'lucide-react';
import { Task, QuoteItem, SellsyStatus } from '../types';

interface QuoterProps {
  task: Task;
  onUpdateQuote: (taskId: string, items: QuoteItem[]) => void;
  onSendToSellsy: () => void;
}

export const Quoter: React.FC<QuoterProps> = ({ task, onUpdateQuote, onSendToSellsy }) => {
  const [items, setItems] = useState<QuoteItem[]>(task.quoteItems);
  const [isSending, setIsSending] = useState(false);

  const totalHT = items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  const totalTVA = totalHT * 0.2;
  const totalTTC = totalHT + totalTVA;

  const handleAddItem = () => {
    const newItem: QuoteItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: '',
      quantity: 1,
      unitPrice: 0,
    };
    const newItems = [...items, newItem];
    setItems(newItems);
    onUpdateQuote(task.id, newItems);
  };

  const handleUpdateItem = (id: string, field: keyof QuoteItem, value: string | number) => {
    const newItems = items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setItems(newItems);
    onUpdateQuote(task.id, newItems);
  };

  const handleDeleteItem = (id: string) => {
    const newItems = items.filter(i => i.id !== id);
    setItems(newItems);
    onUpdateQuote(task.id, newItems);
  };

  const handleSendEmail = () => {
      setIsSending(true);
      setTimeout(() => {
          // Logic to send email would go here
          setIsSending(false);
          alert("Devis envoyé au client !");
      }, 1500);
  }

  return (
    <div className="p-6 bg-slate-50 h-full overflow-y-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2 text-slate-700">
            <FileText size={18} />
            <h3 className="font-semibold">Brouillon d'Opportunité / Devis</h3>
          </div>
          {task.sellsyStatus === SellsyStatus.SYNCED && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                  Client synchronisé
              </span>
          )}
        </div>

        {/* Table */}
        <div className="p-4">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 w-3/5">Description</th>
                <th className="px-3 py-2 w-20 text-center">Qté</th>
                <th className="px-3 py-2 w-28 text-right">PU (HT)</th>
                <th className="px-3 py-2 w-28 text-right">Total (HT)</th>
                <th className="px-3 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="group hover:bg-gray-50 transition-colors">
                  <td className="p-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                      placeholder="Description de la prestation"
                      className="w-full border-none bg-transparent focus:ring-0 p-0 text-slate-900 placeholder:text-gray-300 font-medium"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full text-center border-gray-200 rounded p-1 bg-white focus:ring-2 focus:ring-blue-100 text-slate-900"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full text-right border-gray-200 rounded p-1 bg-white focus:ring-2 focus:ring-blue-100 text-slate-900"
                    />
                  </td>
                  <td className="p-2 text-right font-medium text-slate-700">
                    {(item.quantity * item.unitPrice).toFixed(2)} €
                  </td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={handleAddItem}
            className="mt-4 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
          >
            <Plus size={16} />
            Ajouter une ligne
          </button>
        </div>

        {/* Totals */}
        <div className="bg-gray-50 p-4 border-t border-gray-200">
          <div className="flex justify-end mb-2">
            <span className="text-gray-500 text-sm w-32 text-right">Total HT :</span>
            <span className="font-semibold text-slate-800 w-32 text-right">{totalHT.toFixed(2)} €</span>
          </div>
          <div className="flex justify-end mb-2">
            <span className="text-gray-500 text-sm w-32 text-right">TVA (20%) :</span>
            <span className="font-medium text-slate-600 w-32 text-right">{totalTVA.toFixed(2)} €</span>
          </div>
          <div className="flex justify-end pt-3 border-t border-gray-200">
            <span className="text-slate-800 font-bold text-lg w-32 text-right">Total TTC :</span>
            <span className="text-blue-600 font-bold text-lg w-32 text-right">{totalTTC.toFixed(2)} €</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-end gap-3">
        {/* Save Opportunity Button REMOVED */}

        <button 
            disabled={items.length === 0 || isSending}
            onClick={handleSendEmail}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-medium shadow-md shadow-blue-200 flex items-center gap-2 transition-all transform active:scale-95"
        >
          {isSending ? (
             <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Envoi...</>
          ) : (
             <>
                <Mail size={18} />
                Envoyer le Devis
             </>
          )}
        </button>
      </div>
      
      {task.sellsyStatus === SellsyStatus.UNKNOWN && (
          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800 flex flex-col gap-2">
              <p className="font-semibold">⚠️ Action Requise</p>
              <p>Vous devez qualifier le contact avant de pouvoir synchroniser l'opportunité ou envoyer le devis.</p>
          </div>
      )}
    </div>
  );
};