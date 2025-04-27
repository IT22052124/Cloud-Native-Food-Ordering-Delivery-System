import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Card } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";

const TermsOfServiceScreen = ({ navigation }) => {
  const theme = useTheme();

  const sections = [
    {
      title: "Acceptance of Terms",
      content: [
        "By using FoodApp, you agree to these Terms of Service.",
        "You must be at least 18 years old to use our service.",
        "You are responsible for maintaining the confidentiality of your account.",
      ],
    },
    {
      title: "Ordering and Delivery",
      content: [
        "All orders are subject to restaurant availability.",
        "Delivery times are estimates and not guaranteed.",
        "Prices may vary from in-restaurant prices.",
        "Restaurants may substitute items if necessary.",
      ],
    },
    {
      title: "Payment Terms",
      content: [
        "All payments are processed securely.",
        "Prices include applicable taxes and fees.",
        "Refunds are processed according to our refund policy.",
        "We accept various payment methods as listed in the app.",
      ],
    },
    {
      title: "User Responsibilities",
      content: [
        "Provide accurate delivery information.",
        "Ensure someone is available to receive the order.",
        "Report any issues with your order promptly.",
        "Use the service in compliance with all applicable laws.",
      ],
    },
    {
      title: "Service Limitations",
      content: [
        "Service availability may vary by location.",
        "We reserve the right to refuse service.",
        "Technical issues may occasionally affect service.",
        "Menu items and prices are subject to change.",
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
            <Text style={styles.title}>Terms of Service</Text>
            <Text style={styles.lastUpdated}>
              Last updated: January 1, 2024
            </Text>

            <Text style={styles.intro}>
              Please read these Terms of Service carefully before using FoodApp.
              By using our service, you agree to be bound by these terms.
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
            <Text style={styles.sectionTitle}>Changes to Terms</Text>
            <Text style={styles.text}>
              We may update these Terms of Service from time to time. We will
              notify you of any changes by posting the new Terms on this page.
            </Text>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { ...theme.shadow.small }]}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            <Text style={styles.text}>
              If you have any questions about these Terms of Service, please
              contact us at:
            </Text>
            <Text style={styles.contactInfo}>
              Email: legal@foodapp.com{"\n"}
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

export default TermsOfServiceScreen;
