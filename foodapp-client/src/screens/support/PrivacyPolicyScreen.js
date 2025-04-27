import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Card } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";

const PrivacyPolicyScreen = ({ navigation }) => {
  const theme = useTheme();

  const sections = [
    {
      title: "Information We Collect",
      content: [
        "Personal information (name, email, phone number)",
        "Delivery addresses",
        "Payment information",
        "Order history",
        "Device information",
        "Location data (with your permission)",
      ],
    },
    {
      title: "How We Use Your Information",
      content: [
        "Process and deliver your orders",
        "Improve our services",
        "Send you important updates",
        "Provide customer support",
        "Personalize your experience",
        "Ensure food safety and quality",
      ],
    },
    {
      title: "Data Security",
      content: [
        "We use industry-standard encryption",
        "Regular security audits",
        "Secure payment processing",
        "Limited employee access to your data",
        "Regular system updates",
      ],
    },
    {
      title: "Third-Party Sharing",
      content: [
        "Restaurant partners (only necessary order information)",
        "Delivery partners (only necessary delivery information)",
        "Payment processors",
        "Analytics services (anonymous data only)",
      ],
    },
    {
      title: "Your Rights",
      content: [
        "Access your personal data",
        "Correct inaccurate data",
        "Request data deletion",
        "Opt-out of marketing communications",
        "Control location tracking",
      ],
    },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={[styles.card, { ...theme.shadow.small }]}>
          <Card.Content>
            <Text style={styles.title}>Privacy Policy</Text>
            <Text style={styles.lastUpdated}>
              Last updated: January 1, 2024
            </Text>

            <Text style={styles.intro}>
              At FoodApp, we take your privacy seriously. This policy explains
              how we collect, use, and protect your personal information when
              you use our food delivery service.
            </Text>
          </Card.Content>
        </Card>

        {sections.map((section, index) => (
          <Card key={index} style={[styles.card, { ...theme.shadow.small }]}>
            <Card.Content>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.content.map((item, itemIndex) => (
                <View key={itemIndex} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listText}>{item}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        ))}

        <Card style={[styles.card, { ...theme.shadow.small }]}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            <Text style={styles.text}>
              If you have any questions about our Privacy Policy, please contact
              us at:
            </Text>
            <Text style={styles.contactInfo}>
              Email: privacy@foodapp.com{"\n"}
              Phone: +1 (800) 123-4567
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  intro: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    marginRight: 8,
  },
  listText: {
    fontSize: 16,
    color: "#666",
    flex: 1,
  },
  text: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
});

export default PrivacyPolicyScreen;
