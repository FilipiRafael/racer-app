import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import * as Haptics from "expo-haptics";
import { colors } from "../styles/colors";
import { joystickConfig } from "../config/joystick";

export type Direction = "up" | "down" | "left" | "right" | null;

interface JoystickProps {
  onDirectionChange?: (directions: Direction[]) => void;
}

const Joystick: React.FC<JoystickProps> = ({ onDirectionChange }) => {
  const [activeButtons, setActiveButtons] = useState<Direction[]>([]);
  const lastHapticTimestamp = useRef<number>(0);

  const triggerHapticFeedback = () => {
    if (!joystickConfig.haptics.enabled) return;

    const now = Date.now();
    if (now - lastHapticTimestamp.current < joystickConfig.haptics.cooldown)
      return;

    lastHapticTimestamp.current = now;

    switch (joystickConfig.haptics.feedbackType) {
      case "impactLight":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case "impactMedium":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case "impactHeavy":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case "notificationSuccess":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case "notificationWarning":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case "notificationError":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      default:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handlePressIn = (direction: Direction) => {
    setActiveButtons((prev) => {
      // Only add if not already present
      if (!prev.includes(direction)) {
        const newDirections = [...prev, direction];
        onDirectionChange?.(newDirections);
        return newDirections;
      }
      return prev;
    });

    triggerHapticFeedback();
  };

  const handlePressOut = (direction: Direction) => {
    setActiveButtons((prev) => {
      const newDirections = prev.filter((dir) => dir !== direction);
      onDirectionChange?.(newDirections);
      return newDirections;
    });
  };

  const { visual } = joystickConfig;
  const offset = visual.buttonOffset + visual.buttonSize / 2;

  return (
    <View style={styles.container}>
      <View style={styles.centerCircleWrapper}>
        <View
          style={[
            styles.centerCircle,
            {
              width: visual.centerCircleSize,
              height: visual.centerCircleSize,
              borderRadius: visual.centerCircleSize / 2,
            },
          ]}
        />

        <TouchableOpacity
          style={[
            styles.button,
            {
              width: visual.buttonSize,
              height: visual.buttonSize,
              borderRadius: visual.buttonBorderRadius,
              transform: [{ translateY: -offset }],
            },
            activeButtons.includes("up") && styles.activeButton,
          ]}
          onPressIn={() => handlePressIn("up")}
          onPressOut={() => handlePressOut("up")}
          activeOpacity={joystickConfig.response.buttonActiveOpacity}
        >
          <Text style={styles.buttonText}>▲</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            {
              width: visual.buttonSize,
              height: visual.buttonSize,
              borderRadius: visual.buttonBorderRadius,
              transform: [{ translateY: offset }],
            },
            activeButtons.includes("down") && styles.activeButton,
          ]}
          onPressIn={() => handlePressIn("down")}
          onPressOut={() => handlePressOut("down")}
          activeOpacity={joystickConfig.response.buttonActiveOpacity}
        >
          <Text style={styles.buttonText}>▼</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            {
              width: visual.buttonSize,
              height: visual.buttonSize,
              borderRadius: visual.buttonBorderRadius,
              transform: [{ translateX: -offset }],
            },
            activeButtons.includes("left") && styles.activeButton,
          ]}
          onPressIn={() => handlePressIn("left")}
          onPressOut={() => handlePressOut("left")}
          activeOpacity={joystickConfig.response.buttonActiveOpacity}
        >
          <Text style={styles.buttonText}>◀</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            {
              width: visual.buttonSize,
              height: visual.buttonSize,
              borderRadius: visual.buttonBorderRadius,
              transform: [{ translateX: offset }],
            },
            activeButtons.includes("right") && styles.activeButton,
          ]}
          onPressIn={() => handlePressIn("right")}
          onPressOut={() => handlePressOut("right")}
          activeOpacity={joystickConfig.response.buttonActiveOpacity}
        >
          <Text style={styles.buttonText}>▶</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centerCircleWrapper: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  centerCircle: {
    borderWidth: 2,
    borderColor: colors.borderLight,
    position: "absolute",
  },
  button: {
    position: "absolute",
    backgroundColor: colors.buttonBg,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  activeButton: {
    backgroundColor: colors.buttonActive,
  },
  buttonText: {
    fontSize: 30,
    color: colors.buttonText,
    fontWeight: "bold",
  },
});

export default Joystick;
