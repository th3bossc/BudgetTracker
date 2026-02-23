import { Dialog, Portal, Text, Button } from "react-native-paper";

interface Props {
    visible: boolean;
    onDismiss: () => void;
    onConfirm: () => void | Promise<void>;
    text: string;
}

const DeleteConfirmationDialog = ({
    visible,
    onDismiss,
    onConfirm,
}: Props) => {
    return (
        <Portal>
            <Dialog
                visible={visible}
                onDismiss={onDismiss}
            >
                <Dialog.Title>Delete?</Dialog.Title>
                <Dialog.Content>
                    <Text>
                        Are you sure you want to delete this item?
                    </Text>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={onDismiss}>
                        Cancel
                    </Button>
                    <Button
                        textColor="red"
                        onPress={onConfirm}
                    >
                        Delete
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    )
}

export default DeleteConfirmationDialog;