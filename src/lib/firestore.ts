import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";
import { app } from "./firebase";

export const db = getFirestore(app);

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: "food" | "transport" | "shopping" | "bills" | "other";
  createdAt: Date;
}

export type NewExpense = Omit<Expense, "id" | "createdAt">;

// Function to add a new expense for a specific user
export const addExpense = async (
  userId: string,
  expense: NewExpense
): Promise<void> => {
  if (!userId) {
    throw new Error("User ID is required to add an expense.");
  }
  try {
    const expensesCollectionRef = collection(db, "expenses", userId, "items");
    await addDoc(expensesCollectionRef, {
      ...expense,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding document: ", error);
    throw new Error("Failed to add expense.");
  }
};

// Function to get real-time updates of expenses for a specific user
export const getExpenses = (
  userId: string,
  callback: (expenses: Expense[]) => void
): Unsubscribe => {
  if (!userId) {
    console.error("User ID is required to fetch expenses.");
    return () => {};
  }
  const expensesCollectionRef = collection(db, "expenses", userId, "items");
  const q = query(expensesCollectionRef, orderBy("createdAt", "desc"));

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const expenses: Expense[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData;
        expenses.push({
          id: doc.id,
          name: data.name,
          amount: data.amount,
          category: data.category,
          createdAt: data.createdAt?.toDate(),
        });
      });
      callback(expenses);
    },
    (error) => {
      console.error("Error fetching expenses in real-time:", error);
    }
  );

  return unsubscribe;
};

// Function to delete an expense for a specific user
export const deleteExpense = async (
  userId: string,
  expenseId: string
): Promise<void> => {
  if (!userId) {
    throw new Error("User ID is required to delete an expense.");
  }
  try {
    const expenseDocRef = doc(db, "expenses", userId, "items", expenseId);
    await deleteDoc(expenseDocRef);
  } catch (error) {
    console.error("Error deleting document: ", error);
    throw new Error("Failed to delete expense.");
  }
};
