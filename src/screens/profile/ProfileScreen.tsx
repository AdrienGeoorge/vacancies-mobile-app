import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useAuthStore } from '../../stores/authStore'
import { fs } from '../../constants'

export default function ProfileScreen() {
  const logout = useAuthStore(state => state.logout)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: fs(24), fontWeight: 'bold', marginBottom: 32 },
  logoutBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  logoutText: { color: '#dc2626', fontWeight: '600', fontSize: fs(15) },
})
