import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  useTheme,
  Card,
  IconButton,
} from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const validationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

export default function LoginScreen() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const { colors } = useTheme();

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      setLoading(true);
      const user = await login(values);

      if (user.role === 'delivery') {
        if (user.status === 'pending_approval') {
          router.replace('/(auth)/pending-approval');
        } else {
          router.replace('/(delivery)/dashboard');
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Access Restricted',
          text2: 'Only delivery partners can login through this app',
          position: 'bottom',
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error.message || 'Invalid credentials',
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons
              name="motorbike"
              size={48}
              color={colors.primary}
            />
            <Text variant="headlineMedium" style={styles.title}>
              Delivery Partner
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Sign in to your account
            </Text>
          </View>

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <>
                <TextInput
                  mode="outlined"
                  label="Email"
                  placeholder="Enter your email"
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={touched.email && !!errors.email}
                  style={styles.input}
                  left={<TextInput.Icon icon="email" />}
                />
                {touched.email && errors.email && (
                  <Text style={styles.error}>{errors.email}</Text>
                )}

                <TextInput
                  mode="outlined"
                  label="Password"
                  placeholder="Enter your password"
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                  secureTextEntry={secureTextEntry}
                  error={touched.password && !!errors.password}
                  style={styles.input}
                  left={<TextInput.Icon icon="lock" />}
                  right={
                    <TextInput.Icon
                      icon={secureTextEntry ? 'eye-off' : 'eye'}
                      onPress={() => setSecureTextEntry(!secureTextEntry)}
                    />
                  }
                />
                {touched.password && errors.password && (
                  <Text style={styles.error}>{errors.password}</Text>
                )}

                <Button
                  mode="contained"
                  onPress={() => handleSubmit()}
                  loading={loading}
                  disabled={loading}
                  style={styles.button}
                  labelStyle={styles.buttonLabel}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </>
            )}
          </Formik>

          <View style={styles.footer}>
            <Text variant="bodyMedium" style={styles.footerText}>
              Don't have an account?
            </Text>
            <Button
              mode="text"
              onPress={() => router.push('/(auth)/delivery-register')}
              compact
              labelStyle={styles.registerButton}
            >
              Register Now
            </Button>
          </View>
        </Card.Content>
      </Card>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    paddingVertical: 24,
    borderRadius: 16,
    elevation: 4,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    marginTop: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.6,
  },
  input: {
    marginBottom: 8,
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 4,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    opacity: 0.6,
  },
  registerButton: {
    marginLeft: 4,
    fontWeight: 'bold',
  },
});