import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Card, List, Divider, IconButton } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";

const HelpCenterScreen = ({ navigation }) => {
  const theme = useTheme();

  const helpTopics = [
    {
      title: "Getting Started",
      items: [
        {
          title: "How to Place an Order",
          description: "Step-by-step guide to ordering food through our app",
        },
        {
          title: "Account Setup",
          description: "Creating and managing your account",
        },
        {
          title: "Payment Methods",
          description: "Adding and managing payment options",
        },
      ],
    },
    {
      title: "Order Management",
      items: [
        {
          title: "Track Your Order",
          description: "Real-time order tracking and status updates",
        },
        {
          title: "Modify or Cancel Orders",
          description: "How to change or cancel your order",
        },
        {
          title: "Order History",
          description: "View and manage your past orders",
        },
      ],
    },
    {
      title: "Account & Settings",
      items: [
        {
          title: "Profile Management",
          description: "Update your personal information",
        },
        {
          title: "Saved Addresses",
          description: "Manage your delivery addresses",
        },
        {
          title: "Notification Settings",
          description: "Customize your app notifications",
        },
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
            <Text style={styles.title}>Help Center</Text>
            <Text style={styles.subtitle}>
              Find answers to common questions
            </Text>

            {helpTopics.map((topic, index) => (
              <View key={index} style={styles.topicContainer}>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                {topic.items.map((item, itemIndex) => (
                  <View key={itemIndex}>
                    <List.Item
                      title={item.title}
                      description={item.description}
                      left={(props) => (
                        <List.Icon {...props} icon="help-circle" />
                      )}
                      right={(props) => (
                        <IconButton
                          {...props}
                          icon="chevron-right"
                          onPress={() =>
                            navigation.navigate("HelpTopicDetails", {
                              topic: item,
                            })
                          }
                        />
                      )}
                    />
                    {itemIndex < topic.items.length - 1 && <Divider />}
                  </View>
                ))}
              </View>
            ))}
          </Card.Content>
        </Card>

        <Card style={[styles.card, { ...theme.shadow.small }]}>
          <Card.Content>
            <Text style={styles.title}>Contact Support</Text>
            <List.Item
              title="Live Chat"
              description="Chat with our support team 24/7"
              left={(props) => <List.Icon {...props} icon="chat" />}
              onPress={() => navigation.navigate("LiveChat")}
            />
            <Divider />
            <List.Item
              title="Email Support"
              description="support@foodapp.com"
              left={(props) => <List.Icon {...props} icon="email" />}
              onPress={() => {}}
            />
            <Divider />
            <List.Item
              title="Phone Support"
              description="+1 (800) 123-4567"
              left={(props) => <List.Icon {...props} icon="phone" />}
              onPress={() => {}}
            />
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
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 16,
  },
  topicContainer: {
    marginBottom: 24,
  },
  topicTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
});

export default HelpCenterScreen;
