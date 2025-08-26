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
  updateDoc,
  Timestamp,
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
  date: Date;
  createdAt: Date;
}

export type NewExpense = Omit<Expense, "id" | "createdAt">;
export type UpdatableExpense = Omit<Expense, "id" | "createdAt">;


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
      date: Timestamp.fromDate(expense.date),
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
  const q = query(expensesCollectionRef, orderBy("date", "desc"));

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
          date: data.date.toDate(),
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

// Function to update an expense for a specific user
export const updateExpense = async (
  userId: string,
  expenseId: string,
  expense: UpdatableExpense
): Promise<void> => {
  if (!userId) {
    throw new Error("User ID is required to update an expense.");
  }
  try {
    const expenseDocRef = doc(db, "expenses", userId, "items", expenseId);
    await updateDoc(expenseDocRef, {
      ...expense,
      date: Timestamp.fromDate(expense.date),
    });
  } catch (error) {
    console.error("Error updating document: ", error);
    throw new Error("Failed to update expense.");
  }
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
