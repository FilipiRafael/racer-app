import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";

import { colors } from "../styles/colors";
import { joystickConfig } from "../config/joystick";
import websocketService from "../services/websocketService";

export type Direction = "up" | "down" | "left" | "right" | null;

const Joystick: React.FC = () => {
  const [activeButtons, setActiveButtons] = useState<Direction[]>([]);
  const lastHapticTimestamp = useRef<number>(0);
  const updateInterval = useRef<NodeJS.Timeout | null>(null);
  const lastTapTime = useRef<{ [key: string]: number }>({
    up: 0,
    down: 0,
  });
  const isMoving = useRef<"up" | "down" | null>(null);

  useEffect(() => {
    updateInterval.current = setInterval(() => {
      websocketService.sendJoystickUpdate(activeButtons);
    }, joystickConfig.response.updateFrequency);

    return () => {
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
    };
  }, [activeButtons]);

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

  const handleUpPress = () => {
    const now = Date.now();
    const isDoubleTap = now - lastTapTime.current.up < 300;
    lastTapTime.current.up = now;

    if (isMoving.current === null) {
      // Car is stopped, start moving forward
      isMoving.current = "up";
      setActiveButtons((prev) => {
        const newDirections: Direction[] = [
          ...prev.filter((d) => d !== "up" && d !== "down"),
          "up",
        ];
        websocketService.sendJoystickUpdate(newDirections);
        return newDirections;
      });
    } else if (isMoving.current === "down") {
      // Car is moving backward
      if (isDoubleTap) {
        // Double-tap, switch to forward
        isMoving.current = "up";
        setActiveButtons((prev) => {
          const newDirections: Direction[] = [
            ...prev.filter((d) => d !== "up" && d !== "down"),
            "up",
          ];
          websocketService.sendJoystickUpdate(newDirections);
          return newDirections;
        });
      } else {
        // Single tap, stop the car
        isMoving.current = null;
        setActiveButtons((prev) => {
          const newDirections = prev.filter((d) => d !== "up" && d !== "down");
          websocketService.sendJoystickUpdate(newDirections);
          return newDirections;
        });
      }
    } else if (isMoving.current === "up") {
      // Car is already moving forward, stop it
      isMoving.current = null;
      setActiveButtons((prev) => {
        const newDirections = prev.filter((d) => d !== "up" && d !== "down");
        websocketService.sendJoystickUpdate(newDirections);
        return newDirections;
      });
    }

    triggerHapticFeedback();
  };

  const handleDownPress = () => {
    const now = Date.now();
    const isDoubleTap = now - lastTapTime.current.down < 300;
    lastTapTime.current.down = now;

    if (isMoving.current === null) {
      // Car is stopped, start moving backward
      isMoving.current = "down";
      setActiveButtons((prev) => {
        const newDirections: Direction[] = [
          ...prev.filter((d) => d !== "up" && d !== "down"),
          "down",
        ];
        websocketService.sendJoystickUpdate(newDirections);
        return newDirections;
      });
    } else if (isMoving.current === "up") {
      // Car is moving forward
      if (isDoubleTap) {
        // Double-tap, switch to backward
        isMoving.current = "down";
        setActiveButtons((prev) => {
          const newDirections: Direction[] = [
            ...prev.filter((d) => d !== "up" && d !== "down"),
            "down",
          ];
          websocketService.sendJoystickUpdate(newDirections);
          return newDirections;
        });
      } else {
        // Single tap, stop the car
        isMoving.current = null;
        setActiveButtons((prev) => {
          const newDirections = prev.filter((d) => d !== "up" && d !== "down");
          websocketService.sendJoystickUpdate(newDirections);
          return newDirections;
        });
      }
    } else if (isMoving.current === "down") {
      // Car is already moving backward, stop it
      isMoving.current = null;
      setActiveButtons((prev) => {
        const newDirections = prev.filter((d) => d !== "up" && d !== "down");
        websocketService.sendJoystickUpdate(newDirections);
        return newDirections;
      });
    }

    triggerHapticFeedback();
  };

  const handlePressIn = (direction: Direction) => {
    if (direction === "left" || direction === "right") {
      setActiveButtons((prev) => {
        if (!prev.includes(direction)) {
          const newDirections = [...prev, direction];
          websocketService.sendJoystickUpdate(newDirections);
          return newDirections;
        }
        return prev;
      });
      triggerHapticFeedback();
    }
  };

  const handlePressOut = (direction: Direction) => {
    if (direction === "left" || direction === "right") {
      setActiveButtons((prev) => {
        const newDirections = prev.filter((dir) => dir !== direction);
        websocketService.sendJoystickUpdate(newDirections);
        return newDirections;
      });
    }
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
            isMoving.current === "up" && styles.activeButton,
          ]}
          onPress={handleUpPress}
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
            isMoving.current === "down" && styles.activeButton,
          ]}
          onPress={handleDownPress}
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
