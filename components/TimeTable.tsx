import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Divider, Text } from "react-native-paper";
import firestore from '@react-native-firebase/firestore';
import { currentDate } from "../App";

export type Time = {
    date: string;
    startTime: string;
    stopTime: string;
    stopDate: string;
    id?: string;
};

export function timeDifference(time: Time) {
    // Parse the time strings into Date objects
    const startDateParts = time.date.split('.');
    const startDateString = `${startDateParts[2]}-${startDateParts[1]}-${startDateParts[0]}`;
    const startDateTime = new Date(`${startDateString}T${time.startTime}`);
    const stopDateParts = time.stopDate.split('.');
    const stopDateString = `${stopDateParts[2]}-${stopDateParts[1]}-${stopDateParts[0]}`;
    const stopDateTime = new Date(`${stopDateString}T${time.stopTime}`);
    // Calculate the time difference in milliseconds
    const timeDifferenceInMilliseconds = Number(stopDateTime) - Number(startDateTime);
    const hours = 8;
    const minutes = 45;

    const milliseconds = (hours * 60 * 60 * 1000) + (minutes * 60 * 1000);

    const resultDifference = timeDifferenceInMilliseconds - milliseconds;
    // Calculate the time difference in Stunden und Minuten
    const resultDifferenceInMinutes = Math.floor(Math.abs(resultDifference) / (1000 * 60));
    const isNegative = resultDifference < 0;

    const hoursDifference = Math.floor(resultDifferenceInMinutes / 60);
    const minutesDifference = resultDifferenceInMinutes % 60;

    const sign = isNegative ? false : true;

    // console.log(`${sign}${hoursDifference} Stunden und ${minutesDifference} Minuten`);

    const result = {
        isNegative: sign,
        hours: hoursDifference,
        minutes: minutesDifference
    }
    return result
}

export default function TimeTable() {
    const [times, setTimes] = React.useState<Time[]>([]);

    React.useEffect(() => {
        let timesArray = [];
        const formattedDate = currentDate();
        const unsubscribe = firestore()
            .collection(formattedDate)
            .onSnapshot(snapshot => {
                timesArray = snapshot.docs.map(time => ({
                    id: time.id,
                    date: time.data().date,
                    startTime: time.data().startTime,
                    stopTime: time.data().stopTime,
                    stopDate: time.data().stopDate
                }));
                // Sort the array by date and then by startTime
                timesArray.sort((a, b) => {
                    // Compare dates
                    const dateComparison = a.date.localeCompare(b.date);
                    if (dateComparison !== 0) {
                        return dateComparison;
                    }
                    // If dates are equal, compare startTime
                    return a.startTime.localeCompare(b.startTime);
                });
                setTimes(timesArray);
            });
        // Stop listening for updates when no longer required
        return () => unsubscribe();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.tableViewFirst}>
                    <Text style={styles.headerText}>Datum</Text>
                </View>
                <View style={styles.tableView}>
                    <Text style={styles.headerText}>Start</Text>
                </View>
                <View style={styles.tableView}>
                    <Text style={styles.headerText}>Ende</Text>
                </View>
                <View style={styles.tableViewLast}>
                    <Text style={styles.headerText}>Differenz</Text>
                </View>
            </View>
            <ScrollView>
                {times.map((time: Time, index) => {
                    // Deklaration der Variable diffTime innerhalb des map-Blocks
                    const diffTime = timeDifference(time);
                    return (
                        <TouchableOpacity key={index} style={{ marginBottom: 16 }}>
                            <View style={styles.scrollView}>
                                <View style={styles.tableViewFirst}>
                                    <Text style={styles.text}>{time.date}</Text>
                                </View>
                                <View style={styles.tableView}>
                                    <Text style={styles.text}>{time.startTime}</Text>
                                </View>
                                <View style={styles.tableView}>
                                    <Text style={styles.text}>{time.stopTime}</Text>
                                </View>
                                <View style={styles.tableViewLast}>
                                    <Text style={[styles.text, { color: diffTime.isNegative ? 'green' : 'red' }]}>{diffTime.hours}h {diffTime.minutes}min</Text>
                                </View>
                            </View>
                            <Divider />
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View >
    );
}

const styles = StyleSheet.create({
    header: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        borderBottomColor: 'black',
        borderBottomWidth: 2,
        paddingLeft: 8,
        paddingRight: 8
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    container: {
        padding: 16,
        height: '60%'
    },
    text: {
        fontSize: 18
    },
    scrollView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 8,
        paddingRight: 8
    },
    tableView: {
        width: '20%'
    },
    tableViewLast: {
        // width: '15%'
        flex: 1
    },
    tableViewFirst: {
        // width: '15%'
        flex: 1
    }
})