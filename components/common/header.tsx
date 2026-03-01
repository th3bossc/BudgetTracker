import { Appbar, Divider } from "react-native-paper";
import { IconSource } from "react-native-paper/lib/typescript/components/Icon";

interface Props {
    title: string;
    flushed?: boolean;
    icon?: IconSource;
    onPress?: () => void;
}

const Header = ({ title, icon, onPress, flushed = false }: Props) => {
    return (
        <>
            <Appbar.Header elevated={!flushed} style={{ borderRadius: 16 }} statusBarHeight={0}>
                <Appbar.Content title={title} />
                {
                    icon && (
                        <Appbar.Action
                            icon={icon}
                            onPress={onPress}
                        />
                    )
                }
            </Appbar.Header>

            <Divider style={{ marginVertical: 16}} />
        </>
    )
}

export default Header;