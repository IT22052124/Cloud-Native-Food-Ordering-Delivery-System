import React from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import { Text, Card, List, Divider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";

const AboutUsScreen = ({ navigation }) => {
  const theme = useTheme();

  const companyInfo = {
    name: "FoodApp",
    description:
      "Your trusted food delivery partner, connecting you with the best restaurants in your area.",
    founded: "2020",
    mission:
      "To make food ordering and delivery simple, fast, and enjoyable for everyone.",
    values: [
      "Quality Food",
      "Fast Delivery",
      "Excellent Service",
      "Customer Satisfaction",
    ],
    stats: {
      restaurants: "1000+",
      cities: "50+",
      orders: "1M+",
      customers: "500K+",
    },
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={[styles.card, { ...theme.shadow.small }]}>
          <Card.Content>
            <Text style={styles.title}>About {companyInfo.name}</Text>
            <Text style={styles.description}>{companyInfo.description}</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { ...theme.shadow.small }]}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Our Story</Text>
            <Text style={styles.text}>
              Founded in {companyInfo.founded}, {companyInfo.name} started with
              a simple mission: to revolutionize the way people order and enjoy
              food. What began as a small startup has grown into a leading food
              delivery platform, serving customers across multiple cities.
            </Text>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { ...theme.shadow.small }]}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Our Mission</Text>
            <Text style={styles.text}>{companyInfo.mission}</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { ...theme.shadow.small }]}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Our Values</Text>
            {companyInfo.values.map((value, index) => (
              <View key={index}>
                <List.Item
                  title={value}
                  left={(props) => <List.Icon {...props} icon="check-circle" />}
                />
                {index < companyInfo.values.length - 1 && <Divider />}
              </View>
            ))}
          </Card.Content>
        </Card>

        <Card style={[styles.card, { ...theme.shadow.small }]}>
          <Card.Content>
            <Text style={styles.sectionTitle}>By The Numbers</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {companyInfo.stats.restaurants}
                </Text>
                <Text style={styles.statLabel}>Restaurants</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {companyInfo.stats.cities}
                </Text>
                <Text style={styles.statLabel}>Cities</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {companyInfo.stats.orders}
                </Text>
                <Text style={styles.statLabel}>Orders</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {companyInfo.stats.customers}
                </Text>
                <Text style={styles.statLabel}>Customers</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { ...theme.shadow.small }]}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            <List.Item
              title="Email"
              description="info@foodapp.com"
              left={(props) => <List.Icon {...props} icon="email" />}
            />
            <Divider />
            <List.Item
              title="Phone"
              description="+1 (800) 123-4567"
              left={(props) => <List.Icon {...props} icon="phone" />}
            />
            <Divider />
            <List.Item
              title="Address"
              description="123 Food Street, Suite 100\nNew York, NY 10001"
              left={(props) => <List.Icon {...props} icon="map-marker" />}
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
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 8,
  },
  statItem: {
    width: "48%",
    marginBottom: 16,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
});

export default AboutUsScreen;
