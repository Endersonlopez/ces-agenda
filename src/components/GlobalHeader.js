// Cabecera global con menú hamburguesa, logo strictly sobre avatar, y título sin paréntesis
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useApp } from '../context/AppContext';

export default function GlobalHeader({ title, navigation }) {
  const insets = useSafeAreaInsets();
  const { profile } = useApp();

  // Limpiar cualquier paréntesis del título de la pantalla actual
  const cleanTitle = (title || '').replace(/[()]/g, '').trim();

  // Inicial del técnico para el avatar
  const initial = (profile.nombre && profile.nombre.trim().length > 0)
    ? profile.nombre.trim()[0].toUpperCase()
    : 'T';

  const handleOpenDrawer = () => {
    if (navigation && navigation.toggleDrawer) {
      navigation.toggleDrawer();
    }
  };

  const handleOpenConfig = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('Configuración');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={styles.contentRow}>
        {/* Menú hamburguesa a la izquierda */}
        <TouchableOpacity
          onPress={handleOpenDrawer}
          style={styles.hamburgerButton}
          activeOpacity={0.7}
          accessibilityLabel="Abrir menú"
        >
          <Ionicons name="menu" size={28} color={COLORS.surface} />
        </TouchableOpacity>

        {/* Bloque con Logo posicionado ESTRICTAMENTE por encima del avatar circular con la inicial */}
        <View style={styles.brandAndAvatarColumn}>
          {/* Logo institucional CES estrictamente arriba */}
          <View style={styles.logoWrapper}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Avatar circular con la inicial del técnico estrictamente abajo del logo */}
          <TouchableOpacity
            onPress={handleOpenConfig}
            style={styles.avatarCircle}
            activeOpacity={0.8}
            accessibilityLabel="Ir a Configuración"
          >
            <Text style={styles.avatarInitial}>{initial}</Text>
          </TouchableOpacity>
        </View>

        {/* Título de la pantalla actual sin paréntesis */}
        <View style={styles.titleContainer}>
          <Text style={styles.screenTitle} numberOfLines={1}>
            {cleanTitle}
          </Text>
          <Text style={styles.techSubtitle} numberOfLines={1}>
            {profile.perfil ? `Especialista en ${profile.perfil}` : 'Agenda Técnica CES'}
          </Text>
        </View>

        {/* Botón de acceso directo a perfil/configuración en el extremo derecho */}
        <TouchableOpacity
          onPress={handleOpenConfig}
          style={styles.settingsIconBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={22} color={COLORS.surface} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primaryDark,
    paddingBottom: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  hamburgerButton: {
    padding: 6,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandAndAvatarColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    paddingVertical: 2,
  },
  logoWrapper: {
    width: 26,
    height: 26,
    marginBottom: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 26,
    height: 26,
    borderRadius: 4,
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.success,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  avatarInitial: {
    color: COLORS.surface,
    fontSize: 13,
    fontWeight: 'bold',
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  screenTitle: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  techSubtitle: {
    color: COLORS.primarySoft,
    fontSize: 11,
    marginTop: 1,
  },
  settingsIconBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
