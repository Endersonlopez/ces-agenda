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

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={styles.contentRow}>
        {/* Extremo izquierdo: Logo arriba, Menú hamburguesa abajo */}
        <View style={styles.leftColumn}>
          <View style={styles.logoWrapper}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <TouchableOpacity
            onPress={handleOpenDrawer}
            style={styles.hamburgerButton}
            activeOpacity={0.7}
            accessibilityLabel="Abrir menú"
          >
            <Ionicons name="menu" size={28} color={COLORS.surface} />
          </TouchableOpacity>
        </View>

        {/* Centro: Título de la pantalla */}
        <View style={styles.titleContainer}>
          <Text style={styles.screenTitle} numberOfLines={1}>
            {cleanTitle}
          </Text>
          <Text style={styles.techSubtitle} numberOfLines={1}>
            {profile.perfil ? `Especialista en ${profile.perfil}` : 'Agenda técnica CES'}
          </Text>
        </View>

        {/* Extremo derecho: Únicamente el avatar circular */}
        <View style={styles.rightColumn}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
        </View>
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
  leftColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  logoWrapper: {
    width: 40,
    height: 40,
    marginBottom: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  hamburgerButton: {
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
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
  rightColumn: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 10,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.success,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  avatarInitial: {
    color: COLORS.surface,
    fontSize: 15,
    fontWeight: 'bold',
  },
});
