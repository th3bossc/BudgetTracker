import { useState } from "react";
import { List } from "react-native-paper";
import type { BudgetUsed } from "@/hooks/use-dashboard-data";
import CategoryBudgetCard from "./category-budget-card";

interface Props {
  budgetUsed: BudgetUsed[];
}

export default function CategoryBudgetSection({
  budgetUsed,
}: Props) {
  const [expanded, setExpanded] = useState(true);

  return (
    <List.Section>
      <List.Accordion
        title="Category Budgets"
        expanded={expanded}
        onPress={() => setExpanded(!expanded)}
      >
        {budgetUsed.map(item => (
          <CategoryBudgetCard
            key={item.category.id}
            category={item.category}
            amountUsed={item.amountUsed}
            budgetAmount={item.budget}
          />
        ))}
      </List.Accordion>
    </List.Section>
  );
}