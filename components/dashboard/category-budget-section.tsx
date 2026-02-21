import { List } from "react-native-paper";
import type { BudgetUsed } from "@/hooks/use-monthly-budget-data";
import CategoryBudgetCard from "./category-budget-card";

interface Props {
  budgetUsed: BudgetUsed[];
}

export default function CategoryBudgetSection({
  budgetUsed,
}: Props) {
  return (
    <List.Section>
      {budgetUsed.map(item => (
        <CategoryBudgetCard
          key={item.category.id}
          category={item.category}
          amountUsed={item.amountUsed}
          budgetAmount={item.budget}
        />
      ))}
    </List.Section>
  );
}