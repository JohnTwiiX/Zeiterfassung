import React from "react";
import { StyleSheet, View } from "react-native";
import { Text, Button } from "react-native-paper";
import firestore from '@react-native-firebase/firestore';
import { currentDate } from "../App";


const time = {
    date: '',
    time: '',
    id: ''
}

function currentTimeNow() {
    const now = new Date();

    // Format the time using the German locale and the specified options
    const time = now.toLocaleTimeString('de-DE', {
        hour: 'numeric',
        minute: 'numeric',
        timeZone: 'Europe/Berlin'
    });

    const date = now.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    return { time, date }
}


export default function StartStopButton() {
    const [timerStarted, setTimerStarted] = React.useState(false);
    const [currentTime, setCurrentTime] = React.useState(time);

    React.useEffect(() => {
        const subscriber = firestore()
            .collection('Sandra-Current')
            .onSnapshot(snapshot => {
                if (snapshot.empty) {
                    setTimerStarted(false);
                } else {
                    setTimerStarted(true);
                    const data = snapshot.docs.pop();
                    const value = {
                        date: data?.data().date,
                        time: data?.data().time,
                        id: data?.id || ''
                    }
                    setCurrentTime(value);
                }
            });

        // Stop listening for updates when no longer required
        return () => subscriber();
    }, [])

    const startTimer = () => {
        const values = currentTimeNow();

        firestore()
            .collection('Sandra-Current')
            .add({
                date: values.date,
                time: values.time,
            })
            .then(() => {
                // console.log('Time added!');
            });
    }

    const stopTimer = () => {
        const values = currentTimeNow();
        const formattedDate = currentDate();

        firestore()
            .collection('Sandra-Current')
            .doc(currentTime.id)
            .delete();

        firestore()
            .collection(formattedDate)
            .add({
                date: currentTime.date,
                startTime: currentTime.time,
                stopTime: values.time,
                stopDate: values.date
            })
            .then(() => {
                // console.log('Add to times');
            })
    }

    return (
        <View style={{ flex: 1 }}>
            {timerStarted &&
                <View style={styles.timeContainer}>
                    <Text>{currentTime.date}</Text>
                    <View style={styles.currenTimeContainer}>
                        <Text style={{ marginRight: 16 }}>gestartet:</Text>
                        <Text style={styles.textTime}>{currentTime.time}</Text>
                    </View>
                </View>}
            <View style={styles.container}>
                {!timerStarted ?
                    <Button color="#B08AD8" mode='contained' style={styles.button} onPress={() => { startTimer() }}>Start</Button>
                    :
                    <Button color="#B08AD8" mode='contained' style={styles.button} onPress={() => { stopTimer() }}>Stop</Button>
                }
            </View>
        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 80,
        width: '100%',
        alignItems: 'center'
    },
    button: {
        width: 120,
    },
    timeContainer: {
        alignItems: 'center',
    },
    textTime: {
        fontSize: 28,
        fontWeight: 'bold'
    },
    currenTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    }
})