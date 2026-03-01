import IouForm from "@/components/forms/iou-form";
import { getIous, markIouPaid, updateIou } from "@/services/iou-service";
import type { IouUpdateInput } from "@/types/create";
import type { Iou } from "@/types/schema";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditIouPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();

  const [iou, setIou] = useState<Iou | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchIou = async () => {
      const ious = await getIous();
      const found = ious.find(item => item.id === id);
      setIou(found ?? null);
      setInitialLoading(false);
    };

    if (id) {
      void fetchIou();
    }
  }, [id]);

  const handleSubmit = async (data: IouUpdateInput) => {
    if (!id)
      return;

    try {
      setLoading(true);
      await updateIou(id, data);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!id)
      return;

    try {
      setLoading(true);
      await markIouPaid(id);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flexGrow: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header statusBarHeight={0}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Edit IOU" />
      </Appbar.Header>

      <Surface
        style={{
          flex: 1,
          padding: 20,
          gap: 16,
          backgroundColor: theme.colors.background,
        }}
      >
        {initialLoading ? (
          <ActivityIndicator />
        ) : iou ? (
          <>
            {iou.isPaid ? (
              <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
                This IOU is marked as paid.
              </Text>
            ) : (
              <Button
                mode="outlined"
                onPress={handleMarkAsPaid}
                loading={loading}
              >
                Mark as Paid
              </Button>
            )}

            <IouForm
              initialData={iou}
              expenseId={iou.expense.id}
              expenseMonthKey={iou.expenseMonthKey}
              createdMonthKey={iou.createdMonthKey}
              onSubmit={handleSubmit}
              loading={loading}
            />
          </>
        ) : (
          <Text variant="bodyLarge">IOU not found.</Text>
        )}
      </Surface>
    </SafeAreaView>
  );
}
