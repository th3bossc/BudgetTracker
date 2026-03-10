import type { Iou } from "@/types/schema";

export const getIouRecoveredAmount = (iou: Iou): number => {
    const initialAmount = Math.max(iou.initialAmount, 0);
    const amountLeft = Math.max(iou.amountLeft, 0);
    return Math.max(initialAmount - amountLeft, 0);
};

export const getIouOutstandingAmount = (iou: Iou): number => {
    return Math.max(iou.amountLeft, 0);
};
