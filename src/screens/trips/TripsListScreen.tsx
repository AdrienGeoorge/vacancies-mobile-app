import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { fs } from '../../constants'

export default function TripsListScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes voyages</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: fs(24), fontWeight: 'bold' },
})
