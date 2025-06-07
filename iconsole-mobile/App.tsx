import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SettingsScreen from "./SettingsScreen";
import { WebSocketService } from "./WebSocketService";

const { width, height } = Dimensions.get("window");

const colors = {
  primaryDark: "#000000",
  secondaryDark: "#1a1a1a",
  accentPurple: "#667EEA",
  accentGreen: "#00ff88",
  cardDark: "#2A2A2A",
  textPrimary: "#FFFFFF",
  textSecondary: "#B0B0B0",
  textTertiary: "#808080",
  successGreen: "#00ff88",
  warningOrange: "#ff9500",
  errorRed: "#ff3b30",
  chartBlue: "#007AFF",
  chartGreen: "#34C759",
  chartOrange: "#FF9500",
  chartRed: "#FF3B30",
};

interface WorkoutData {
  time: number;
  speed: number;
  watt: number;
  heartRate: number;
  calories: number;
  distance: number;
  rpm: number;
  resistance: number;
  timestamp?: string;
}

interface SettingsData {
  serverHost: string;
  serverPort: string;
  apiKey: string;
  autoConnect: boolean;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<"main" | "settings">(
    "main"
  );
  const [isConnected, setIsConnected] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [currentData, setCurrentData] = useState<WorkoutData>({
    time: 0,
    speed: 0,
    watt: 0,
    heartRate: 0,
    calories: 0,
    distance: 0,
    rpm: 0,
    resistance: 1,
    timestamp: new Date().toISOString(),
  });
  const [settings, setSettings] = useState<SettingsData>({
    serverHost: "localhost",
    serverPort: "8080",
    apiKey: "",
    autoConnect: false,
  });
  const [wsService] = useState(() => new WebSocketService());
  const [aiAdviceVisible, setAiAdviceVisible] = useState(false);
  const [currentAiAdvice, setCurrentAiAdvice] = useState<any>(null);
  const [aiAdviceTimer, setAiAdviceTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  useEffect(() => {
    loadSettings();
    setupWebSocketListeners();

    return () => {
      wsService.disconnect();
      if (aiAdviceTimer) {
        clearTimeout(aiAdviceTimer);
      }
    };
  }, [aiAdviceTimer]);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem("iConsoleSettings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        const newSettings = {
          serverHost: parsed.serverHost || "localhost",
          serverPort: parsed.serverPort || "8080",
          apiKey: parsed.apiKey || "",
          autoConnect: parsed.autoConnect || false,
        };
        setSettings(newSettings);
        wsService.setHost(newSettings.serverHost);
        wsService.setPort(parseInt(newSettings.serverPort));
        wsService.setApiKey(newSettings.apiKey);

        if (newSettings.autoConnect) {
          setTimeout(() => handleConnect(), 1000);
        }
      }
    } catch (error) {}
  };

  const setupWebSocketListeners = () => {
    wsService.onWorkoutData((data: WorkoutData) => {
      setCurrentData(data);
    });

    wsService.onConnectionChange((connected: boolean) => {
      setIsConnected(connected);
      setConnectionStatus(connected ? "Connected" : "Disconnected");
    });

    wsService.onSessionStatus((status: string) => {
      setIsSessionActive(
        status.toLowerCase() === "started" || status.toLowerCase() === "active"
      );
    });

    wsService.onAIAdvice((advice) => {
      showAIAdvice(advice);
    });
  };

  const handleConnect = async () => {
    if (isConnected) {
      wsService.disconnect();
      setIsSessionActive(false);
    } else {
      try {
        setConnectionStatus("Connecting...");
        await wsService.connect();
      } catch (error) {
        setConnectionStatus("Connection Failed");
      }
    }
  };

  const showAIAdvice = (advice: any) => {
    if (aiAdviceTimer) {
      clearTimeout(aiAdviceTimer);
    }

    setCurrentAiAdvice(advice);
    setAiAdviceVisible(true);

    const timer = setTimeout(() => {
      setAiAdviceVisible(false);
      setAiAdviceTimer(null);
    }, 3000);

    setAiAdviceTimer(timer);
  };

  const hideAIAdvice = () => {
    if (aiAdviceTimer) {
      clearTimeout(aiAdviceTimer);
      setAiAdviceTimer(null);
    }
    setAiAdviceVisible(false);
  };

  const handleSettingsSave = (newSettings: SettingsData) => {
    setSettings(newSettings);
    wsService.setHost(newSettings.serverHost);
    wsService.setPort(parseInt(newSettings.serverPort));
    wsService.setApiKey(newSettings.apiKey);

    if (isConnected) {
      wsService.disconnect();
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const calculatePace = (speed: number): string => {
    if (speed === 0) return "0:00";
    const pace = 60 / speed;
    const minutes = Math.floor(pace);
    const seconds = Math.floor((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (currentScreen === "settings") {
    return (
      <SettingsScreen
        onBack={() => setCurrentScreen("main")}
        onSettingsSave={handleSettingsSave}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor={colors.primaryDark} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>iConsole+</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[
              styles.connectButton,
              {
                backgroundColor: isConnected
                  ? colors.successGreen
                  : colors.errorRed,
              },
            ]}
          >
            <Text style={styles.connectText}>{isConnected ? "●" : "○"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setCurrentScreen("settings")}
          >
            <Text style={styles.settingsText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statusBar}>
        <Text
          style={[
            styles.statusText,
            {
              color: isConnected ? colors.successGreen : colors.warningOrange,
            },
          ]}
        >
          {connectionStatus}
        </Text>
      </View>

      <View style={styles.mainSpeedContainer}>
        <View
          style={[
            styles.speedCircle,
            {
              borderColor: isSessionActive
                ? colors.accentGreen
                : colors.textTertiary,
            },
          ]}
        >
          <Text style={styles.speedValue}>{currentData.speed.toFixed(1)}</Text>
          <Text style={styles.speedUnit}>km/h</Text>
          <Text style={styles.speedLabel}>SPEED</Text>
        </View>

        <View style={styles.cornerMetrics}>
          <View style={[styles.cornerMetric, styles.topLeft]}>
            <Text style={styles.cornerValue}>
              {formatTime(currentData.time)}
            </Text>
            <Text style={styles.cornerLabel}>TIME</Text>
          </View>
          <View style={[styles.cornerMetric, styles.topRight]}>
            <Text style={styles.cornerValue}>
              {currentData.heartRate > 0
                ? Math.round(currentData.heartRate)
                : "--"}
            </Text>
            <Text style={styles.cornerLabel}>❤️ BPM</Text>
          </View>

          <View style={[styles.cornerMetric, styles.bottomLeft]}>
            <Text style={styles.cornerValue}>
              {currentData.distance.toFixed(2)}
            </Text>
            <Text style={styles.cornerLabel}>KM</Text>
          </View>

          <View style={[styles.cornerMetric, styles.bottomRight]}>
            <Text style={styles.cornerValue}>
              {Math.round(currentData.calories)}
            </Text>
            <Text style={styles.cornerLabel}>🔥 KCAL</Text>
          </View>
        </View>
      </View>

      <View style={styles.secondaryMetrics}>
        <View style={styles.secondaryMetric}>
          <Text style={styles.secondaryValue}>
            {Math.round(currentData.watt)}
          </Text>
          <Text style={styles.secondaryLabel}>POWER (W)</Text>
        </View>

        <View style={styles.secondaryMetric}>
          <Text style={styles.secondaryValue}>
            {calculatePace(currentData.speed)}
          </Text>
          <Text style={styles.secondaryLabel}>PACE (/km)</Text>
        </View>

        <View style={styles.secondaryMetric}>
          <Text style={styles.secondaryValue}>{currentData.rpm}</Text>
          <Text style={styles.secondaryLabel}>RPM</Text>
        </View>
      </View>

      {isConnected && (
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isSessionActive
                  ? colors.successGreen
                  : colors.warningOrange,
              },
            ]}
          >
            <Text style={styles.statusBadgeText}>
              {isSessionActive ? "🚴 RIDING" : "⏸️ READY"}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: isConnected
                ? colors.errorRed
                : colors.accentPurple,
            },
          ]}
          onPress={handleConnect}
        >
          <Text style={styles.actionButtonText}>
            {isConnected ? "📡 DISCONNECT" : "📡 CONNECT"}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={aiAdviceVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={hideAIAdvice}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {currentAiAdvice && (
              <>
                <Text style={styles.modalTitle}>🤖 AI Trainer</Text>
                <Text style={styles.modalAdvice}>{currentAiAdvice.advice}</Text>
                <Text style={styles.modalAction}>
                  💪 {currentAiAdvice.action}
                </Text>
                <Text style={styles.modalResistance}>
                  🎯 Resistance: {currentAiAdvice.oldResistance} →{" "}
                  {currentAiAdvice.newResistance}
                </Text>
                <Text style={styles.modalAutoClose}>
                  ⏰ Auto-closes in 3 seconds
                </Text>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  connectButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  connectText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "bold",
  },
  settingsButton: {
    padding: 5,
  },
  settingsText: {
    fontSize: 20,
  },
  statusBar: {
    alignItems: "center",
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
  },
  mainSpeedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  speedCircle: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: (width * 0.6) / 2,
    borderWidth: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.secondaryDark,
    shadowColor: colors.accentGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  speedValue: {
    fontSize: 72,
    fontWeight: "100",
    color: colors.textPrimary,
    lineHeight: 72,
  },
  speedUnit: {
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: 5,
    letterSpacing: 2,
  },
  speedLabel: {
    fontSize: 14,
    color: colors.accentGreen,
    marginTop: 8,
    fontWeight: "600",
    letterSpacing: 3,
  },
  cornerMetrics: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  cornerMetric: {
    position: "absolute",
    alignItems: "center",
    minWidth: 80,
  },
  topLeft: {
    top: 40,
    left: 40,
  },
  topRight: {
    top: 40,
    right: 40,
  },
  bottomLeft: {
    bottom: 40,
    left: 40,
  },
  bottomRight: {
    bottom: 40,
    right: 40,
  },
  cornerValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cornerLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "600",
    letterSpacing: 1,
  },
  secondaryMetrics: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  secondaryMetric: {
    alignItems: "center",
  },
  secondaryValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  secondaryLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "500",
    letterSpacing: 1,
  },
  statusContainer: {
    alignItems: "center",
    paddingVertical: 10,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 120,
    alignItems: "center",
  },
  statusBadgeText: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  controlsContainer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
    paddingTop: 20,
  },
  actionButton: {
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: colors.cardDark,
    borderRadius: 20,
    padding: 30,
    margin: 20,
    maxWidth: 350,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.accentGreen,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.accentGreen,
    marginBottom: 20,
    textAlign: "center",
  },
  modalAdvice: {
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 15,
    lineHeight: 24,
  },
  modalAction: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "600",
  },
  modalResistance: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 15,
    fontWeight: "600",
  },
  modalAutoClose: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: "center",
    marginBottom: 20,
    fontStyle: "italic",
  },
  modalButton: {
    backgroundColor: colors.accentGreen,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primaryDark,
    letterSpacing: 1,
  },
});
