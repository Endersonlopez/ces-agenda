// Navegación tipo Drawer con las 5 pantallas reglamentarias y diseño institucional CES
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useApp } from '../context/AppContext';

// Pantallas
import AgendaDiariaScreen from '../screens/AgendaDiariaScreen';
import PlanificacionSemanalScreen from '../screens/PlanificacionSemanalScreen';
import ExportarScreen from '../screens/ExportarScreen';
import ConfiguracionScreen from '../screens/ConfiguracionScreen';
import AcercaDeScreen from '../screens/AcercaDeScreen';
import PapeleraScreen from '../screens/PapeleraScreen';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const { profile } = useApp();
  const initial = (profile.nombre && profile.nombre.trim().length > 0)
    ? profile.nombre.trim()[0].toUpperCase()
    : 'T';

  return (
    <View style={styles.drawerRoot}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerScroll}>
        {/* Cabecera del Drawer */}
        <View style={styles.drawerHeader}>
          <View style={styles.logoAndAvatarStack}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.drawerLogo}
              resizeMode="contain"
            />
            <View style={styles.drawerAvatar}>
              <Text style={styles.drawerAvatarText}>{initial}</Text>
            </View>
          </View>

          <View style={styles.techInfoBlock}>
            <Text style={styles.techName} numberOfLines={1}>
              {profile.nombre ? `${profile.nombre} ${profile.apellido}` : 'Técnico Especialista'}
            </Text>
            <View style={styles.profileBadge}>
              <Text style={styles.profileBadgeText}>
                {profile.perfil || 'CES'}
              </Text>
            </View>
          </View>
        </View>

        {/* Divisor */}
        <View style={styles.drawerDivider} />

        {/* Lista de pantallas del Drawer */}
        <View style={styles.itemsWrapper}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      {/* Pie del Drawer */}
      <View style={styles.drawerFooter}>
        <Text style={styles.footerAppText}>Agenda CES v1.0.0</Text>
        <Text style={styles.footerDevText}>Por Enderson López</Text>
      </View>
    </View>
  );
}

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Agenda Diaria"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false, // Usamos GlobalHeader personalizado en cada pantalla
        drawerActiveTintColor: COLORS.primary,
        drawerInactiveTintColor: COLORS.textSecondary,
        drawerActiveBackgroundColor: COLORS.primarySoft,
        drawerLabelStyle: {
          fontSize: 14,
          fontWeight: '700',
          marginLeft: -10,
        },
        drawerItemStyle: {
          borderRadius: 8,
          marginHorizontal: 12,
          marginVertical: 4,
          paddingHorizontal: 8,
        },
      }}
    >
      <Drawer.Screen
        name="Agenda Diaria"
        component={AgendaDiariaScreen}
        options={{
          drawerLabel: 'Agenda Diaria',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Planificación Semanal"
        component={PlanificacionSemanalScreen}
        options={{
          drawerLabel: 'Planificación Semanal',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Exportar"
        component={ExportarScreen}
        options={{
          drawerLabel: 'Exportar',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="share-social-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Papelera"
        component={PapeleraScreen}
        options={{
          drawerLabel: 'Papelera',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="trash-bin-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Configuración"
        component={ConfiguracionScreen}
        options={{
          drawerLabel: 'Configuración',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Acerca de"
        component={AcercaDeScreen}
        options={{
          drawerLabel: 'Acerca de',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="information-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerRoot: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  drawerScroll: {
    paddingTop: 0,
  },
  drawerHeader: {
    backgroundColor: COLORS.primary,
    paddingTop: 48,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  logoAndAvatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  drawerLogo: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  drawerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerAvatarText: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: '800',
  },
  techInfoBlock: {
    marginTop: 4,
  },
  techName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.surface,
  },
  profileBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  profileBadgeText: {
    color: COLORS.surface,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  drawerDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 8,
  },
  itemsWrapper: {
    paddingTop: 4,
  },
  drawerFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
  footerAppText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  footerDevText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
