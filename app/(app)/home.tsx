import { View, StyleSheet, ScrollView } from "react-native";
import Account from "@/components/Account";

export default function AppHome() {
  return (
    <ScrollView
      style={styles.container}
      automaticallyAdjustKeyboardInsets={true}
    >
      <View>
        <Account />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 12,
    paddingBottom: 80,
  },
});
