import { Appbar, Divider, useTheme } from "react-native-paper";
import { IconSource } from "react-native-paper/lib/typescript/components/Icon";

interface Props {
    title: string;
    flushed?: boolean;
    icon?: IconSource;
    onPress?: () => void;
}

const Header = ({ title, icon, onPress, flushed = false }: Props) => {
    const theme = useTheme();
    return (
        <>
            <Appbar.Header elevated={false} style={{ borderRadius: 0, backgroundColor: theme.colors.background, minHeight: 60 }} statusBarHeight={0}>
                <Appbar.Content title={title} titleStyle={{ fontSize: 25, fontWeight: '800', letterSpacing: -0.6, color: theme.colors.onBackground }} />
                {
                    icon && (
                        <Appbar.Action
                            icon={icon}
                            onPress={onPress}
                        />
                    )
                }
            </Appbar.Header>

            <Divider style={{ marginVertical: 12, opacity: 0.45 }} />
        </>
    )
}

export default Header;
