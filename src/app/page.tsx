
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
  CalendarIcon,
  Pencil,
  Wallet,
  Landmark,
  BadgeCent,
} from "lucide-react";
import { format, startOfMonth, isSameMonth, isToday } from "date-fns";

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
import {
  addExpense,
  deleteExpense as deleteExpenseFromDB,
  updateExpense,
  getExpenses,
  Expense,
  NewExpense,
  UpdatableExpense,
} from "@/lib/firestore";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";


const expenseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  amount: z.coerce.number().positive("Amount must be a positive number."),
  category: z.enum(["food", "transport", "shopping", "bills", "other"]),
  paymentMethod: z.enum(["cash", "upi"]),
  date: z.date(),
});

type ExpenseCategory = Expense["category"];

const categoryIcons: Record<ExpenseCategory, React.ReactNode> = {
  food: <Utensils className="h-4 w-4" />,
  transport: <Car className="h-4 w-4" />,
  shopping: <ShoppingBag className="h-4 w-4" />,
  bills: <CreditCard className="h-4 w-4" />,
  other: <LayoutGrid className="h-4 w-4" />,
};

const paymentMethodIcons: Record<Expense['paymentMethod'], React.ReactNode> = {
  cash: <Wallet className="h-4 w-4" />,
  upi: <Landmark className="h-4 w-4" />,
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

function EditExpenseDialog({
  expense,
  onUpdate,
}: {
  expense: Expense;
  onUpdate: (values: UpdatableExpense) => void;
}) {
  const [open, setOpen] = React.useState(false);

  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      name: expense.name,
      amount: expense.amount,
      category: expense.category,
      paymentMethod: expense.paymentMethod,
      date: expense.date,
    },
  });

  const handleSubmit = (values: z.infer<typeof expenseSchema>) => {
    onUpdate(values);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          aria-label="Edit expense"
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-primary"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
          <DialogDescription>
            Make changes to your expense here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
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
                    <Input type="number" placeholder="e.g. 1500.50" {...field} />
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
             <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Expense</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                 <Button type="button" variant="ghost">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


function ExpenseTable({ expenses, onUpdate, onDelete }: {
  expenses: Expense[];
  onUpdate: (expenseId: string, values: UpdatableExpense) => void;
  onDelete: (expenseId: string) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Category</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Payment Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="w-[100px] text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.length > 0 ? (
          expenses.map((expense) => (
            <TableRow key={expense.id} className="transition-colors">
              <TableCell>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  {categoryIcons[expense.category]}
                </div>
              </TableCell>
              <TableCell className="font-medium">{expense.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {format(expense.date, "PPP")}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    {paymentMethodIcons[expense.paymentMethod]}
                  </div>
                  <span className="capitalize">{expense.paymentMethod}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(expense.amount)}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center">
                  <EditExpenseDialog
                    expense={expense}
                    onUpdate={(values) => onUpdate(expense.id, values)}
                  />
                  <Button
                    aria-label="Delete expense"
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(expense.id)}
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
              colSpan={6}
              className="h-24 text-center text-muted-foreground"
            >
              No expenses for this period.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}


export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [isFetching, setIsFetching] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);
  const expensesPerPage = 5;


  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
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
      amount: "" as unknown as number,
      category: "other",
      paymentMethod: "cash",
      date: new Date(),
    },
  });

  const { currentMonthExpenses, pastMonthsExpenses } = React.useMemo(() => {
    const today = new Date();
    const current = expenses.filter(expense => isSameMonth(expense.date, today));
    const past = expenses.filter(expense => !isSameMonth(expense.date, today));
    
    const groupedByMonth = past.reduce((acc, expense) => {
      const monthKey = format(startOfMonth(expense.date), 'yyyy-MM');
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: startOfMonth(expense.date),
          expenses: []
        };
      }
      acc[monthKey].expenses.push(expense);
      return acc;
    }, {} as Record<string, { month: Date; expenses: Expense[] }>);

    return {
      currentMonthExpenses: current,
      pastMonthsExpenses: Object.values(groupedByMonth).sort((a, b) => b.month.getTime() - a.month.getTime())
    };
  }, [expenses]);
  
  const dailyAndMonthlyTotals = React.useMemo(() => {
    const totals = currentMonthExpenses.reduce(
      (acc, expense) => {
        acc.monthlyTotal += expense.amount;
        if (expense.paymentMethod === "cash") {
          acc.monthlyCash += expense.amount;
        } else if (expense.paymentMethod === "upi") {
          acc.monthlyUpi += expense.amount;
        }
        if (isToday(expense.date)) {
          acc.dailyTotal += expense.amount;
        }
        return acc;
      },
      { monthlyTotal: 0, monthlyCash: 0, monthlyUpi: 0, dailyTotal: 0 }
    );
    return totals;
  }, [currentMonthExpenses]);

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
      await addExpense(user.uid, values as NewExpense);
      form.reset();
      form.setValue("date", new Date());
      form.setValue("paymentMethod", "cash");
      form.setValue("category", "other");
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
  
  async function handleUpdateExpense(expenseId: string, values: UpdatableExpense) {
    if (!user) return;
    try {
      await updateExpense(user.uid, expenseId, values);
      toast({
        title: "Expense Updated",
        description: "The expense has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating expense:", error);
      toast({
        title: "Error",
        description: "There was a problem updating the expense.",
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

  // Pagination logic for current month expenses
  const totalPages = Math.ceil(currentMonthExpenses.length / expensesPerPage);
  const paginatedCurrentMonthExpenses = currentMonthExpenses.slice(
    (currentPage - 1) * expensesPerPage,
    currentPage * expensesPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
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
      <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6 animate-in fade-in-50">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
           <Card className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Spent (This Month)
              </CardTitle>
              <span className="text-2xl">💸</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(dailyAndMonthlyTotals.monthlyTotal)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total for {format(new Date(), "MMMM yyyy")}
              </p>
            </CardContent>
          </Card>
           <Card className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Spent (Today)
              </CardTitle>
              <BadgeCent className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(dailyAndMonthlyTotals.dailyTotal)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total for {format(new Date(), "do MMMM")}
              </p>
            </CardContent>
          </Card>
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cash Spent</CardTitle>
              <Wallet className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(dailyAndMonthlyTotals.monthlyCash)}
              </div>
               <p className="text-xs text-muted-foreground">
                This month via Cash
              </p>
            </CardContent>
          </Card>
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">UPI Spent</CardTitle>
              <Landmark className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(dailyAndMonthlyTotals.monthlyUpi)}
              </div>
               <p className="text-xs text-muted-foreground">
                This month via UPI
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card className="transition-all hover:shadow-md">
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
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="lg:col-span-2">
                      <FormLabel>Expense Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Lunch with friends"
                          {...field}
                        />
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
                        <Input
                          type="number"
                          placeholder="e.g. 1500.50"
                          {...field}
                        />
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
                  <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col pt-2">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full sm:col-span-2 lg:col-span-6"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Expense
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>
              A list of your transactions for the current month.
            </CardDescription>
          </CardHeader>
          <CardContent>
             {isFetching ? (
              <div className="h-24 text-center text-muted-foreground flex items-center justify-center">
                Loading expenses...
              </div>
            ) : currentMonthExpenses.length > 0 ? (
                <>
                  <ExpenseTable
                    expenses={paginatedCurrentMonthExpenses}
                    onUpdate={handleUpdateExpense}
                    onDelete={deleteExpense}
                  />
                  {totalPages > 1 && (
                    <Pagination className="mt-4">
                      <PaginationContent>
                        <PaginationItem>
                          <Button 
                            variant="outline" 
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                          >
                            <PaginationPrevious href="#" />
                          </Button>
                        </PaginationItem>
                        <PaginationItem>
                          <span className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages}
                          </span>
                        </PaginationItem>
                        <PaginationItem>
                          <Button 
                            variant="outline"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                          >
                            <PaginationNext href="#" />
                          </Button>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </>
             ) : (
               <div className="h-24 text-center text-muted-foreground flex items-center justify-center">
                 No expenses yet. Add one to get started!
               </div>
             )}
          </CardContent>
        </Card>
        
         {pastMonthsExpenses.length > 0 && (
          <Card className="transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle>Past Expenses</CardTitle>
              <CardDescription>
                Your transaction history from previous months.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {pastMonthsExpenses.map(({ month, expenses: monthExpenses }) => {
                  const monthTotal = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
                  return (
                    <AccordionItem key={month.toISOString()} value={month.toISOString()}>
                      <AccordionTrigger>
                        <div className="flex justify-between w-full pr-4">
                          <span>{format(month, "MMMM yyyy")}</span>
                          <span className="font-semibold">{formatCurrency(monthTotal)}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ExpenseTable
                          expenses={monthExpenses}
                          onUpdate={handleUpdateExpense}
                          onDelete={deleteExpense}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

    