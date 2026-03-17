"use client"

import { useEffect, useState } from "react";
import { api } from "./api";
import toast from "react-hot-toast";
import { ArrowDownCircle, ArrowUpCircle, Wallet, Activity, TrendingUp, TrendingDown, Trash, Plus, PlusCircle } from "lucide-react";

type Transaction = {
  id: string;
  text: string;
  amount: number;
  created_at: string;
};

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [text, setText] = useState<string>("");
  const [amount, setAmount] = useState<string | number>("");
  const [loading, setLoading] = useState<boolean>(false);

  // get transactions
  const getTransactions = async () => {
    try {
      const res = await api.get<Transaction[]>("/transactions/");
      setTransactions(res.data);
      toast.success("Transactions récupérées avec succès");
    } catch (error) {
      toast.error("Erreur lors de la récupération des transactions");
    }
  };

    // add transaction
  const addTransaction = async () => {
    if (!text || amount == "" || isNaN(Number(amount))) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    setLoading(true);
  try {
    const res = await api.post(`/transactions/`, { text, amount: Number(amount) });
    getTransactions();
    const modal = document.getElementById('my_modal_3') as HTMLDialogElement;
    if(modal) modal.close();
    
    setTransactions((prev) => [...prev, res.data]);
    toast.success("Transaction ajoutée avec succès");
    setText("");
    setAmount("");
  } catch {
    toast.error("Erreur lors de l'ajout");
  } finally {
    setLoading(false);
  }
};

  // delete transaction
  const deleteTransaction = async (id: string) => {
  try {
    await api.delete(`/transactions/${id}/`);
    getTransactions();// pour rafraichir la liste
    toast.success("Transaction supprimée avec succès");
  } catch {
    toast.error("Erreur lors de la suppression");
  }
};
  useEffect(() => {
    getTransactions();
  }, []);



  const amounts = transactions.map((t) => Number(t.amount) || 0);
  const balance = amounts.reduce((acc, item) => acc + item, 0) || 0;
  const income = amounts.filter((a) => a > 0).reduce((acc, item) => acc + item, 0) || 0;
  const expense = amounts.filter((a) => a < 0).reduce((acc, item) => acc + item, 0) || 0;
  const ratio = income > 0 ? Math.min((Math.abs(expense) / income) * 100, 100) : 0;

  const formatData = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  return (
    <div className="w-full max-w-5xl px-4 flex flex-col gap-4">
      <div className="flex flex-row flex-nowrap justify-between items-center gap-2 md:gap-8 rounded-2xl border-2 border-warning/10 border-dashed bg-warning/5 p-4 md:p-8 overflow-hidden">
        {/* solde */}
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="badge badge-warning flex items-center gap-1 md:gap-2 h-fit py-0.5 md:py-1 px-1 md:px-3 text-[clamp(0.6rem,1.5vw,0.9rem)] whitespace-nowrap">
            <Wallet className="h-3 w-3 md:h-4 md:w-4 shrink-0"/>
            <span className="truncate">Votre solde</span>
          </div>
          <div className="font-bold text-[clamp(0.9rem,4vw,2.25rem)] leading-tight whitespace-nowrap truncate">
            {balance.toFixed(2)} €
          </div>
        </div>

        {/* revenu */}
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="badge badge-success flex items-center gap-1 md:gap-2 h-fit py-0.5 md:py-1 px-1 md:px-3 text-[clamp(0.6rem,1.5vw,0.9rem)] whitespace-nowrap">
            <ArrowUpCircle className="h-3 w-3 md:h-4 md:w-4 shrink-0"/>
            <span className="truncate">Revenu</span>
          </div>
          <div className="font-bold text-success text-[clamp(0.9rem,4vw,2.25rem)] leading-tight whitespace-nowrap truncate">
            {income.toFixed(2)} €
          </div>
        </div>

        {/* depense */}
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="badge badge-error flex items-center gap-1 md:gap-2 h-fit py-0.5 md:py-1 px-1 md:px-3 text-[clamp(0.6rem,1.5vw,0.9rem)] whitespace-nowrap">
            <ArrowDownCircle className="h-3 w-3 md:h-4 md:w-4 shrink-0"/>
            <span className="truncate">Dépense</span>
          </div>
          <div className="font-bold text-error text-[clamp(0.9rem,4vw,2.25rem)] leading-tight whitespace-nowrap truncate">
            {expense.toFixed(2)} €
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border-2 border-warning/10 border-dashed bg-warning/5 p-4 md:p-8 overflow-hidden">
        <div className="flex justify-between items-center w-full">
            <div className="badge badge-soft badge-warning gap-1">
              <Activity className="h-4 w-4 md:h-4 md:w-4 shrink-0"/> 
              <span>Dépense vs Revenu</span>
            </div>
            <div className="font-bold whitespace-nowrap">{ratio.toFixed(2)}%</div>
        </div>
        <progress className="progress progress-warning w-full" value={ratio} max={100} />
      </div>
        {/* You can open the modal using document.getElementById('ID').showModal() method */}
        <button 
          className="btn btn-warning" 
          onClick={()=>(document.getElementById('my_modal_3') as HTMLDialogElement).showModal()}>
          <PlusCircle className="text-green-700 h-4 w-4 md:h-4 md:w-4 shrink-0"/>
          Ajouter une transaction
        </button>
        
      <div className="overflow-x-auto flex flex-col gap-4 rounded-2xl border-2 border-warning/10 border-dashed bg-warning/5 p-4 md:p-8 overflow-hidden">

  <table className="table">
    {/* head */}
    <thead>
      <tr>
        <th>#</th>
        <th>Description</th>
        <th>Montant</th>
        <th>Date</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {/* row 1 */}
      {transactions.map((t, index) => (
        <tr key={t.id}>
          <th>{index + 1}</th>
          <td>{t.text}</td>
          <td className="font-semibold flex items-center gap-2">
            {t.amount > 0 ? (
            <TrendingUp className="h-4 w-4 text-success md:h-4 md:w-4 shrink-0"/>
          ): (
            <TrendingDown className="h-4 w-4 text-error md:h-4 md:w-4 shrink-0"/>
          )}
          {t.amount > 0 ? `+${t.amount}` : `${t.amount}`}
          </td>
          <td>{formatData(t.created_at)}</td>
          <td>
            <button onClick={() => deleteTransaction(t.id)} title="Supprimer" className="btn btn-ghost btn-sm">
              <Trash className="h-4 w-4 text-red-400 md:h-4 md:w-4 shrink-0 cursor-pointer hover:scale-110 transition-all duration-200 hover:text-red-800"/> 
            </button>
          </td>
          
        </tr>
      ))}
   
    </tbody>
  </table>
</div>
<dialog id="my_modal_3" className="modal backdrop-blur">
          <div className="modal-box border-2 border-warning/10 border-dashed">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h3 className="font-bold text-lg">Ajouter une transaction</h3>
            <div className="flex flex-col gap-4 mt-4">
              {/* texte */}
              <div className="flex flex-col gap-2">
                <label htmlFor="text">Texte</label>
                <input 
                type="text" 
                name="text" 
                value={text} 
                onChange={(e) => setText(e.target.value)} 
                placeholder="Entrez le texte"
                className="input input-bordered w-full"
                />
              </div>
              {/* amount */}
              <div className="flex flex-col gap-2">
                <label htmlFor="amount">Montant(Négatif pour les dépenses, positif pour les revenus)</label>
                <input 
                type="number" 
                name="amount" 
                value={amount} 
                onChange={(e) => setAmount(
                  e.target.value === "" ? "" : Number(e.target.value)

                )} 
                placeholder="Entrez le montant"
                className="input input-bordered w-full"
                />
              </div>
              {/* bouton */}
              <button 
              disabled={loading}
              className="btn btn-primary" onClick={addTransaction}>
                <PlusCircle className="text-green-700 h-4 w-4 md:h-4 md:w-4 shrink-0"/>
                Ajouter
              </button>
            </div>
          </div>
        </dialog>
     
    </div>
  );
}
