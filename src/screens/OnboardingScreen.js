// Pantalla de Bienvenida y Configuración inicial de Perfil Técnico (Sin placeholders ni emojis)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { TECHNICIAN_PROFILES } from '../constants/profiles';
import { useApp } from '../context/AppContext';

export default function OnboardingScreen() {
  const { saveProfile } = useApp();
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [perfil, setPerfil] = useState(TECHNICIAN_PROFILES[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCompleteOnboarding = async () => {
    if (!nombre.trim()) {
      Alert.alert('Campo Requerido', 'Por favor ingrese su Nombre.');
      return;
    }

    if (!apellido.trim()) {
      Alert.alert('Campo Requerido', 'Por favor ingrese su Apellido.');
      return;
    }

    try {
      setIsSubmitting(true);
      await saveProfile({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        perfil,
        isOnboarded: true,
      });
    } catch (e) {
      Alert.alert('Error', 'No fue posible guardar los datos del perfil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Cabecera visual con logo */}
        <View style={styles.headerBlock}>
          <View style={styles.logoWrapper}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appTitle}>Agenda CES</Text>
          <Text style={styles.appSubtitle}>
            Sistema de Planificación y Control de Actividades Técnicas
          </Text>
        </View>

        {/* Tarjeta de Formulario de Onboarding */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-circle-outline" size={24} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Datos del Técnico</Text>
          </View>
          <Text style={styles.cardInstructions}>
            Configure su información profesional para iniciar la gestión semanal.
          </Text>

          {/* Campo: Nombre (ESTRICTAMENTE SIN PLACEHOLDER) */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Nombre *</Text>
            <TextInput
              style={styles.textInput}
              value={nombre}
              onChangeText={setNombre}
              autoCapitalize="words"
            />
          </View>

          {/* Campo: Apellido (ESTRICTAMENTE SIN PLACEHOLDER) */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Apellido *</Text>
            <TextInput
              style={styles.textInput}
              value={apellido}
              onChangeText={setApellido}
              autoCapitalize="words"
            />
          </View>

          {/* Campo: Perfil mediante Picker (Ensamble, Cómputo, Impresión, Renta, Potencia) */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Perfil de Especialidad *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={perfil}
                onValueChange={(itemValue) => setPerfil(itemValue)}
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
            onPress={handleCompleteOnboarding}
            style={styles.submitButton}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Guardando...' : 'Comenzar'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.surface} style={styles.btnIcon} />
          </TouchableOpacity>
        </View>

        <Text style={styles.footerNotice}>
          Desarrollado para la gestión y seguimiento técnico institucional CES.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 36,
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    padding: 8,
    marginBottom: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 8,
  },
  cardInstructions: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 18,
  },
  formGroup: {
    marginBottom: 16,
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
    fontSize: 15,
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
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 10,
    elevation: 2,
  },
  submitButtonText: {
    color: COLORS.surface,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  btnIcon: {
    marginLeft: 8,
  },
  footerNotice: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 24,
  },
});
