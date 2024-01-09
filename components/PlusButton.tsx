import { StyleSheet } from "react-native";
import { FAB } from "react-native-paper";

export default function PlusButton({ setAddTimeVisible }: {
    setAddTimeVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    return (
        <FAB
            style={styles.button}
            icon='plus'
            onPress={() => setAddTimeVisible(true)}
        />
    );
}

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        bottom: 32,
        right: 32,
        backgroundColor: '#B08AD8'
    }
})