import { DataTable } from "react-native-paper";
import { formatCurrency } from "@/utils/number";

interface Row {
  month: string;
  total: number;
}

interface Props {
  data: Row[];
}

export default function MonthlyAggregateTable({ data }: Props) {
  return (
    <DataTable style={{ marginBottom: 24 }}>
      <DataTable.Header>
        <DataTable.Title>Month</DataTable.Title>
        <DataTable.Title numeric>Total</DataTable.Title>
      </DataTable.Header>

      {data.length === 0 && (
        <DataTable.Row>
          <DataTable.Cell>No data</DataTable.Cell>
          <DataTable.Cell numeric>—</DataTable.Cell>
        </DataTable.Row>
      )}

      {data.map((row, index) => (
        <DataTable.Row key={index}>
          <DataTable.Cell>{row.month}</DataTable.Cell>
          <DataTable.Cell numeric>
            {formatCurrency(row.total)}
          </DataTable.Cell>
        </DataTable.Row>
      ))}
    </DataTable>
  );
}
