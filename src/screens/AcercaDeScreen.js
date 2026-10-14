// Pantalla Acerca de institucional para Agenda CES
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import GlobalHeader from '../components/GlobalHeader';

export default function AcercaDeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <GlobalHeader title="Acerca de" navigation={navigation} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Bloque principal institucional */}
        <View style={styles.heroCard}>
          <View style={styles.logoWrapper}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>Agenda CES</Text>
          <Text style={styles.versionTag}>Versión 1.0.0 (Build Android Preview)</Text>

          {/* Texto obligatorio estipulado por los requerimientos */}
          <View style={styles.authorBadge}>
            <Ionicons name="code-slash-outline" size={16} color={COLORS.primary} style={styles.authorIcon} />
            <Text style={styles.authorText}>
              Aplicación de agenda semanal desarrollada por Enderson López
            </Text>
          </View>
        </View>

        {/* Tarjeta de características técnicas */}
        <View style={styles.infoCard}>
          <Text style={styles.cardSectionTitle}>Arquitectura y Especificaciones</Text>

          <View style={styles.featureItem}>
            <View style={[styles.featureIconWrap, { backgroundColor: COLORS.primarySoft }]}>
              <Ionicons name="file-tray-full-outline" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.featureTextBlock}>
              <Text style={styles.featureTitle}>Almacenamiento Local Offline</Text>
              <Text style={styles.featureDesc}>
                Base de datos local en AsyncStorage agrupada por semanas. Persistencia garantizada sin pérdida de historial.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIconWrap, { backgroundColor: COLORS.successSoft }]}>
              <Ionicons name="document-text-outline" size={18} color={COLORS.success} />
            </View>
            <View style={styles.featureTextBlock}>
              <Text style={styles.featureTitle}>Exportación Excel (.xlsx)</Text>
              <Text style={styles.featureDesc}>
                11 columnas reglamentarias con doble cuadrícula: Ejecutado de la semana y proyección de la semana siguiente.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIconWrap, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="chatbubbles-outline" size={18} color={COLORS.primaryLight} />
            </View>
            <View style={styles.featureTextBlock}>
              <Text style={styles.featureTitle}>Reporte Estructurado WhatsApp</Text>
              <Text style={styles.featureDesc}>
                Selección granular de días laborales y formateo sin emojis para comunicación técnica directa.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIconWrap, { backgroundColor: COLORS.warningSoft }]}>
              <Ionicons name="alarm-outline" size={18} color={COLORS.warning} />
            </View>
            <View style={styles.featureTextBlock}>
              <Text style={styles.featureTitle}>Notificaciones Nativas</Text>
              <Text style={styles.featureDesc}>
                Recordatorios locales programados para L-V 17:00, Viernes 16:30 y Sábado 12:30.
              </Text>
            </View>
          </View>
        </View>

        {/* Políticas de calidad y validación */}
        <View style={styles.infoCard}>
          <Text style={styles.cardSectionTitle}>Reglas de Negocio</Text>

          <View style={styles.ruleRow}>
            <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.primary} />
            <Text style={styles.ruleText}>
              Validación estricta de tiempos: Hora inicio strictly anterior a hora fin, con jornada máxima a las 6:00 PM (18:00).
            </Text>
          </View>

          <View style={styles.ruleRow}>
            <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.primary} />
            <Text style={styles.ruleText}>
              Carga automática: Las actividades planificadas se cargan directamente en la agenda diaria.
            </Text>
          </View>

          <View style={styles.ruleRow}>
            <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.primary} />
            <Text style={styles.ruleText}>
              Justificación obligatoria para actividades marcadas como no cumplidas.
            </Text>
          </View>
        </View>

        <Text style={styles.copyrightText}>
          Centro Electrónico de Servicios (CES) • Todos los derechos reservados
        </Text>
      </ScrollView>
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
  heroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  logoWrapper: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    padding: 6,
    marginBottom: 12,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  versionTag: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: 14,
  },
  authorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  authorIcon: {
    marginRight: 6,
  },
  authorText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  featureIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  featureTextBlock: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  featureDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  ruleText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 8,
    flex: 1,
    lineHeight: 17,
  },
  copyrightText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 10,
    marginHorizontal: 20,
  },
});
