import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
};

interface SettingsData {
  serverHost: string;
  serverPort: string;
  apiKey: string;
  autoConnect: boolean;
}

interface SettingsScreenProps {
  onBack: () => void;
  onSettingsSave: (settings: SettingsData) => void;
}

export default function SettingsScreen({
  onBack,
  onSettingsSave,
}: SettingsScreenProps) {
  const [settings, setSettings] = useState<SettingsData>({
    serverHost: "localhost",
    serverPort: "8080",
    apiKey: "",
    autoConnect: false,
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem("iConsoleSettings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({
          serverHost: parsed.serverHost || "localhost",
          serverPort: parsed.serverPort || "8080",
          apiKey: parsed.apiKey || "",
          autoConnect: parsed.autoConnect || false,
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const saveSettings = async () => {
    if (!settings.serverHost.trim()) {
      Alert.alert("❌ Error", "Server host is required");
      return;
    }

    if (!settings.serverPort.trim() || isNaN(Number(settings.serverPort))) {
      Alert.alert("❌ Error", "Valid port number is required");
      return;
    }

    try {
      setIsLoading(true);
      await AsyncStorage.setItem("iConsoleSettings", JSON.stringify(settings));
      onSettingsSave(settings);
      Alert.alert("✅ Success", "Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      Alert.alert("❌ Error", "Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    if (!settings.serverHost.trim() || !settings.serverPort.trim()) {
      Alert.alert("❌ Error", "Please enter host and port first");
      return;
    }

    try {
      setIsLoading(true);
      const url = `ws://${settings.serverHost}:${settings.serverPort}`;
      const testWs = new WebSocket(url);

      const timeout = setTimeout(() => {
        testWs.close();
        Alert.alert("❌ Connection Failed", "Connection timeout");
        setIsLoading(false);
      }, 5000);

      testWs.onopen = () => {
        clearTimeout(timeout);
        testWs.close();
        Alert.alert("✅ Success", "Connection test successful!");
        setIsLoading(false);
      };

      testWs.onerror = () => {
        clearTimeout(timeout);
        Alert.alert("❌ Connection Failed", "Unable to connect to server");
        setIsLoading(false);
      };
    } catch (error) {
      Alert.alert("❌ Error", "Connection test failed");
      setIsLoading(false);
    }
  };

  const resetToDefaults = () => {
    Alert.alert(
      "🔄 Reset Settings",
      "Are you sure you want to reset to default settings?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            setSettings({
              serverHost: "localhost",
              serverPort: "8080",
              apiKey: "",
              autoConnect: false,
            });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌐 Server Configuration</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Server Host/IP Address</Text>
            <TextInput
              style={styles.input}
              value={settings.serverHost}
              onChangeText={(text) =>
                setSettings({ ...settings, serverHost: text })
              }
              placeholder="localhost or 192.168.1.100"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Port</Text>
            <TextInput
              style={styles.input}
              value={settings.serverPort}
              onChangeText={(text) =>
                setSettings({ ...settings, serverPort: text })
              }
              placeholder="8080"
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔑 API Configuration</Text>

          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Text style={styles.inputLabel}>API Key</Text>
              <TouchableOpacity onPress={() => setShowApiKey(!showApiKey)}>
                <Text style={styles.toggleText}>
                  {showApiKey ? "🙈 Hide" : "👁️ Show"}
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              value={settings.apiKey}
              onChangeText={(text) =>
                setSettings({ ...settings, apiKey: text })
              }
              placeholder="Enter your API key"
              placeholderTextColor={colors.textTertiary}
              secureTextEntry={!showApiKey}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Connection Options</Text>

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>Auto Connect on Startup</Text>
              <Text style={styles.switchDescription}>
                Automatically connect when app opens
              </Text>
            </View>
            <Switch
              value={settings.autoConnect}
              onValueChange={(value) =>
                setSettings({ ...settings, autoConnect: value })
              }
              trackColor={{
                false: colors.textTertiary,
                true: colors.accentGreen,
              }}
              thumbColor={
                settings.autoConnect ? colors.textPrimary : colors.textSecondary
              }
            />
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>📋 Connection Details</Text>
          <Text style={styles.infoText}>
            WebSocket URL: ws://{settings.serverHost}:{settings.serverPort}
          </Text>
          <Text style={styles.infoText}>
            API Key: {settings.apiKey ? "••••••••" : "Not set"}
          </Text>
        </View>

        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[styles.button, styles.testButton]}
            onPress={testConnection}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "🔄 Testing..." : "🧪 Test Connection"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={saveSettings}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "💾 Saving..." : "💾 Save Settings"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={resetToDefaults}
          >
            <Text style={styles.buttonText}>🔄 Reset to Defaults</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>ℹ️ About</Text>
          <Text style={styles.aboutText}>iConsole+ Mobile Client v1.0.0</Text>
          <Text style={styles.aboutText}>
            WebSocket protocol for real-time bike data
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: colors.accentGreen,
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: "500",
  },
  toggleText: {
    fontSize: 14,
    color: colors.accentPurple,
    fontWeight: "600",
  },
  input: {
    backgroundColor: colors.cardDark,
    borderWidth: 1,
    borderColor: colors.textTertiary,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: colors.textPrimary,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.cardDark,
    padding: 15,
    borderRadius: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  switchDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  infoSection: {
    backgroundColor: colors.cardDark,
    padding: 15,
    borderRadius: 12,
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: "600",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 5,
    fontFamily: "monospace",
  },
  buttonSection: {
    marginBottom: 30,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  testButton: {
    backgroundColor: colors.accentPurple,
  },
  saveButton: {
    backgroundColor: colors.successGreen,
  },
  resetButton: {
    backgroundColor: colors.warningOrange,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  aboutSection: {
    alignItems: "center",
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: colors.textTertiary,
  },
  aboutTitle: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: "600",
    marginBottom: 10,
  },
  aboutText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 5,
    textAlign: "center",
  },
});
