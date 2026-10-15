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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../constants/colors';
import { ACTIVITY_TYPES, ACTIVITY_STATUS, REPROGRAMMING_OPTIONS } from '../constants/types';
import { validateActivityTimes, checkTimeOverlap, formatTo12Hour } from '../utils/timeValidation';
import CustomTimePicker from './CustomTimePicker';

export default function ActivityModal({
  visible,
  activityToEdit = null,
  defaultDateStr,
  defaultDayName,
  defaultIsPlanificada = false,
  activitiesForValidation = [], // actividades del mismo día para validar solapamiento
  onSave,
  onClose,
}) {
  const insets = useSafeAreaInsets();
  
  // Estados del formulario
  const [titulo, setTitulo] = useState('');
  const [clienteOT, setClienteOT] = useState('');
  const [tipo, setTipo] = useState(ACTIVITY_TYPES[0]);
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFin, setHoraFin] = useState('10:00');
  const [estado, setEstado] = useState(ACTIVITY_STATUS.PENDING);
  const [reprogramacion, setReprogramacion] = useState('No');
  const [observacion, setObservacion] = useState('');
  const [comentario, setComentario] = useState('');
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
      setReprogramacion(activityToEdit.reprogramacion || 'No');
      setObservacion(activityToEdit.observacion || '');
      setComentario(activityToEdit.comentario || '');
      setEsPlanificada(activityToEdit.esPlanificada !== undefined ? activityToEdit.esPlanificada : defaultIsPlanificada);
    } else {
      setTitulo('');
      setClienteOT('');
      setTipo(ACTIVITY_TYPES[0]);
      setHoraInicio('08:00');
      setHoraFin('10:00');
      setEstado(ACTIVITY_STATUS.PENDING);
      setReprogramacion('No');
      setObservacion('');
      setComentario('');
      setEsPlanificada(defaultIsPlanificada);
    }
  }, [activityToEdit, visible, defaultIsPlanificada]);

  const isAlmuerzo = tipo === 'Almuerzo';

  // Manejo de guardado con validaciones
  const handleValidateAndSave = () => {
    // 1. Título obligatorio si no es Almuerzo
    if (!isAlmuerzo && !titulo.trim()) {
      Alert.alert('Campo requerido', 'Debe ingresar la descripción o título de la actividad.');
      return;
    }

    // 2. Validación: inicio < fin
    const timeCheck = validateActivityTimes(horaInicio, horaFin);
    if (!timeCheck.isValid) {
      Alert.alert('Horario inválido', timeCheck.error);
      return;
    }

    // 3. Validación de solapamiento con actividades existentes del mismo día
    const overlapCheck = checkTimeOverlap(
      horaInicio,
      horaFin,
      activitiesForValidation,
      activityToEdit ? activityToEdit.id : null
    );
    if (overlapCheck.hasOverlap) {
      Alert.alert(
        'Horario en conflicto',
        `El horario se solapa con "${overlapCheck.conflictTitle}". No pueden realizarse dos actividades al mismo tiempo.`
      );
      return;
    }

    // 4. Observación obligatoria si es 'No cumplida' y no es planificada
    if (!esPlanificada && estado === ACTIVITY_STATUS.INCOMPLETED && !observacion.trim()) {
      Alert.alert(
        'Observación obligatoria',
        'Al marcar la actividad como "No cumplida", es obligatorio ingresar una observación.'
      );
      return;
    }

    const payload = {
      ...(activityToEdit || {}),
      fecha: activityToEdit ? activityToEdit.fecha : defaultDateStr,
      diaSemana: activityToEdit ? activityToEdit.diaSemana : defaultDayName,
      titulo: isAlmuerzo ? 'Almuerzo' : titulo.trim(),
      clienteOT: isAlmuerzo ? '' : clienteOT.trim(),
      tipo,
      horaInicio,
      horaFin,
      hora: `${horaInicio} - ${horaFin}`,
      estado: esPlanificada ? ACTIVITY_STATUS.PENDING : estado,
      reprogramacion: (!esPlanificada && estado === ACTIVITY_STATUS.INCOMPLETED) ? reprogramacion : 'No',
      observacion: (!esPlanificada && estado === ACTIVITY_STATUS.INCOMPLETED) ? observacion.trim() : '',
      comentario: isAlmuerzo ? '' : comentario.trim(),
      esPlanificada,
    };

    onSave(payload);
  };

  const isEditing = Boolean(activityToEdit);
  const showNotRealizedFields = !esPlanificada && estado === ACTIVITY_STATUS.INCOMPLETED;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
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
                {isEditing ? 'Editar actividad' : 'Registrar actividad'}
              </Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.formScroll}
            contentContainerStyle={styles.formScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Tipo de servicio o actividad</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={tipo}
                  onValueChange={(val) => {
                    setTipo(val);
                    if (val === 'Almuerzo' && (!titulo || titulo === '')) {
                      setTitulo('Almuerzo');
                    }
                  }}
                  style={styles.pickerStyle}
                  dropdownIconColor={COLORS.primary}
                >
                  {ACTIVITY_TYPES.map((t) => (
                    <Picker.Item key={t} label={t} value={t} />
                  ))}
                </Picker>
              </View>
            </View>

            {!isAlmuerzo && (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.fieldLabel}>Actividad o tarea principal *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={titulo}
                    onChangeText={setTitulo}
                    multiline
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.fieldLabel}>Cliente / OT / LLS</Text>
                  <TextInput
                    style={styles.textInput}
                    value={clienteOT}
                    onChangeText={setClienteOT}
                  />
                </View>
              </>
            )}

            <View style={styles.timeSectionBox}>
              <Text style={styles.sectionHeaderTitle}>Horario de ejecución</Text>
              <Text style={styles.sectionHeaderSubtitle}>
                Validación: Inicio anterior a Fin
              </Text>

              <View style={styles.timeButtonsRow}>
                <View style={styles.timeColumn}>
                  <Text style={styles.timeFieldLabel}>Hora de inicio</Text>
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

                <View style={styles.timeArrowDivider}>
                  <Ionicons name="arrow-forward" size={18} color={COLORS.primary} />
                </View>

                <View style={styles.timeColumn}>
                  <Text style={styles.timeFieldLabel}>Hora de fin</Text>
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

            {!esPlanificada && (
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Estado de la actividad</Text>
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
            )}

            {showNotRealizedFields && (
              <>
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

                <View style={styles.formGroup}>
                  <Text style={styles.fieldLabel}>Observaciones *</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={observacion}
                    onChangeText={setObservacion}
                    multiline
                    numberOfLines={2}
                  />
                </View>
              </>
            )}

            {/* Campo Comentarios: visible solo si no es Almuerzo */}
            {!isAlmuerzo && (
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Comentarios</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={comentario}
                  onChangeText={setComentario}
                  multiline
                  numberOfLines={2}
                />
              </View>
            )}
          </ScrollView>

          <View style={[styles.modalFooter, { paddingBottom: Math.max(insets.bottom, 24) }]}>
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
                {isEditing ? 'Guardar cambios' : 'Guardar actividad'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <CustomTimePicker
        visible={timePickerTarget === 'inicio'}
        title="Hora de inicio"
        currentTime={horaInicio}
        onConfirm={(timeStr) => {
          setHoraInicio(timeStr);
          setTimePickerTarget(null);
        }}
        onCancel={() => setTimePickerTarget(null)}
      />

      <CustomTimePicker
        visible={timePickerTarget === 'fin'}
        title="Hora de fin"
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
    paddingBottom: 0,
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
  formScrollContent: {
    paddingBottom: 40,
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