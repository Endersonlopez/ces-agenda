// Pantalla de Configuración: Edición de perfil del técnico y gestión de notificaciones locales
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { TECHNICIAN_PROFILES } from '../constants/profiles';
import { useApp } from '../context/AppContext';
import { formatTo12Hour } from '../utils/timeValidation';
import { sendTestNotification } from '../services/notificationService';
import GlobalHeader from '../components/GlobalHeader';
import CustomTimePicker from '../components/CustomTimePicker';

export default function ConfiguracionScreen({ navigation }) {
  const { profile, saveProfile, notificationConfig, saveNotifications } = useApp();

  // Estados del perfil (SIN PLACEHOLDERS)
  const [nombre, setNombre] = useState(profile.nombre || '');
  const [apellido, setApellido] = useState(profile.apellido || '');
  const [perfil, setPerfil] = useState(profile.perfil || TECHNICIAN_PROFILES[0]);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Estados de notificaciones
  const [notifEnabled, setNotifEnabled] = useState(
    notificationConfig ? notificationConfig.enabled : true
  );
  const [lvTime, setLvTime] = useState(notificationConfig?.lvTime || '17:00');
  const [vieTime, setVieTime] = useState(notificationConfig?.vieTime || '16:30');
  const [sabTime, setSabTime] = useState(notificationConfig?.sabTime || '12:30');
  const [isSavingNotifs, setIsSavingNotifs] = useState(false);

  // Selector modal de hora activo
  const [activeTimePicker, setActiveTimePicker] = useState(null); // 'lv' | 'vie' | 'sab' | null

  useEffect(() => {
    if (profile) {
      setNombre(profile.nombre || '');
      setApellido(profile.apellido || '');
      setPerfil(profile.perfil || TECHNICIAN_PROFILES[0]);
    }
  }, [profile]);

  useEffect(() => {
    if (notificationConfig) {
      setNotifEnabled(notificationConfig.enabled);
      setLvTime(notificationConfig.lvTime || '17:00');
      setVieTime(notificationConfig.vieTime || '16:30');
      setSabTime(notificationConfig.sabTime || '12:30');
    }
  }, [notificationConfig]);

  // Guardar perfil
  const handleSaveProfile = async () => {
    if (!nombre.trim()) {
      Alert.alert('Campo Requerido', 'El nombre no puede estar vacío.');
      return;
    }
    if (!apellido.trim()) {
      Alert.alert('Campo Requerido', 'El apellido no puede estar vacío.');
      return;
    }

    try {
      setIsSavingProfile(true);
      await saveProfile({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        perfil,
        isOnboarded: true,
      });
      Alert.alert('Éxito', 'Perfil técnico actualizado correctamente.');
    } catch (e) {
      Alert.alert('Error', 'No se pudieron guardar los cambios de perfil.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Guardar configuración de notificaciones
  const handleSaveNotifications = async () => {
    try {
      setIsSavingNotifs(true);
      await saveNotifications({
        enabled: notifEnabled,
        lvTime,
        vieTime,
        sabTime,
      });
      Alert.alert('Éxito', 'Configuración de notificaciones guardada y programada.');
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar la configuración de notificaciones.');
    } finally {
      setIsSavingNotifs(false);
    }
  };

  // Enviar notificación de prueba
  const handleTestNotification = async () => {
    const success = await sendTestNotification();
    if (success) {
      Alert.alert('Notificación Enviada', 'Se ha disparado una notificación local de prueba.');
    } else {
      Alert.alert('Aviso', 'Verifique los permisos de notificación en el dispositivo.');
    }
  };

  return (
    <View style={styles.container}>
      <GlobalHeader title="Configuración" navigation={navigation} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ==================================================== */}
        {/* SECCIÓN 1: DATOS DEL PERFIL TÉCNICO                  */}
        {/* ==================================================== */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionIconBadge}>
              <Ionicons name="person-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.sectionTitleBlock}>
              <Text style={styles.sectionTitle}>Datos del Técnico</Text>
              <Text style={styles.sectionSubtitle}>
                Información institucional que figurará en los reportes
              </Text>
            </View>
          </View>

          {/* Campo: Nombre (SIN PLACEHOLDER) */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Nombre *</Text>
            <TextInput
              style={styles.textInput}
              value={nombre}
              onChangeText={setNombre}
              autoCapitalize="words"
            />
          </View>

          {/* Campo: Apellido (SIN PLACEHOLDER) */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Apellido *</Text>
            <TextInput
              style={styles.textInput}
              value={apellido}
              onChangeText={setApellido}
              autoCapitalize="words"
            />
          </View>

          {/* Campo: Perfil (Picker: Ensamble, Cómputo, Impresión, Renta, Potencia) */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Perfil de Especialidad *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={perfil}
                onValueChange={(val) => setPerfil(val)}
                style={styles.pickerStyle}
                dropdownIconColor={COLORS.primary}
              >
                {TECHNICIAN_PROFILES.map((p) => (
                  <Picker.Item key={p} label={p} value={p} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Botón limpio sin '+' */}
          <TouchableOpacity
            onPress={handleSaveProfile}
            style={styles.primaryButton}
            disabled={isSavingProfile}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              {isSavingProfile ? 'Guardando...' : 'Guardar Cambios de Perfil'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ==================================================== */}
        {/* SECCIÓN 2: GESTIÓN DE NOTIFICACIONES LOCALES        */}
        {/* ==================================================== */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionIconBadge, { backgroundColor: COLORS.warningSoft }]}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.warning} />
            </View>
            <View style={styles.sectionTitleBlock}>
              <Text style={styles.sectionTitle}>Recordatorios Automáticos</Text>
              <Text style={styles.sectionSubtitle}>
                Notificaciones locales para envío de agendas y cierres
              </Text>
            </View>
          </View>

          {/* Toggle Switch Activar / Desactivar */}
          <View style={styles.switchRow}>
            <View style={styles.switchLabelBlock}>
              <Text style={styles.switchMainLabel}>Activar Notificaciones</Text>
              <Text style={styles.switchSubLabel}>
                Recibir alertas en la barra de estado del dispositivo
              </Text>
            </View>
            <Switch
              value={notifEnabled}
              onValueChange={setNotifEnabled}
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
              thumbColor={notifEnabled ? COLORS.primary : '#F4F3F4'}
            />
          </View>

          {/* Horas configurables de los 3 recordatorios obligatorios */}
          <View style={[styles.scheduleSettingsBlock, !notifEnabled && styles.disabledBlock]}>
            <Text style={styles.scheduleBlockTitle}>Horarios por Defecto Configurables:</Text>

            {/* 1. L-V Recordatorio enviar agenda */}
            <View style={styles.scheduleItem}>
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleName}>Lunes a Viernes</Text>
                <Text style={styles.scheduleDesc}>Recordatorio enviar agenda diaria</Text>
              </View>
              <TouchableOpacity
                onPress={() => notifEnabled && setActiveTimePicker('lv')}
                disabled={!notifEnabled}
                style={styles.timeBadgeBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="time-outline" size={14} color={COLORS.primary} style={styles.timeBtnIcon} />
                <Text style={styles.timeBadgeText}>{lvTime}</Text>
                <Text style={styles.timeBadgeSub}>({formatTo12Hour(lvTime)})</Text>
              </TouchableOpacity>
            </View>

            {/* 2. Viernes Recordatorio planificar semana */}
            <View style={styles.scheduleItem}>
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleName}>Viernes</Text>
                <Text style={styles.scheduleDesc}>Recordatorio planificar semana siguiente</Text>
              </View>
              <TouchableOpacity
                onPress={() => notifEnabled && setActiveTimePicker('vie')}
                disabled={!notifEnabled}
                style={styles.timeBadgeBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="time-outline" size={14} color={COLORS.primary} style={styles.timeBtnIcon} />
                <Text style={styles.timeBadgeText}>{vieTime}</Text>
                <Text style={styles.timeBadgeSub}>({formatTo12Hour(vieTime)})</Text>
              </TouchableOpacity>
            </View>

            {/* 3. Sábado Cierre y envío */}
            <View style={styles.scheduleItem}>
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleName}>Sábado</Text>
                <Text style={styles.scheduleDesc}>Cierre semanal y envío consolidado</Text>
              </View>
              <TouchableOpacity
                onPress={() => notifEnabled && setActiveTimePicker('sab')}
                disabled={!notifEnabled}
                style={styles.timeBadgeBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="time-outline" size={14} color={COLORS.primary} style={styles.timeBtnIcon} />
                <Text style={styles.timeBadgeText}>{sabTime}</Text>
                <Text style={styles.timeBadgeSub}>({formatTo12Hour(sabTime)})</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Botones de acción Notificaciones sin signos '+' */}
          <View style={styles.notifActions}>
            <TouchableOpacity
              onPress={handleSaveNotifications}
              style={[styles.primaryButton, { backgroundColor: COLORS.primary }]}
              disabled={isSavingNotifs}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>
                {isSavingNotifs ? 'Guardando...' : 'Guardar Horarios de Notificación'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleTestNotification}
              style={styles.outlineButton}
              activeOpacity={0.7}
            >
              <Ionicons name="paper-plane-outline" size={16} color={COLORS.primary} style={styles.btnIcon} />
              <Text style={styles.outlineButtonText}>Probar Notificación Ahora</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Selectores de hora para las notificaciones */}
      <CustomTimePicker
        visible={activeTimePicker === 'lv'}
        title="Recordatorio L-V (Enviar Agenda)"
        currentTime={lvTime}
        onConfirm={(val) => {
          setLvTime(val);
          setActiveTimePicker(null);
        }}
        onCancel={() => setActiveTimePicker(null)}
      />

      <CustomTimePicker
        visible={activeTimePicker === 'vie'}
        title="Recordatorio Viernes (Planificar)"
        currentTime={vieTime}
        onConfirm={(val) => {
          setVieTime(val);
          setActiveTimePicker(null);
        }}
        onCancel={() => setActiveTimePicker(null)}
      />

      <CustomTimePicker
        visible={activeTimePicker === 'sab'}
        title="Recordatorio Sábado (Cierre)"
        currentTime={sabTime}
        onConfirm={(val) => {
          setSabTime(val);
          setActiveTimePicker(null);
        }}
        onCancel={() => setActiveTimePicker(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingVertical: 14,
    paddingBottom: 40,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitleBlock: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 12,
  },
  switchLabelBlock: {
    flex: 1,
    marginRight: 12,
  },
  switchMainLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  switchSubLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  scheduleSettingsBlock: {
    marginTop: 4,
  },
  disabledBlock: {
    opacity: 0.5,
  },
  scheduleBlockTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scheduleInfo: {
    flex: 1,
    marginRight: 8,
  },
  scheduleName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  scheduleDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  timeBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeBtnIcon: {
    marginRight: 4,
  },
  timeBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  timeBadgeSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginLeft: 4,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    elevation: 2,
  },
  primaryButtonText: {
    color: COLORS.surface,
    fontSize: 13,
    fontWeight: '700',
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
    paddingVertical: 10,
    marginTop: 8,
  },
  outlineButtonText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  btnIcon: {
    marginRight: 6,
  },
  notifActions: {
    marginTop: 10,
  },
});
