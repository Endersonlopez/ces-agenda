// Almacenamiento local del perfil del técnico con AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_STORAGE_KEY = '@agenda_ces_profile';

export const INITIAL_PROFILE = {
  nombre: '',
  apellido: '',
  perfil: 'Cómputo',
  isOnboarded: false,
};

/**
 * Obtiene el perfil guardado en AsyncStorage
 */
export async function getProfile() {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return INITIAL_PROFILE;
    const parsed = JSON.parse(raw);
    return {
      nombre: parsed.nombre || '',
      apellido: parsed.apellido || '',
      perfil: parsed.perfil || 'Cómputo',
      isOnboarded: Boolean(parsed.isOnboarded),
    };
  } catch (error) {
    console.error('Error al leer el perfil del técnico:', error);
    return INITIAL_PROFILE;
  }
}

/**
 * Guarda o actualiza los datos del perfil
 */
export async function saveProfile(profileData) {
  try {
    const dataToSave = {
      nombre: (profileData.nombre || '').trim(),
      apellido: (profileData.apellido || '').trim(),
      perfil: profileData.perfil || 'Cómputo',
      isOnboarded: true,
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(dataToSave));
    return dataToSave;
  } catch (error) {
    console.error('Error al guardar el perfil:', error);
    throw error;
  }
}

/**
 * Elimina los datos del perfil (para pruebas o reset)
 */
export async function clearProfile() {
  try {
    await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
  } catch (error) {
    console.error('Error al limpiar perfil:', error);
  }
}
