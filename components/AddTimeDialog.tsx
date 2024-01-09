import React from 'react';
import { StyleSheet, View } from 'react-native';
import DatePicker from 'react-native-date-picker';
import { Button, Modal, Text } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import { currentDate } from '../App';




export default function AddTimeDialog({ addTimeVisible, setAddTimeVisible }: {
    addTimeVisible: boolean;
    setAddTimeVisible: React.Dispatch<React.SetStateAction<boolean>>
}): React.JSX.Element {
    const [date, setDate] = React.useState<string>('-');
    const [startTime, setStartTime] = React.useState<string>('-');
    const [stopTime, setStopTime] = React.useState<string>('-');
    const [picker, setPicker] = React.useState(false);
    const [title, setTitle] = React.useState('');
    const [mode, setMode] = React.useState<"date" | "time" | "datetime" | undefined>(undefined);

    const setValues = (date: Date) => {
        if (title === 'Datum') {
            const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
            const dateString = date.toLocaleDateString('de-DE', options);
            setDate(dateString);
        } else {
            const timeString = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
            if (title === 'Startzeit') {
                setStartTime(timeString);
            } else {
                setStopTime(timeString);
            }
        }
    };

    const cleanAll = () => {
        setDate('-');
        setStartTime('-');
        setStopTime('-');
    }

    const isDisabled = () => {
        return date === '-' || startTime === '-' || stopTime === '-'
    }

    const saveInDB = async () => {
        const item = {
            date: date,
            startTime: startTime,
            stopTime: stopTime,
            stopDate: date
        }
        const formattedDate = currentDate(date);
        // Überprüfe, ob ein Dokument mit dem angegebenen Datum bereits vorhanden ist
        const querySnapshot = await firestore()
            .collection(formattedDate)
            .where('date', '==', date)
            .get();

        if (querySnapshot.empty) {
            // Das Datum ist noch nicht vorhanden, füge das Dokument zur Sammlung hinzu
            firestore()
                .collection(formattedDate)
                .add(item)
                .then(() => {
                    console.log('Dokument erfolgreich hinzugefügt.');
                })
                .catch(error => {
                    console.error('Fehler beim Hinzufügen des Dokuments:', error);
                });
        } else {
            // Das Datum ist bereits vorhanden, aktualisiere das vorhandene Dokument
            const existingDocId = querySnapshot.docs[0].id;
            firestore()
                .collection(formattedDate)
                .doc(existingDocId)
                .set(item, { merge: true })
                .then(() => {
                    console.log('Dokument erfolgreich aktualisiert.');
                })
                .catch(error => {
                    console.error('Fehler beim Aktualisieren des Dokuments:', error);
                });
        }
    }

    return (
        <Modal visible={addTimeVisible} style={{ flex: 1 }} onDismiss={() => { setAddTimeVisible(false) }}>
            <View style={styles.modalView}>
                <Text style={styles.title}>Füge deine Arbeitszeit hinzu</Text>
                <View style={styles.rowAround}>
                    <Button onPress={() => { setTitle('Datum'); setMode('date'); setPicker(true) }}>Datum</Button>
                    <Button onPress={() => { setTitle('Startzeit'); setMode('time'); setPicker(true) }}>Startzeit</Button>
                    <Button onPress={() => { setTitle('Endzeit'); setMode('time'); setPicker(true) }}>Endzeit</Button>
                </View>
                <View style={styles.rowAround}>
                    <Text style={styles.text}>{date}</Text>
                    <Text style={styles.text}>{startTime}</Text>
                    <Text style={styles.text}>{stopTime}</Text>
                </View>
                <View style={styles.btnContainer}>
                    <Button disabled={isDisabled()} onPress={() => { saveInDB(); cleanAll(); setAddTimeVisible(false) }}>Speichern</Button>
                    <Button onPress={() => { setAddTimeVisible(false); cleanAll() }}>Abbrechen</Button>
                </View>
            </View>
            <DatePicker
                modal
                title={title}
                open={picker}
                date={new Date()}
                locale='de'
                is24hourSource='locale'
                mode={mode}
                onConfirm={(date) => {
                    setPicker(false)
                    setValues(date)
                }}
                onCancel={() => {
                    setPicker(false)
                }}
                confirmText='Bestätigen'
                cancelText='Abbrechen'
            />
        </Modal>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 32
    },
    modalView: {
        backgroundColor: 'white',
        height: '50%',
        padding: 16,
        margin: 16,
        borderRadius: 10
    },
    text: {
        marginTop: 8,
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center'
    },
    rowAround: {
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    btnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        flex: 1
    }
});

