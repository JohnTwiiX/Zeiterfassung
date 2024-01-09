import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

export default function Header() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Arbeitszeiterfassung</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 80,
        backgroundColor: '#B08AD8',
        justifyContent: 'center',
        alignItems: 'center'
    },
    text: {
        fontWeight: 'bold',
        fontSize: 32,
        color: 'white'
    }
})