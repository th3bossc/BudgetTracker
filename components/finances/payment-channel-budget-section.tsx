import { List } from "react-native-paper";
import type { PaymentChannelBudgetUsed } from "@/hooks/use-monthly-payment-channel-budget-data";
import PaymentChannelBudgetCard from "./payment-channel-budget-card";

interface Props {
  budgetUsed: PaymentChannelBudgetUsed[];
}

export default function PaymentChannelBudgetSection({ budgetUsed }: Props) {
  return (
    <List.Section>
      {budgetUsed.map(item => (
        <PaymentChannelBudgetCard
          key={item.paymentMethod.id}
          paymentMethod={item.paymentMethod}
          amountUsed={item.amountUsed}
          budgetAmount={item.budget}
          amountPending={item.amountPending}
        />
      ))}
    </List.Section>
  );
}
