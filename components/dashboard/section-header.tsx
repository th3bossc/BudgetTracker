import { useMemo } from "react";
import { View } from "react-native";
import { Text, Button } from "react-native-paper";

interface Props {
  title: string;
  onCreate?: () => void;
  onViewAll?: () => void;
}

export default function SectionHeader({
  title,
  onCreate,
  onViewAll,
}: Props) {
  const showButtons = useMemo(() => onCreate || onViewAll, [onCreate, onViewAll]);
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 4,
        marginBottom: 10,
        paddingHorizontal: 2,
      }}
    >
      <Text variant="titleLarge" style={{ fontWeight: '800', letterSpacing: -0.3 }}>{title}</Text>

      {
        showButtons && (
          <View style={{ flexDirection: "row", gap: 8 }}>
            {
              onCreate && 
              <Button compact mode="contained-tonal" onPress={onCreate} icon="plus">
                Add
              </Button>
            }
            {
              onViewAll && (
              <Button compact onPress={onViewAll}>
                  View All
                </Button>
              )
            }
          </View>
        )
      }
    </View>
  );
}
