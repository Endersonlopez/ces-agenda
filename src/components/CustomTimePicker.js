import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { formatTo12Hour } from '../utils/timeValidation';

export default function CustomTimePicker({
  visible,
  title = 'Seleccionar hora',
  currentTime = '08:00',
  onConfirm,
  onCancel,
}) {
  const [manualTime, setManualTime] = useState(currentTime || '08:00');

  useEffect(() => {
    if (visible) {
      setManualTime(currentTime || '08:00');
    }
  }, [visible, currentTime]);

  // Chips preestablecidos de 8:00 AM a 6:00 PM (8 a 18)
  const hours = [];
  for (let h = 8; h <= 18; h++) {
    hours.push(h);
  }

  const handleHourSelect = (h) => {
    // Si ya había minutos escritos en manualTime, preservarlos o poner :00
    const parts = manualTime.split(':');
    const mm = parts[1] ? parts[1] : '00';
    setManualTime(`${String(h).padStart(2, '0')}:${mm}`);
  };

  const handleConfirm = () => {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!regex.test(manualTime)) {
      Alert.alert('Formato inválido', 'Ingrese la hora en formato HH:MM (ej: 07:30).');
      return;
    }
    onConfirm(manualTime);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="time-outline" size={20} color={COLORS.primary} style={styles.headerIcon} />
              <Text style={styles.title}>{title}</Text>
            </View>
          </View>

          {/* Campo de texto manual */}
          <Text style={styles.sectionLabel}>Ingreso manual (HH:MM)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.timeInput}
              value={manualTime}
              onChangeText={setManualTime}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />
          </View>

          {/* Selector de Horas preestablecidas */}
          <Text style={styles.sectionLabel}>Horas preestablecidas</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectorRow}
          >
            {hours.map((h) => {
              const selectedH = manualTime.split(':')[0];
              const isSelected = selectedH === String(h).padStart(2, '0');
              return (
                <TouchableOpacity
                  key={`h_${h}`}
                  onPress={() => handleHourSelect(h)}
                  style={[
                    styles.timeChip,
                    isSelected ? styles.timeChipActive : styles.timeChipInactive,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.timeChipText,
                      isSelected ? styles.timeChipTextActive : styles.timeChipTextInactive,
                    ]}
                  >
                    {String(h).padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Botones de acción */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={onCancel}
              style={styles.cancelButton}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              style={styles.confirmButton}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>Confirmar hora</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 44, 108, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  header: {
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  inputContainer: {
    marginBottom: 16,
  },
  timeInput: {
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    letterSpacing: 2,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
    marginTop: 4,
  },
  selectorRow: {
    paddingVertical: 4,
    gap: 8,
    marginBottom: 14,
  },
  timeChip: {
    width: 48,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginRight: 6,
  },
  timeChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
  },
  timeChipInactive: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  timeChipText: {
    fontSize: 15,
    fontWeight: '700',
  },
  timeChipTextActive: {
    color: COLORS.surface,
  },
  timeChipTextInactive: {
    color: COLORS.textPrimary,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  confirmButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.surface,
  },
});
