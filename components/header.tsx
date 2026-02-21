import { Appbar, Divider } from "react-native-paper";
import { IconSource } from "react-native-paper/lib/typescript/components/Icon";

interface Props {
    title: string;
    icon: IconSource;
    onPress: () => void;
}

const Header = ({ title, icon, onPress }: Props) => {
    return (
        <>
            <Appbar.Header elevated style={{ borderRadius: 16 }}>
                <Appbar.Content title={title} />
                <Appbar.Action
                    icon={icon}
                    onPress={onPress}
                />
            </Appbar.Header>

            <Divider style={{ marginVertical: 16}} />
        </>
    )
}

export default Header;