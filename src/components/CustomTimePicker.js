// Selector modal exclusivo para selección de hora sin texto libre (formato 24h y 12h)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import {
  MAX_WORKDAY_HOUR,
  MAX_WORKDAY_MINUTE,
  MIN_WORKDAY_HOUR,
  formatTo12Hour,
} from '../utils/timeValidation';

export default function CustomTimePicker({
  visible,
  title = 'Seleccionar Hora',
  currentTime = '08:00',
  onConfirm,
  onCancel,
}) {
  const [initialH, initialM] = (currentTime || '08:00').split(':').map(Number);
  const [selectedHour, setSelectedHour] = useState(initialH || 8);
  const [selectedMinute, setSelectedMinute] = useState(initialM || 0);

  // Lista de horas válidas dentro de la jornada (07:00 a 17:00)
  const hours = [];
  for (let h = MIN_WORKDAY_HOUR; h <= MAX_WORKDAY_HOUR; h++) {
    hours.push(h);
  }

  // Intervalos de minutos permitidos
  const minutes = [0, 15, 30, 45];

  const handleHourSelect = (h) => {
    setSelectedHour(h);
    // Si la hora es 17, limitar minutos a máximo 30 (hasta 17:30)
    if (h === MAX_WORKDAY_HOUR && selectedMinute > MAX_WORKDAY_MINUTE) {
      setSelectedMinute(MAX_WORKDAY_MINUTE);
    }
  };

  const handleMinuteSelect = (m) => {
    if (selectedHour === MAX_WORKDAY_HOUR && m > MAX_WORKDAY_MINUTE) {
      return; // Bloqueado: jornada máxima hasta las 17:30
    }
    setSelectedMinute(m);
  };

  const formatted24 = `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;
  const formatted12 = formatTo12Hour(formatted24);

  const handleConfirm = () => {
    onConfirm(formatted24);
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
            <Text style={styles.subtitle}>Jornada máxima permitida: 17:30</Text>
          </View>

          {/* Vista previa destacada en formato 24h y 12h */}
          <View style={styles.previewBox}>
            <Text style={styles.preview24}>{formatted24}</Text>
            <Text style={styles.preview12}>({formatted12})</Text>
          </View>

          {/* Selector de Horas */}
          <Text style={styles.sectionLabel}>Hora</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectorRow}
          >
            {hours.map((h) => {
              const isSelected = selectedHour === h;
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

          {/* Selector de Minutos */}
          <Text style={styles.sectionLabel}>Minutos</Text>
          <View style={styles.minutesRow}>
            {minutes.map((m) => {
              const isDisabled = selectedHour === MAX_WORKDAY_HOUR && m > MAX_WORKDAY_MINUTE;
              const isSelected = selectedMinute === m;

              return (
                <TouchableOpacity
                  key={`m_${m}`}
                  onPress={() => !isDisabled && handleMinuteSelect(m)}
                  disabled={isDisabled}
                  style={[
                    styles.minuteChip,
                    isDisabled && styles.minuteChipDisabled,
                    isSelected && !isDisabled && styles.timeChipActive,
                    !isSelected && !isDisabled && styles.timeChipInactive,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.timeChipText,
                      isDisabled && styles.minuteTextDisabled,
                      isSelected && !isDisabled && styles.timeChipTextActive,
                      !isSelected && !isDisabled && styles.timeChipTextInactive,
                    ]}
                  >
                    {String(m).padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Botones de acción sin signos '+' */}
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
              <Text style={styles.confirmButtonText}>Confirmar Hora</Text>
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
  subtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  previewBox: {
    backgroundColor: COLORS.primarySoft,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  preview24: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  preview12: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  selectorRow: {
    paddingVertical: 4,
    gap: 8,
    marginBottom: 14,
  },
  minutesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
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
  minuteChip: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  timeChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
  },
  timeChipInactive: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  minuteChipDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
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
  minuteTextDisabled: {
    color: '#CBD5E1',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
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
