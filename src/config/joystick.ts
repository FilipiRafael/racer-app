export const joystickConfig = {
  haptics: {
    enabled: true,
    feedbackType: "impactMedium",
    cooldown: 100,
    continuous: {
      enabled: true,
      interval: 500,
      intensity: "light",
    },
  },
  visual: {
    centerCircleSize: 250,
    buttonSize: 100,
    buttonOffset: 65,
    buttonBorderRadius: 10,
  },
  response: {
    buttonActiveOpacity: 0.8,
  },
};
