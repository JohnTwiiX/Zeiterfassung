import { StyleSheet } from "react-native";
import { FAB } from "react-native-paper";

export default function HistoryButton({ setHistoryVisible }: {
    setHistoryVisible: React.Dispatch<React.SetStateAction<boolean>>
}) {
    return (
        <FAB
            style={styles.button}
            icon='history'
            onPress={() => { setHistoryVisible(true) }}
        />
    );
}

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        bottom: 32,
        left: 32,
        backgroundColor: '#B08AD8'
    }
})