// Modal para Crear y Editar actividades con validación estricta y sin placeholders
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { ACTIVITY_TYPES, ACTIVITY_STATUS, REPROGRAMMING_OPTIONS } from '../constants/types';
import { validateActivityTimes, formatTo12Hour } from '../utils/timeValidation';
import CustomTimePicker from './CustomTimePicker';

export default function ActivityModal({
  visible,
  activityToEdit = null, // si es null -> modo Crear, si tiene objeto -> modo Editar
  defaultDateStr,
  defaultDayName,
  defaultIsPlanificada = false,
  onSave,
  onClose,
}) {
  // Estados del formulario
  const [titulo, setTitulo] = useState('');
  const [clienteOT, setClienteOT] = useState('');
  const [tipo, setTipo] = useState(ACTIVITY_TYPES[0]);
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFin, setHoraFin] = useState('10:00');
  const [estado, setEstado] = useState(ACTIVITY_STATUS.PENDING);
  const [justificacion, setJustificacion] = useState('');
  const [reprogramacion, setReprogramacion] = useState('No');
  const [resultadoReal, setResultadoReal] = useState('');
  const [observacion, setObservacion] = useState('');
  const [esPlanificada, setEsPlanificada] = useState(defaultIsPlanificada);

  // Estados para selectores de tiempo exclusivos
  const [timePickerTarget, setTimePickerTarget] = useState(null); // 'inicio' | 'fin' | null

  // Cargar datos al abrir modal
  useEffect(() => {
    if (activityToEdit) {
      setTitulo(activityToEdit.titulo || '');
      setClienteOT(activityToEdit.clienteOT || '');
      setTipo(activityToEdit.tipo || ACTIVITY_TYPES[0]);
      setHoraInicio(activityToEdit.horaInicio || '08:00');
      setHoraFin(activityToEdit.horaFin || '10:00');
      setEstado(activityToEdit.estado || ACTIVITY_STATUS.PENDING);
      setJustificacion(activityToEdit.justificacion || '');
      setReprogramacion(activityToEdit.reprogramacion || 'No');
      setResultadoReal(activityToEdit.resultadoReal || '');
      setObservacion(activityToEdit.observacion || '');
      setEsPlanificada(activityToEdit.esPlanificada !== undefined ? activityToEdit.esPlanificada : defaultIsPlanificada);
    } else {
      setTitulo('');
      setClienteOT('');
      setTipo(ACTIVITY_TYPES[0]);
      setHoraInicio('08:00');
      setHoraFin('10:00');
      setEstado(ACTIVITY_STATUS.PENDING);
      setJustificacion('');
      setReprogramacion('No');
      setResultadoReal('');
      setObservacion('');
      setEsPlanificada(defaultIsPlanificada);
    }
  }, [activityToEdit, visible, defaultIsPlanificada]);

  // Manejo de guardado con validaciones estrictas
  const handleValidateAndSave = () => {
    // 1. Título obligatorio
    if (!titulo.trim()) {
      Alert.alert('Campo Requerido', 'Debe ingresar la descripción o título de la actividad.');
      return;
    }

    // 2. Validación estricta de tiempos: inicio < fin, jornada máxima 17:30
    const timeCheck = validateActivityTimes(horaInicio, horaFin);
    if (!timeCheck.isValid) {
      Alert.alert('Horario Inválido', timeCheck.error);
      return;
    }

    // 3. Validación obligatoria de justificación si es 'No cumplida'
    if (estado === ACTIVITY_STATUS.INCOMPLETED && !justificacion.trim()) {
      Alert.alert(
        'Justificación Obligatoria',
        'Al marcar la actividad como "No cumplida", es obligatorio ingresar una justificación detallada.'
      );
      return;
    }

    const payload = {
      ...(activityToEdit || {}),
      fecha: activityToEdit ? activityToEdit.fecha : defaultDateStr,
      diaSemana: activityToEdit ? activityToEdit.diaSemana : defaultDayName,
      titulo: titulo.trim(),
      clienteOT: clienteOT.trim(),
      tipo,
      horaInicio,
      horaFin,
      hora: `${horaInicio} - ${horaFin}`,
      estado,
      justificacion: justificacion.trim(),
      reprogramacion,
      resultadoReal: resultadoReal.trim(),
      observacion: observacion.trim(),
      esPlanificada,
    };

    onSave(payload);
  };

  const isEditing = Boolean(activityToEdit);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalSheet}>
          {/* Cabecera del modal */}
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleRow}>
              <Ionicons
                name={isEditing ? 'create-outline' : 'calendar-outline'}
                size={22}
                color={COLORS.primary}
                style={styles.modalHeaderIcon}
              />
              <Text style={styles.modalTitle}>
                {isEditing ? 'Editar Actividad' : 'Registrar Actividad'}
              </Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.formScroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Campo: Título de la actividad (SIN PLACEHOLDER) */}
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Actividad o Tarea Principal *</Text>
              <TextInput
                style={styles.textInput}
                value={titulo}
                onChangeText={setTitulo}
                multiline
              />
            </View>

            {/* Campo: Cliente / OT / LLS (SIN PLACEHOLDER) */}
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Cliente / OT / LLS</Text>
              <TextInput
                style={styles.textInput}
                value={clienteOT}
                onChangeText={setClienteOT}
              />
            </View>

            {/* Campo: Tipo de actividad (Picker) */}
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Tipo de Servicio o Actividad</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={tipo}
                  onValueChange={(val) => setTipo(val)}
                  style={styles.pickerStyle}
                  dropdownIconColor={COLORS.primary}
                >
                  {ACTIVITY_TYPES.map((t) => (
                    <Picker.Item key={t} label={t} value={t} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Selección estricta de Horarios (Exclusivamente selectores, no texto libre) */}
            <View style={styles.timeSectionBox}>
              <Text style={styles.sectionHeaderTitle}>Horario de Ejecución</Text>
              <Text style={styles.sectionHeaderSubtitle}>
                Validación: Inicio anterior a Fin | Jornada máxima hasta las 17:30
              </Text>

              <View style={styles.timeButtonsRow}>
                {/* Selector Hora Inicio */}
                <View style={styles.timeColumn}>
                  <Text style={styles.timeFieldLabel}>Hora de Inicio</Text>
                  <TouchableOpacity
                    onPress={() => setTimePickerTarget('inicio')}
                    style={styles.timeSelectBtn}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="time-outline" size={16} color={COLORS.primary} />
                    <View style={styles.timeDisplayBlock}>
                      <Text style={styles.timeValue24}>{horaInicio}</Text>
                      <Text style={styles.timeValue12}>{formatTo12Hour(horaInicio)}</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Separador visual */}
                <View style={styles.timeArrowDivider}>
                  <Ionicons name="arrow-forward" size={18} color={COLORS.primary} />
                </View>

                {/* Selector Hora Fin */}
                <View style={styles.timeColumn}>
                  <Text style={styles.timeFieldLabel}>Hora de Fin</Text>
                  <TouchableOpacity
                    onPress={() => setTimePickerTarget('fin')}
                    style={styles.timeSelectBtn}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="time-outline" size={16} color={COLORS.primary} />
                    <View style={styles.timeDisplayBlock}>
                      <Text style={styles.timeValue24}>{horaFin}</Text>
                      <Text style={styles.timeValue12}>{formatTo12Hour(horaFin)}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Estado de la actividad */}
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Estado de la Actividad</Text>
              <View style={styles.statusButtonsGroup}>
                {Object.values(ACTIVITY_STATUS).map((st) => {
                  const isSelected = estado === st;
                  let activeBg = COLORS.primary;
                  if (st === ACTIVITY_STATUS.COMPLETED) activeBg = COLORS.success;
                  if (st === ACTIVITY_STATUS.INCOMPLETED) activeBg = COLORS.danger;

                  return (
                    <TouchableOpacity
                      key={st}
                      onPress={() => setEstado(st)}
                      style={[
                        styles.statusBtn,
                        isSelected
                          ? { backgroundColor: activeBg, borderColor: activeBg }
                          : styles.statusBtnInactive,
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.statusBtnText,
                          isSelected ? styles.statusBtnTextActive : styles.statusBtnTextInactive,
                        ]}
                      >
                        {st}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Justificación OBLIGATORIA si el estado es 'No cumplida' */}
            {estado === ACTIVITY_STATUS.INCOMPLETED && (
              <View style={[styles.formGroup, styles.mandatoryJustificationBlock]}>
                <View style={styles.mandatoryHeaderRow}>
                  <Ionicons name="warning-outline" size={16} color={COLORS.danger} />
                  <Text style={styles.mandatoryLabel}>
                    Justificación de Incumplimiento (Obligatoria) *
                  </Text>
                </View>
                <TextInput
                  style={[styles.textInput, styles.mandatoryInput]}
                  value={justificacion}
                  onChangeText={setJustificacion}
                  multiline
                  numberOfLines={3}
                />
              </View>
            )}

            {/* Reprogramación */}
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Reprogramación</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={reprogramacion}
                  onValueChange={(val) => setReprogramacion(val)}
                  style={styles.pickerStyle}
                  dropdownIconColor={COLORS.primary}
                >
                  {REPROGRAMMING_OPTIONS.map((opt) => (
                    <Picker.Item key={opt} label={opt} value={opt} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Campo: Resultado real (SIN PLACEHOLDER) */}
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Resultado Real Obtenido</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={resultadoReal}
                onChangeText={setResultadoReal}
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Campo: Observación / evidencia (SIN PLACEHOLDER) */}
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Observación o Detalle de Evidencia</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={observacion}
                onChangeText={setObservacion}
                multiline
                numberOfLines={2}
              />
            </View>
          </ScrollView>

          {/* Botones de acción sin signos '+' */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.cancelActionBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelActionText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleValidateAndSave}
              style={styles.saveActionBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.saveActionText}>
                {isEditing ? 'Guardar Cambios' : 'Guardar Actividad'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Selector modal de hora de inicio */}
      <CustomTimePicker
        visible={timePickerTarget === 'inicio'}
        title="Hora de Inicio"
        currentTime={horaInicio}
        onConfirm={(timeStr) => {
          setHoraInicio(timeStr);
          setTimePickerTarget(null);
        }}
        onCancel={() => setTimePickerTarget(null)}
      />

      {/* Selector modal de hora de fin */}
      <CustomTimePicker
        visible={timePickerTarget === 'fin'}
        title="Hora de Fin"
        currentTime={horaFin}
        onConfirm={(timeStr) => {
          setHoraFin(timeStr);
          setTimePickerTarget(null);
        }}
        onCancel={() => setTimePickerTarget(null)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 44, 108, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '92%',
    paddingBottom: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalHeaderIcon: {
    marginRight: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.primary,
  },
  closeBtn: {
    padding: 4,
  },
  formScroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  formGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  pickerStyle: {
    height: 50,
    width: '100%',
    color: COLORS.textPrimary,
  },
  timeSectionBox: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  sectionHeaderSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 10,
    marginTop: 2,
  },
  timeButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeColumn: {
    flex: 1,
  },
  timeFieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  timeSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  timeDisplayBlock: {
    marginLeft: 8,
  },
  timeValue24: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  timeValue12: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  timeArrowDivider: {
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusButtonsGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBtnInactive: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
  },
  statusBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusBtnTextActive: {
    color: COLORS.surface,
  },
  statusBtnTextInactive: {
    color: COLORS.textSecondary,
  },
  mandatoryJustificationBlock: {
    backgroundColor: COLORS.dangerSoft,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
  },
  mandatoryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  mandatoryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.dangerDark,
    marginLeft: 6,
  },
  mandatoryInput: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.danger,
    minHeight: 65,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  cancelActionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  cancelActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  saveActionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  saveActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.surface,
  },
});
