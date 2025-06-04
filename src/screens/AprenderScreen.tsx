import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';

const AprenderScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        {/* Adicione aqui os componentes da tela Aprender */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
});

export default AprenderScreen;