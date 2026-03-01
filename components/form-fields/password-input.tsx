import React, { useState } from "react";
import { TextInput } from "react-native-paper";

type Props = {
    label?: string;
    value?: string;
    onChangeText?: (data: string) => void;
    mode?: "flat" | "outlined" | undefined;
}

export default function PasswordInput({
    label,
    value,
    onChangeText,
    mode,
}: Props) {
    const [secure, setSecure] = useState(true);

    return (
        <TextInput
            label={label}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secure}
            mode={mode}
            right={
                <TextInput.Icon
                    icon={secure ? "eye-off" : "eye"}
                    onPress={() => setSecure(!secure)}
                />
            }
        />
    );
}