import { ReactNode } from "react";
import { Card, Text, useTheme } from "react-native-paper";
import { View } from "react-native";

interface Props {
  amount: string;
  date: string;
  title?: string;
  onPress?: () => void;
  children?: ReactNode;
}

export default function TransactionRow({ amount, date, title, onPress, children }: Props) {
  const theme = useTheme();

  return (
    <Card mode="contained" onPress={onPress} style={{ borderRadius: 12, backgroundColor: theme.colors.surface, marginBottom: 2 }}>
      <Card.Content style={{ gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
          <Text variant="titleMedium" numberOfLines={1} adjustsFontSizeToFit style={{ color: theme.colors.onSurface, fontWeight: "800", flexShrink: 1 }}>{amount}</Text>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>{date}</Text>
        </View>
        {title ? <Text variant="bodyMedium" numberOfLines={2} style={{ color: theme.colors.onSurface }}>{title}</Text> : null}
        {children}
      </Card.Content>
    </Card>
  );
}
