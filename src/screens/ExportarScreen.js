// Pantalla de exportación para WhatsApp y Excel (.xlsx)
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { COLORS } from '../constants/colors';
import { useApp } from '../context/AppContext';
import { getWeekDays } from '../utils/dateUtils';
import { buildWhatsAppReportText, shareViaWhatsApp } from '../services/whatsappExportService';
import { generateAndShareExcelReport } from '../services/excelExportService';
import GlobalHeader from '../components/GlobalHeader';
import WeekSelector from '../components/WeekSelector';

export default function ExportarScreen({ navigation }) {
  const {
    profile,
    weekInfo,
    currentWeekLabel,
    nextWeekLabel,
    activities,
    nextWeekActivities,
  } = useApp();

  const weekDays = useMemo(() => {
    return getWeekDays(weekInfo.weekNumber, weekInfo.weekYear);
  }, [weekInfo.weekNumber, weekInfo.weekYear]);

  // Selección de días para WhatsApp (por defecto todos seleccionados)
  const [selectedDays, setSelectedDays] = useState(() => {
    return weekDays.map((d) => d.dateStr);
  });

  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Toggle de un día individual
  const toggleDaySelection = (dateStr) => {
    if (selectedDays.includes(dateStr)) {
      setSelectedDays(selectedDays.filter((d) => d !== dateStr));
    } else {
      setSelectedDays([...selectedDays, dateStr]);
    }
  };

  const selectAllDays = () => {
    setSelectedDays(weekDays.map((d) => d.dateStr));
  };

  const clearAllDays = () => {
    setSelectedDays([]);
  };

  // Texto generado para WhatsApp
  const whatsAppReportText = useMemo(() => {
    return buildWhatsAppReportText({
      activities,
      selectedDateStrings: selectedDays,
      profile,
      weekLabel: currentWeekLabel,
    });
  }, [activities, selectedDays, profile, currentWeekLabel]);

  // Validación de actividades pendientes antes de compartir
  const checkPendingAndProceed = (actionCallback) => {
    const uncompleted = activities.filter(
      (act) => selectedDays.includes(act.fecha) && act.estado !== 'Cumplida'
    );

    if (uncompleted.length > 0) {
      Alert.alert(
        'Actividades pendientes',
        `Tienes ${uncompleted.length} actividad(es) sin marcar como cumplida en los días seleccionados. ¿Deseas revisarlas o compartir de todos modos?`,
        [
          {
            text: 'Revisar agenda',
            style: 'cancel',
            onPress: () => navigation.navigate('AgendaDiaria'),
          },
          {
            text: 'Compartir de todos modos',
            onPress: actionCallback,
          },
        ]
      );
    } else {
      actionCallback();
    }
  };

  // Compartir en WhatsApp
  const handleShareWhatsApp = async () => {
    if (selectedDays.length === 0) {
      Alert.alert('Selección vacía', 'Debe seleccionar al menos un día para exportar.');
      return;
    }

    checkPendingAndProceed(async () => {
      try {
        await shareViaWhatsApp(whatsAppReportText);
      } catch (err) {
        Alert.alert('Error al compartir', 'No se pudo compartir el reporte por WhatsApp.');
      }
    });
  };

  // Copiar al portapapeles
  const handleCopyClipboard = async () => {
    try {
      await Clipboard.setStringAsync(whatsAppReportText);
      Alert.alert('Copiado', 'El reporte estructurado ha sido copiado al portapapeles.');
    } catch (e) {
      Alert.alert('Error', 'No se pudo copiar el texto.');
    }
  };

  // Generar y exportar archivo Excel
  const handleExportExcel = async () => {
    checkPendingAndProceed(async () => {
      try {
        setIsExportingExcel(true);
        await generateAndShareExcelReport({
          currentWeekActivities: activities,
          nextWeekActivities: nextWeekActivities,
          currentWeekLabel,
          nextWeekLabel,
          profile,
          weekNumber: weekInfo.weekNumber,
          weekYear: weekInfo.weekYear,
        });
      } catch (error) {
        console.error('Error detallado exportando Excel:', error);
        Alert.alert(
          'Error al exportar',
          `Ocurrió un problema al generar la hoja de cálculo Excel: ${error?.message || error}`
        );
      } finally {
        setIsExportingExcel(false);
      }
    });
  };

  return (
    <View style={styles.container}>
      <GlobalHeader title="Exportar" navigation={navigation} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Selector de semanas con flechas */}
        <WeekSelector />

        {/* ==================================================== */}
        {/* SECCIÓN 1: EXPORTACIÓN PARA WHATSAPP                 */}
        {/* ==================================================== */}
        <View style={styles.exportSectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionIconBadge, { backgroundColor: COLORS.successSoft }]}>
              <Ionicons name="chatbubbles-outline" size={20} color={COLORS.success} />
            </View>
            <View style={styles.sectionTitleBlock}>
              <Text style={styles.sectionTitle}>Reporte para WhatsApp</Text>
              <Text style={styles.sectionSubtitle}>
                Formato estructurado con fecha, actividad, estado y observaciones
              </Text>
            </View>
          </View>

          {/* Selector de días con checkboxes */}
          <Text style={styles.subsectionTitle}>Seleccione los días a incluir:</Text>
          <View style={styles.checkboxGrid}>
            {weekDays.map((d) => {
              const isChecked = selectedDays.includes(d.dateStr);
              return (
                <TouchableOpacity
                  key={d.dateStr}
                  onPress={() => toggleDaySelection(d.dateStr)}
                  style={[
                    styles.checkboxItem,
                    isChecked && styles.checkboxItemActive,
                  ]}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isChecked ? 'checkbox' : 'square-outline'}
                    size={20}
                    color={isChecked ? COLORS.primary : COLORS.textMuted}
                  />
                  <Text style={[styles.checkboxLabel, isChecked && styles.checkboxLabelActive]}>
                    {d.dayName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Botones de acción rápida con diseño claro */}
          <View style={styles.quickButtonsRow}>
            <TouchableOpacity onPress={selectAllDays} style={styles.quickActionButton} activeOpacity={0.7}>
              <Ionicons name="checkmark-done-outline" size={14} color={COLORS.primary} style={styles.quickBtnIcon} />
              <Text style={styles.quickActionLabel}>Seleccionar todos</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={clearAllDays} style={styles.quickActionButton} activeOpacity={0.7}>
              <Ionicons name="close-circle-outline" size={14} color={COLORS.textSecondary} style={styles.quickBtnIcon} />
              <Text style={[styles.quickActionLabel, { color: COLORS.textSecondary }]}>Limpiar selección</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowPreview(!showPreview)}
              style={[styles.quickActionButton, showPreview && styles.quickActionActive]}
              activeOpacity={0.7}
            >
              <Ionicons
                name={showPreview ? 'eye-off-outline' : 'eye-outline'}
                size={14}
                color={showPreview ? COLORS.surface : COLORS.primary}
                style={styles.quickBtnIcon}
              />
              <Text style={[styles.quickActionLabel, showPreview && { color: COLORS.surface }]}>
                {showPreview ? 'Ocultar vista previa' : 'Ver vista previa'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Vista previa completa con scroll */}
          {showPreview && (
            <View style={styles.previewBox}>
              <Text style={styles.previewTitle}>Vista previa del mensaje:</Text>
              <ScrollView
                style={styles.previewScroll}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
              >
                <Text style={styles.previewContent}>{whatsAppReportText}</Text>
              </ScrollView>
            </View>
          )}

          {/* Botones de acción WhatsApp */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              onPress={handleShareWhatsApp}
              style={[styles.primaryActionBtn, { backgroundColor: COLORS.success }]}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-whatsapp" size={18} color={COLORS.surface} style={styles.btnIcon} />
              <Text style={styles.primaryActionBtnText}>Enviar por WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCopyClipboard}
              style={styles.secondaryActionBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="copy-outline" size={17} color={COLORS.primary} style={styles.btnIcon} />
              <Text style={styles.secondaryActionBtnText}>Copiar texto</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ==================================================== */}
        {/* SECCIÓN 2: EXPORTACIÓN A EXCEL (.XLSX)               */}
        {/* ==================================================== */}
        <View style={styles.exportSectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionIconBadge, { backgroundColor: COLORS.primarySoft }]}>
              <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.sectionTitleBlock}>
              <Text style={styles.sectionTitle}>Reporte oficial en Excel (.xlsx)</Text>
              <Text style={styles.sectionSubtitle}>
                Tabla con lo ejecutado en la semana y planificación siguiente
              </Text>
            </View>
          </View>

          {/* Botón directo de generación y compartir */}
          <TouchableOpacity
            onPress={handleExportExcel}
            style={[styles.primaryActionBtn, { backgroundColor: COLORS.primary, marginTop: 8 }]}
            disabled={isExportingExcel}
            activeOpacity={0.8}
          >
            {isExportingExcel ? (
              <ActivityIndicator color={COLORS.surface} size="small" />
            ) : (
              <>
                <Ionicons name="download-outline" size={18} color={COLORS.surface} style={styles.btnIcon} />
                <Text style={styles.primaryActionBtnText}>Generar y compartir archivo Excel</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
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
    paddingBottom: 36,
  },
  exportSectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
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
    marginBottom: 12,
  },
  sectionIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 8,
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
  subsectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  checkboxGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  checkboxItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  checkboxItemActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySoft,
  },
  checkboxLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 8,
    fontWeight: '500',
  },
  checkboxLabelActive: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  quickButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  quickActionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  quickBtnIcon: {
    marginRight: 4,
  },
  quickActionLabel: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },
  previewBox: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  previewScroll: {
    maxHeight: 220,
  },
  previewContent: {
    fontSize: 11,
    color: COLORS.textPrimary,
    lineHeight: 16,
  },
  actionButtonsContainer: {
    gap: 10,
    marginTop: 4,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
  },
  primaryActionBtnText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  secondaryActionBtnText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  btnIcon: {
    marginRight: 6,
  },
});
