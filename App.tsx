import React from 'react';
import {
  AppState,
  StyleSheet,
  View,
} from 'react-native';
import Header from './components/Header';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import TimeTable from './components/TimeTable';
import StartStopButton from './components/StartStopButton';
import PlusButton from './components/PlusButton';
import AddTimeDialog from './components/AddTimeDialog';
import HistoryButton from './components/HistoryButton';
import HistoryDialog from './components/HistoryDialog';
import firestore from '@react-native-firebase/firestore';



export function fullscreen() {
  SystemNavigationBar.fullScreen(true);
}

export function currentDate(dateValue?: string) {
  // Aktuelles Datum erstellen
  let currentDate
  if (dateValue) {
    const [day, month, year] = dateValue.split(".");
    // Beachten Sie, dass der Monat 0-basiert ist, daher subtrahieren Sie 1
    currentDate = new Date(Number(year), Number(month) - 1, Number(day));
  } else {
    currentDate = new Date();
  }

  const date = currentDate.toLocaleString('de-DE', { month: 'long', year: 'numeric' });
  const dateArray = date.split(' ')
  const formattedDate = `Sandra-${dateArray[1]}-${dateArray[0]}`;
  console.log(formattedDate);

  saveNameInStorage(formattedDate)
  return formattedDate
}

async function saveNameInStorage(date: string) {
  const querySnapshot = await firestore()
    .collection('Sandra-All')
    .where('title', '==', date)
    .get();

  const item = {
    title: date
  }

  if (querySnapshot.empty) {
    // Das Datum ist noch nicht vorhanden, füge das Dokument zur Sammlung hinzu
    firestore()
      .collection('Sandra-All')
      .add(item)
      .then(() => {
        console.log('Dokument erfolgreich hinzugefügt.');
      })
      .catch(error => {
        console.error('Fehler beim Hinzufügen des Dokuments:', error);
      });
  }
}

function App(): React.JSX.Element {
  const [addTimeVisible, setAddTimeVisible] = React.useState(false);
  const [historyVisible, setHistoryVisible] = React.useState(false);
  fullscreen();
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <Header />
      <TimeTable />
      <StartStopButton />
      <PlusButton setAddTimeVisible={setAddTimeVisible} />
      <HistoryButton setHistoryVisible={setHistoryVisible} />
      <AddTimeDialog addTimeVisible={addTimeVisible} setAddTimeVisible={setAddTimeVisible} />
      <HistoryDialog historyVisible={historyVisible} setHistoryVisible={setHistoryVisible} />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
