import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";

import Joystick, { Direction } from "./src/components/Joysticky";
import { useConnectionStatus } from "./src/hooks/useConnectionStatus";
import { colors } from "./src/styles/colors";

export default function App() {
  const { isConnected } = useConnectionStatus();

  const handleDirectionChange = (directions: Direction[]) => {
    // Handle multiple directions here
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusDot,
            isConnected ? styles.connected : styles.disconnected,
          ]}
        />
        <Text style={styles.statusText}>
          {isConnected ? "Connected to the game" : "Connecting..."}
        </Text>
      </View>

      <Joystick onDirectionChange={handleDirectionChange} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.statusBg,
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginTop: 40,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  connected: {
    backgroundColor: colors.connected,
  },
  disconnected: {
    backgroundColor: colors.disconnected,
  },
  statusText: {
    color: colors.textLight,
    fontSize: 18,
  },
});
