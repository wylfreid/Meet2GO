import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { IconSymbol } from './IconSymbol';

LocaleConfig.locales['fr'] = {
  monthNames: [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ],
  monthNamesShort: ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
  dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
  today: "Aujourd'hui"
};
LocaleConfig.defaultLocale = 'fr';

interface CustomDateTimePickerProps {
  isVisible: boolean;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
  date?: Date;
}

export function CustomDateTimePicker({
  isVisible,
  onConfirm,
  onCancel,
  date,
}: CustomDateTimePickerProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('00');
  const [period, setPeriod] = useState<'AM' | 'PM'>('PM');

  // Fonction utilitaire pour formater la date sans problème de fuseau horaire
  const formatDateForCalendar = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (isVisible) {
      const initialDate = date || new Date();
      setSelectedDate(initialDate);
      
      const initialHour = initialDate.getHours();
      setPeriod(initialHour >= 12 ? 'PM' : 'AM');
      setHour(String(initialHour % 12 || 12).padStart(2, '0'));
      setMinute(String(initialDate.getMinutes()).padStart(2, '0'));
    }
  }, [isVisible, date]);

  const handleDayPress = (day: any) => {
    // Créer une nouvelle date directement avec les valeurs du jour sélectionné
    const newDate = new Date(day.year, day.month - 1, day.day);
    
    // S'assurer que la date n'est pas dans le passé
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (newDate < today) {
      newDate.setTime(today.getTime());
    }
    
    setSelectedDate(newDate);
  };

  const handleConfirm = () => {
    // Créer une nouvelle date avec la date sélectionnée
    const finalDate = new Date(selectedDate);
    
    // Validation et conversion des heures
    let h = parseInt(hour, 10);
    if (isNaN(h) || h < 1 || h > 12) {
      h = 12;
      setHour('12');
    }

    // Validation et conversion des minutes
    let m = parseInt(minute, 10);
    if (isNaN(m) || m < 0 || m > 59) {
      m = 0;
      setMinute('00');
    }

    // Conversion en format 24h
    let finalHour = h;
    if (period === 'PM' && h < 12) {
      finalHour = h + 12;
    } else if (period === 'AM' && h === 12) {
      finalHour = 0;
    }

    // Définir l'heure locale sans conversion UTC
    finalDate.setHours(finalHour, m, 0, 0);
    onConfirm(finalDate);
  };

  const styles = getStyles(colorScheme);
  const calendarTheme = {
    backgroundColor: Colors[colorScheme].card,
    calendarBackground: Colors[colorScheme].card,
    textSectionTitleColor: '#b6c1cd',
    selectedDayBackgroundColor: Colors[colorScheme].tint,
    selectedDayTextColor: '#ffffff',
    todayTextColor: Colors[colorScheme].tint,
    dayTextColor: Colors[colorScheme].text,
    textDisabledColor: Colors[colorScheme].icon,
    dotColor: Colors[colorScheme].tint,
    selectedDotColor: '#ffffff',
    arrowColor: Colors[colorScheme].tint,
    monthTextColor: Colors[colorScheme].text,
    indicatorColor: Colors[colorScheme].text,
    textDayFontWeight: '300' as const,
    textMonthFontWeight: 'bold' as const,
    textDayHeaderFontWeight: '300' as const,
    textDayFontSize: 16,
    textMonthFontSize: 20,
    textDayHeaderFontSize: 14,
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onCancel}
    >
      <ThemedView style={styles.centeredView}>
        <ThemedView style={styles.modalView}>
          <ThemedView style={styles.header}>
            <ThemedText style={styles.headerText}>Sélectionner la date et l'heure</ThemedText>
            <TouchableOpacity onPress={onCancel}>
              <IconSymbol name="xmark" size={24} color={Colors[colorScheme].text} />
            </TouchableOpacity>
          </ThemedView>

          <Calendar
            current={formatDateForCalendar(selectedDate)}
            onDayPress={handleDayPress}
            markedDates={{
              [formatDateForCalendar(selectedDate)]: { 
                selected: true, 
                disableTouchEvent: false,
                selectedColor: Colors[colorScheme].tint
              }
            }}
            theme={calendarTheme}
            style={{ borderRadius: 16, overflow: 'hidden' }}
            minDate={formatDateForCalendar(new Date())} // Empêcher la sélection de dates passées
          />

          <ThemedView style={styles.timeSection}>
            <ThemedText style={styles.timeTitle}>Heure</ThemedText>
            <ThemedView style={styles.timeInputContainer}>
              <TextInput
                style={styles.timeInput}
                value={hour}
                onChangeText={setHour}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="00"
                placeholderTextColor={Colors[colorScheme].icon}
              />
              <ThemedText style={styles.timeSeparator}>:</ThemedText>
              <TextInput
                style={styles.timeInput}
                value={minute}
                onChangeText={setMinute}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="00"
                placeholderTextColor={Colors[colorScheme].icon}
              />
              <ThemedView style={styles.periodContainer}>
                <TouchableOpacity 
                  style={[styles.periodButton, period === 'AM' && styles.periodButtonSelected]}
                  onPress={() => setPeriod('AM')}>
                  <ThemedText style={[styles.periodText, period === 'AM' && styles.periodTextSelected]}>AM</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.periodButton, period === 'PM' && styles.periodButtonSelected]}
                  onPress={() => setPeriod('PM')}>
                  <ThemedText style={[styles.periodText, period === 'PM' && styles.periodTextSelected]}>PM</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <ThemedText style={styles.confirmButtonText}>Confirmer</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
}

const getStyles = (colorScheme: 'light' | 'dark') => StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: Colors[colorScheme].background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  timeSection: {
    marginTop: 20,
    backgroundColor: 'transparent',
  },
  timeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  timeInput: {
    backgroundColor: Colors[colorScheme].card,
    color: Colors[colorScheme].text,
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    textAlign: 'center',
    width: 60,
  },
  timeSeparator: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  periodContainer: {
    flexDirection: 'row',
    marginLeft: 'auto',
    backgroundColor: Colors[colorScheme].card,
    borderRadius: 8,
  },
  periodButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  periodButtonSelected: {
    backgroundColor: Colors[colorScheme].tint,
  },
  periodText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors[colorScheme].text,
  },
  periodTextSelected: {
    color: 'white',
  },
  confirmButton: {
    backgroundColor: Colors[colorScheme].tint,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 