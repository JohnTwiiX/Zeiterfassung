import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text, Button, Modal, List, Dialog } from "react-native-paper";
import firestore from '@react-native-firebase/firestore';
import { Time, timeDifference } from "./TimeTable";

type DateData = {
    date: string;
    startTime: string;
    stopTime: string;
    stopDate: string;
    // Weitere erforderliche Eigenschaften
};

type Dates = {
    date: DateData;
    id: string;
};

type DateArray = {
    title: string;
    id: string;
    dates: Dates[];
};

async function getAllDates(date: string): Promise<{}[]> {
    const dateArray: Dates[] = [];

    const snapshot = await firestore().collection(date).get();

    snapshot.docs.forEach((dateValue) => {
        const item: Dates = {
            date: dateValue.data() as DateData,
            id: dateValue.id,
        };
        dateArray.push(item);
    });
    return dateArray;
}

export default function HistoryDialog({ historyVisible, setHistoryVisible }: {
    historyVisible: boolean;
    setHistoryVisible: React.Dispatch<React.SetStateAction<boolean>>
}) {
    const [selectedYear, setSelectedYear] = React.useState('');
    const [selectedMonth, setSelectedMonth] = React.useState('');
    const [selectedDay, setSelectedDay] = React.useState<Dates>({
        date: {
            date: '',
            startTime: '',
            stopTime: '',
            stopDate: '',
        },
        id: ''
    });


    const [deleteVisible, setDeleteVisible] = React.useState(false);
    const [allDates, setAllDates] = React.useState<DateArray[]>([]);


    React.useEffect(() => {
        if (historyVisible === true) {
            fetchData();
        }
    }, [historyVisible === true]);

    const fetchData = async () => {
        const snapshot = await firestore().collection('Sandra-All').get();
        const datesArray = await Promise.all(
            snapshot.docs.map(async (doc) => ({
                title: doc.data().title,
                id: doc.id,
                dates: await getAllDates(doc.data().title),
            }))
        );
        setAllDates(datesArray as DateArray[]);
    };

    const handleyear = () => {
        const uniqueYearsSet = new Set<string>();

        allDates.forEach((date) => {
            const yearMatch = date.title.match(/\d{4}/); // Sucht nach vier aufeinanderfolgenden Ziffern, die das Jahr repräsentieren
            if (yearMatch) {
                uniqueYearsSet.add(yearMatch[0]);
            }
        });

        const uniqueYearsArray = Array.from(uniqueYearsSet);
        return uniqueYearsArray;
    }

    const handleTitle = (title: string) => {
        const titleArray = title.split('-');
        const titleString = titleArray[2];
        return titleString
    }

    const handleSelection = (title: string) => {
        if (selectedMonth === title) {
            setSelectedMonth('');
        } else {
            setSelectedMonth(title)
        }
    }

    const handleSelectionYear = (title: string) => {
        if (selectedYear === title) {
            setSelectedYear('');
        } else {
            setSelectedYear(title)
        }
    }

    const closeHistoryDialog = () => {
        setHistoryVisible(false);
        setSelectedMonth('');
        setSelectedYear('');
    }

    const deleteItemDB = () => {
        firestore()
            .collection(selectedMonth)
            .doc(selectedDay.id)
            .delete();

        fetchData();
    }

    return (
        <Modal visible={historyVisible} onDismiss={closeHistoryDialog}>
            <View style={styles.dialog}>
                <Text style={styles.title}>Historie</Text>
                <ScrollView style={{ maxHeight: '80%' }}>
                    {handleyear().map((year, indexYear) => (
                        <List.Accordion key={indexYear} title={year} expanded={selectedYear === year} onPress={() => { handleSelectionYear(year) }}>
                            {allDates
                                .filter((date) => date.title.includes(year)) // Filtern Sie die Daten nach dem Jahr
                                .map((filteredDate, index) => (
                                    <List.Accordion
                                        key={index}
                                        style={styles.month}
                                        title={handleTitle(filteredDate.title)}
                                        expanded={selectedMonth === filteredDate.title}
                                        onPress={() => { handleSelection(filteredDate.title) }}
                                    >
                                        {filteredDate.dates.map((value, indexKey) => (
                                            <List.Accordion
                                                key={indexKey}
                                                style={styles.day}
                                                title={value.date.date}
                                                right={() => {
                                                    const timeData = value.date as Time; // Type Assertion, um TypeScript zu sagen, dass value.date vom Typ Time ist
                                                    const diffTime = timeDifference(timeData);
                                                    return (<Text style={[{ color: diffTime.isNegative ? 'green' : 'red' }]}>{diffTime.hours}h {diffTime.minutes}min</Text>)
                                                }}>
                                                <List.Item style={styles.time} title={`Startzeit: ${value.date.startTime}`} />
                                                <List.Item style={styles.time} title={`Endzeit: ${value.date.stopTime}`} />
                                                <Button style={styles.deleteItemButton} onPress={() => {
                                                    setSelectedDay(value); setDeleteVisible(true)
                                                }}>Löschen</Button>
                                            </List.Accordion>
                                        ))}
                                    </List.Accordion>
                                ))}
                        </List.Accordion>
                    ))}
                </ScrollView>
                <Button onPress={closeHistoryDialog}>Schließen</Button>
            </View>
            <Dialog visible={deleteVisible} onDismiss={() => setDeleteVisible(false)}>
                <Dialog.Title>Möchtest du diesen Tag löschen?</Dialog.Title>
                <Dialog.Content>
                    <View style={styles.deleteItemContainer}>
                        <Text style={styles.deleteItem}>Datum: </Text>
                        <Text style={styles.deleteItem}>{selectedDay.date.date}</Text>
                    </View>
                    <View style={styles.deleteItemContainer}>
                        <Text style={styles.deleteItem}>Startzeit: </Text>
                        <Text style={styles.deleteItem}>{selectedDay.date.startTime}</Text>
                    </View>
                    <View style={styles.deleteItemContainer}>
                        <Text style={styles.deleteItem}>Endzeit: </Text>
                        <Text style={styles.deleteItem}>{selectedDay.date.stopTime}</Text>
                    </View>
                </Dialog.Content>
                <Dialog.Actions style={styles.deleteButtonsConatiner}>
                    <Button onPress={() => { deleteItemDB(); setDeleteVisible(false) }}>Ja</Button>
                    <Button onPress={() => setDeleteVisible(false)}>Nein</Button>
                </Dialog.Actions>
            </Dialog>
        </Modal>
    );
}

const styles = StyleSheet.create({
    dialog: {
        backgroundColor: 'whitesmoke'
    },
    title: {
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 32,
        marginTop: 8
    },
    month: {
        paddingLeft: 32
    },
    day: {
        paddingLeft: 64
    },
    time: {
        paddingLeft: 96
    },
    deleteItem: {
        fontSize: 18,
        marginBottom: 8
    },
    deleteItemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    deleteButtonsConatiner: {
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    deleteItemButton: {
        margin: 16
    }
})