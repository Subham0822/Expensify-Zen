"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Car,
  CreditCard,
  LayoutGrid,
  PlusCircle,
  ShoppingBag,
  Trash2,
  Utensils,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/header";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { addExpense, deleteExpense as deleteExpenseFromDB, getExpenses, Expense } from "@/lib/firestore";

const expenseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  amount: z.coerce.number().positive("Amount must be a positive number."),
  category: z.enum(["food", "transport", "shopping", "bills", "other"]),
});

type ExpenseCategory = Expense["category"];

const categoryIcons: Record<ExpenseCategory, React.ReactNode> = {
  food: <Utensils className="h-4 w-4" />,
  transport: <Car className="h-4 w-4" />,
  shopping: <ShoppingBag className="h-4 w-4" />,
  bills: <CreditCard className="h-4 w-4" />,
  other: <LayoutGrid className="h-4 w-4" />,
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [isFetching, setIsFetching] = React.useState(true);

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  React.useEffect(() => {
    if (user) {
      const unsubscribe = getExpenses(user.uid, (newExpenses) => {
        setExpenses(newExpenses);
        setIsFetching(false);
      });
      return () => unsubscribe();
    }
  }, [user]);


  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      name: "",
      amount: "" as unknown as number, // Fix: Use empty string to avoid uncontrolled component warning
      category: "other",
    },
  });

  const totalSpent = React.useMemo(() => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }, [expenses]);

  async function onSubmit(values: z.infer<typeof expenseSchema>) {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add an expense.",
        variant: "destructive",
      });
      return;
    }
    try {
      await addExpense(user.uid, values);
      form.reset();
      toast({
        title: "Expense Added",
        description: `${values.name} has been successfully added.`,
      });
    } catch (error) {
      console.error("Error adding expense:", error);
      toast({
        title: "Error",
        description: "There was a problem adding your expense.",
        variant: "destructive",
      });
    }
  }

  async function deleteExpense(id: string) {
    if (!user) return;
    try {
      await deleteExpenseFromDB(user.uid, id);
      toast({
        title: "Expense Removed",
        description: "The expense has been successfully removed.",
      });
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast({
        title: "Error",
        description: "There was a problem removing the expense.",
        variant: "destructive",
      });
    }
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };
  
  if (loading || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <span className="text-2xl">💸</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalSpent)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total expenses this period
              </p>
            </CardContent>
          </Card>
          <Card className="md:col-span-1 lg:col-span-3">
            <CardHeader>
              <CardTitle>Add a New Expense</CardTitle>
              <CardDescription>
                Fill out the form to add a new transaction to your list.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="lg:col-span-2">
                        <FormLabel>Expense Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Lunch with friends" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g. 25.50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="food">Food</SelectItem>
                            <SelectItem value="transport">Transport</SelectItem>
                            <SelectItem value="shopping">Shopping</SelectItem>
                            <SelectItem value="bills">Bills</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="sm:col-start-2 lg:col-start-4 self-end">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Expense
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>
              A list of your recent transactions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[60px] sm:table-cell">
                    Category
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="hidden w-[100px] sm:table-cell text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isFetching ? (
                   <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Loading expenses...
                    </TableCell>
                  </TableRow>
                ) : expenses.length > 0 ? (
                  expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                          {categoryIcons[expense.category]}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{expense.name}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(expense.amount)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center justify-center">
                          <Button
                            aria-label="Delete expense"
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteExpense(expense.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No expenses yet. Add one to get started!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
