// Pantalla de Exportación Avanzada para WhatsApp (con checkboxes) y Excel (.xlsx) con 11 columnas
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
import { generateAndShareExcelReport, EXCEL_COLUMNS } from '../services/excelExportService';
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

  // Compartir en WhatsApp
  const handleShareWhatsApp = async () => {
    if (selectedDays.length === 0) {
      Alert.alert('Selección Vacía', 'Debe seleccionar al menos un día para exportar.');
      return;
    }
    await shareViaWhatsApp(whatsAppReportText);
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
      Alert.alert('Error al Exportar', 'Ocurrió un problema al generar la hoja de cálculo Excel.');
    } finally {
      setIsExportingExcel(false);
    }
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
                Formato estructurado con Fecha, Actividad, Estado y Justificación
              </Text>
            </View>
          </View>

          {/* Selector de días con Checkboxes */}
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
                    {d.dayName} ({d.shortFormattedDate.substring(0, 5)})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Botones de selección rápida */}
          <View style={styles.quickSelectRow}>
            <TouchableOpacity onPress={selectAllDays} style={styles.textActionBtn} activeOpacity={0.7}>
              <Text style={styles.textActionBtnLabel}>Seleccionar todos</Text>
            </TouchableOpacity>
            <Text style={styles.dividerDot}>•</Text>
            <TouchableOpacity onPress={clearAllDays} style={styles.textActionBtn} activeOpacity={0.7}>
              <Text style={styles.textActionBtnLabel}>Limpiar selección</Text>
            </TouchableOpacity>
            <Text style={styles.dividerDot}>•</Text>
            <TouchableOpacity
              onPress={() => setShowPreview(!showPreview)}
              style={styles.textActionBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.textActionBtnLabel}>
                {showPreview ? 'Ocultar vista previa' : 'Ver vista previa'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Vista previa colapsable del texto */}
          {showPreview && (
            <View style={styles.previewBox}>
              <Text style={styles.previewTitle}>Vista previa del mensaje:</Text>
              <Text style={styles.previewContent}>{whatsAppReportText}</Text>
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
              <Text style={styles.secondaryActionBtnText}>Copiar Texto</Text>
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
              <Text style={styles.sectionTitle}>Reporte Oficial en Excel (.xlsx)</Text>
              <Text style={styles.sectionSubtitle}>
                Estructura reglamentaria de 11 columnas con saltos de línea (\n)
              </Text>
            </View>
          </View>

          {/* Detalle de estructura */}
          <View style={styles.infoCardBlock}>
            <View style={styles.infoPoint}>
              <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.success} />
              <Text style={styles.infoPointText}>
                <Text style={styles.boldText}>Parte Superior:</Text> Tabla con lo ejecutado en la {currentWeekLabel}.
              </Text>
            </View>

            <View style={styles.infoPoint}>
              <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.success} />
              <Text style={styles.infoPointText}>
                <Text style={styles.boldText}>Parte Inferior:</Text> Tabla con la planificación de la semana siguiente ({nextWeekLabel}).
              </Text>
            </View>

            <View style={styles.infoPoint}>
              <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.success} />
              <Text style={styles.infoPointText}>
                <Text style={styles.boldText}>Lógica estricta:</Text> Si es planificada llena "Actividad planificada"; si no, llena "Actividad NO Agendada".
              </Text>
            </View>
          </View>

          {/* Lista de las 11 columnas exactas */}
          <Text style={styles.columnsListTitle}>11 Columnas Exactas Incluidas:</Text>
          <View style={styles.columnsTagsWrap}>
            {EXCEL_COLUMNS.map((col, idx) => (
              <View key={col} style={styles.columnTag}>
                <Text style={styles.columnTagIndex}>{idx + 1}.</Text>
                <Text style={styles.columnTagLabel}>{col}</Text>
              </View>
            ))}
          </View>

          {/* Botón de Generación y Compartir de Excel */}
          <TouchableOpacity
            onPress={handleExportExcel}
            style={[styles.primaryActionBtn, { backgroundColor: COLORS.primary }]}
            disabled={isExportingExcel}
            activeOpacity={0.8}
          >
            {isExportingExcel ? (
              <ActivityIndicator color={COLORS.surface} size="small" />
            ) : (
              <>
                <Ionicons name="download-outline" size={18} color={COLORS.surface} style={styles.btnIcon} />
                <Text style={styles.primaryActionBtnText}>Generar y Compartir Archivo Excel</Text>
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
    marginBottom: 10,
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
  quickSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  textActionBtn: {
    paddingVertical: 4,
  },
  textActionBtnLabel: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },
  dividerDot: {
    marginHorizontal: 8,
    color: COLORS.textMuted,
  },
  previewBox: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
    maxHeight: 180,
  },
  previewTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  previewContent: {
    fontSize: 10,
    color: COLORS.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 14,
  },
  actionButtonsContainer: {
    gap: 10,
    marginTop: 6,
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
  infoCardBlock: {
    backgroundColor: COLORS.primarySoft,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoPointText: {
    fontSize: 12,
    color: COLORS.primaryDark,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  boldText: {
    fontWeight: '800',
  },
  columnsListTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  columnsTagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  columnTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  columnTagIndex: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    marginRight: 4,
  },
  columnTagLabel: {
    fontSize: 11,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
});
