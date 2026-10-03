import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { Keyboard, Platform, type EmitterSubscription, type PressableProps, type View } from "react-native";
import {
    Dropdown as PaperDropdown,
    type DropdownProps,
    type DropdownRef,
} from "react-native-paper-dropdown";
import { TouchableRipple } from "react-native-paper";

/**
 * `react-native-paper-dropdown` opens its menu in the same event in which it
 * dismisses the keyboard. On Android that can position the menu using the
 * keyboard-reduced viewport. Waiting for `keyboardDidHide` avoids that race.
 */
const KeyboardAwareDropdown = forwardRef<DropdownRef, DropdownProps>((props, ref) => {
    const dropdownRef = useRef<DropdownRef>(null);
    const keyboardHideSubscription = useRef<EmitterSubscription | null>(null);

    useEffect(() => () => {
        keyboardHideSubscription.current?.remove();
    }, []);

    useImperativeHandle(ref, () => ({
        focus: () => dropdownRef.current?.focus(),
        blur: () => dropdownRef.current?.blur(),
    }), []);

    const openAfterKeyboardDismisses = useCallback(() => {
        if (Platform.OS !== "android" || !Keyboard.isVisible()) {
            dropdownRef.current?.focus();
            return;
        }

        keyboardHideSubscription.current?.remove();
        keyboardHideSubscription.current = Keyboard.addListener("keyboardDidHide", () => {
            keyboardHideSubscription.current?.remove();
            keyboardHideSubscription.current = null;
            dropdownRef.current?.focus();
        });

        Keyboard.dismiss();
    }, []);

    const Touchable = useMemo(() => forwardRef<View, PressableProps>(
        function KeyboardAwareTouchable({ onPress: _toggleMenu, children, ...touchableProps }, touchableRef) {
            return (
            <TouchableRipple
                {...(touchableProps as any)}
                ref={touchableRef}
                onPress={openAfterKeyboardDismisses}
            >
                {children ?? null}
            </TouchableRipple>
            );
        }
    ), [openAfterKeyboardDismisses]);

    return <PaperDropdown {...props} ref={dropdownRef} Touchable={Touchable} />;
});

KeyboardAwareDropdown.displayName = "KeyboardAwareDropdown";

export { KeyboardAwareDropdown as Dropdown };
