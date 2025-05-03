import { useState } from 'react';
import { View, StyleSheet, LayoutAnimation } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Formik } from 'formik';
import * as Yup from 'yup';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../services/firebase';
import Toast from 'react-native-toast-message';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  useTheme,
  Card,
  HelperText,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type FormValues = {
  name: string;
  email: string;
  phone: string;
  nic: string;
  vehiclePlate: string;
  password: string;
  confirmPassword: string;
};

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().required('Phone number is required'),
  nic: Yup.string().required('NIC number is required'),
  vehiclePlate: Yup.string()
    .required('Vehicle plate is required')
    .matches(/^[A-Z]{2,3}-\d{4}$/, 'Format should be ABC-1234'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm Password is required'),
});

export default function DeliveryRegisterScreen() {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [nicImage, setNicImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [confirmSecureTextEntry, setConfirmSecureTextEntry] = useState(true);
  const { colors } = useTheme();

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setUploading(true);
        const uploadUrl = await uploadImageAsync(result.assets[0].uri);
        setNicImage(uploadUrl);
        setUploading(false);
        Toast.show({
          type: 'success',
          text1: 'Upload Successful',
          text2: 'NIC image uploaded successfully',
        });
      }
    } catch (error) {
      console.error('Image picker error:', error);
      setUploading(false);
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: 'Failed to upload NIC image',
      });
    }
  };

  const uploadImageAsync = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const filename = `nic-images/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const storageRef = ref(storage, filename);

      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleSubmit = async (values: FormValues) => {
    if (!nicImage) {
      Toast.show({
        type: 'error',
        text1: 'NIC Image Required',
        text2: 'Please upload your NIC image',
        position: 'bottom',
      });
      return;
    }


    try {
      setLoading(true);
      const user = await register({
        name: values.name,
        email: values.email,
        phone: values.phone,
        nic: values.nic,
        vehiclePlate: values.vehiclePlate,
        nicImage: nicImage,
        password: values.password,
      });

      router.replace(
        user.status === 'pending_approval'
          ? '/(auth)/pending-approval'
          : '/(delivery)/dashboard'
      );
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: error?.message || 'Something went wrong',
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  // Configure animation for smooth transitions
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        enableOnAndroid={true}
        extraHeight={100}
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableAutomaticScroll={true}
        style={{ flex: 1 }}
      >
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons
                name="account-plus"
                size={48}
                color={colors.primary}
              />
              <Text variant="headlineMedium" style={styles.title}>
                Delivery Registration
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Create your delivery partner account
              </Text>
            </View>

            <Formik<FormValues>
              initialValues={{
                name: '',
                email: '',
                phone: '',
                nic: '',
                vehiclePlate: '',
                password: '',
                confirmPassword: '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              validateOnBlur={true}
              validateOnChange={true}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
                setFieldTouched,
                setFieldError,
              }) => {
                const [focusedField, setFocusedField] = useState<keyof FormValues | null>(null);

                const handleFieldChange = (field: keyof FormValues) => (text: string) => {
                  // Auto-format vehicle plate (ABC-1234)
                  if (field === 'vehiclePlate') {
                    text = text.toUpperCase();
                    if (text.length === 3 && !text.includes('-')) {
                      text = text + '-';
                    }
                    if (text.length > 8) {
                      return; // Limit to ABC-1234 format
                    }
                  }
                  
                  handleChange(field)(text);
                  validationSchema.validateAt(field, { [field]: text })
                    .then(() => {
                      setFieldError(field, undefined);
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    })
                    .catch((err) => {
                      if (touched[field]) {
                        setFieldError(field, err.errors[0]);
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      }
                    });
                };

                const customHandleBlur = (field: keyof FormValues) => (e: any) => {
                  handleBlur(field)(e);
                  setFieldTouched(field, true, false);
                  setFocusedField(null);
                  
                  if (!values[field]) {
                    validationSchema.validateAt(field, {})
                      .then(() => setFieldError(field, undefined))
                      .catch((err) => {
                        setFieldError(field, err.errors[0]);
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      });
                  }
                };

                const handleFocus = (field: keyof FormValues) => {
                  setFocusedField(field);
                };

                return (
                  <>
                    {/* Name Field */}
                    <View>
                      <TextInput
                        mode="outlined"
                        label="Full Name"
                        dense
                        placeholder="Enter your full name"
                        onChangeText={handleFieldChange('name')}
                        onFocus={() => handleFocus('name')}
                        onBlur={customHandleBlur('name')}
                        value={values.name}
                        error={focusedField === 'name' ? false : (touched.name && !!errors.name)}
                        style={styles.input}
                        left={<TextInput.Icon icon="account" />}
                      />
                      {touched.name && errors.name && (
                        <HelperText type="error" style={styles.errorHelper}>
                          {errors.name}
                        </HelperText>
                      )}
                    </View>

                    {/* Email Field */}
                    <View>
                      <TextInput
                        mode="outlined"
                        label="Email"
                        dense
                        placeholder="Enter your email"
                        onChangeText={handleFieldChange('email')}
                        onFocus={() => handleFocus('email')}
                        onBlur={customHandleBlur('email')}
                        value={values.email}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={focusedField === 'email' ? false : (touched.email && !!errors.email)}
                        style={styles.input}
                        left={<TextInput.Icon icon="email" />}
                      />
                      {touched.email && errors.email && (
                        <HelperText type="error" style={styles.errorHelper}>
                          {errors.email}
                        </HelperText>
                      )}
                    </View>

                    {/* Phone Field */}
                    <View>
                      <TextInput
                        mode="outlined"
                        label="Phone Number"
                        dense
                        placeholder="Enter your phone number"
                        onChangeText={handleFieldChange('phone')}
                        onFocus={() => handleFocus('phone')}
                        onBlur={customHandleBlur('phone')}
                        value={values.phone}
                        keyboardType="phone-pad"
                        error={focusedField === 'phone' ? false : (touched.phone && !!errors.phone)}
                        style={styles.input}
                        left={<TextInput.Icon icon="phone" />}
                      />
                      {touched.phone && errors.phone && (
                        <HelperText type="error" style={styles.errorHelper}>
                          {errors.phone}
                        </HelperText>
                      )}
                    </View>

                    {/* NIC Field */}
                    <View>
                      <TextInput
                        mode="outlined"
                        label="NIC Number"
                        dense
                        placeholder="Enter your NIC number"
                        onChangeText={handleFieldChange('nic')}
                        onFocus={() => handleFocus('nic')}
                        onBlur={customHandleBlur('nic')}
                        value={values.nic}
                        error={focusedField === 'nic' ? false : (touched.nic && !!errors.nic)}
                        style={styles.input}
                        left={<TextInput.Icon icon="card-account-details" />}
                      />
                      {touched.nic && errors.nic && (
                        <HelperText type="error" style={styles.errorHelper}>
                          {errors.nic}
                        </HelperText>
                      )}
                    </View>

                    {/* Vehicle Plate Field */}
                    <View>
                      <TextInput
                        mode="outlined"
                        label="Vehicle Plate (ABC-1234)"
                        dense
                        placeholder="Enter your vehicle plate"
                        onChangeText={handleFieldChange('vehiclePlate')}
                        onFocus={() => handleFocus('vehiclePlate')}
                        onBlur={customHandleBlur('vehiclePlate')}
                        value={values.vehiclePlate}
                        error={focusedField === 'vehiclePlate' ? false : (touched.vehiclePlate && !!errors.vehiclePlate)}
                        style={styles.input}
                        left={<TextInput.Icon icon="car" />}
                        maxLength={8}
                      />
                      {touched.vehiclePlate && errors.vehiclePlate && (
                        <HelperText type="error" style={styles.errorHelper}>
                          {errors.vehiclePlate}
                        </HelperText>
                      )}
                    </View>

                    {/* Password Field */}
                    <View>
                      <TextInput
                        mode="outlined"
                        label="Password"
                        dense
                        placeholder="Enter your password"
                        onChangeText={handleFieldChange('password')}
                        onFocus={() => handleFocus('password')}
                        onBlur={customHandleBlur('password')}
                        value={values.password}
                        secureTextEntry={secureTextEntry} // Controlled by state
                        error={focusedField === 'password' ? false : (touched.password && !!errors.password)}
                        style={styles.input}
                        left={<TextInput.Icon icon="lock" />}
                        right={
                          <TextInput.Icon
                            icon={secureTextEntry ? 'eye-off' : 'eye'}
                            onPress={() => {
                              setSecureTextEntry(!secureTextEntry);
                              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                            }}
                          />
                        }
                      />
                      {touched.password && errors.password && (
                        <HelperText type="error" style={styles.errorHelper}>
                          {errors.password}
                        </HelperText>
                      )}
                    </View>

                    {/* Confirm Password Field */}
                    <View>
                      <TextInput
                        mode="outlined"
                        label="Confirm Password"
                        dense
                        placeholder="Confirm your password"
                        onChangeText={handleFieldChange('confirmPassword')}
                        onFocus={() => handleFocus('confirmPassword')}
                        onBlur={customHandleBlur('confirmPassword')}
                        value={values.confirmPassword}
                        secureTextEntry={confirmSecureTextEntry} // Controlled by separate state
                        error={focusedField === 'confirmPassword' ? false : (touched.confirmPassword && !!errors.confirmPassword)}
                        style={styles.input}
                        left={<TextInput.Icon icon="lock-check" />}
                        right={
                          <TextInput.Icon
                            icon={confirmSecureTextEntry ? 'eye-off' : 'eye'}
                            onPress={() => {
                              setConfirmSecureTextEntry(!confirmSecureTextEntry);
                              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                            }}
                          />
                        }
                      />
                      {touched.confirmPassword && errors.confirmPassword && (
                        <HelperText type="error" style={styles.errorHelper}>
                          {errors.confirmPassword}
                        </HelperText>
                      )}
                    </View>

                    <Button
                      mode="contained-tonal"
                      icon="upload"
                      onPress={pickImage}
                      loading={uploading}
                      disabled={uploading}
                      style={styles.uploadButton}
                      labelStyle={styles.uploadButtonText}
                    >
                      {uploading ? 'Uploading...' : nicImage ? 'NIC Uploaded' : 'Upload NIC Image'}
                    </Button>

                    {nicImage && (
                      <View style={styles.imagePreviewContainer}>
                        <Text variant="labelMedium" style={styles.imagePreviewText}>
                          NIC Image Preview
                        </Text>
                        <Card.Cover source={{ uri: nicImage }} style={styles.imagePreview} />
                      </View>
                    )}

                    <Button
                      mode="contained"
                      onPress={() => {
                        (Object.keys(values) as Array<keyof FormValues>).forEach(field => {
                          setFieldTouched(field, true, true);
                        });
                        handleSubmit();
                      }}
                      loading={loading}
                      disabled={loading || uploading || !nicImage}
                      style={styles.button}
                      labelStyle={styles.buttonLabel}
                      icon="account-check"
                    >
                      {loading ? 'Registering...' : 'Register'}
                    </Button>
                  </>
                );
              }}
            </Formik>

            <View style={styles.footer}>
              <Text variant="bodyMedium" style={styles.footerText}>
                Already have an account?
              </Text>
              <Button
                mode="text"
                onPress={() => router.push('/(auth)/login')}
                compact
                labelStyle={styles.loginButton}
                icon="login"
              >
                Login
              </Button>
            </View>
          </Card.Content>
        </Card>
      </KeyboardAwareScrollView>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  inputPlaceholder: {
    fontSize: 12, // Your desired placeholder size
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 5,
    paddingTop: 35,
  },
  card: {
    paddingVertical: 10,
    borderRadius: 16,
    marginHorizontal  : 10,
    elevation: 1,
    marginBottom: 0,
    width: '90%', // Set width to 90% of parent
    alignSelf: 'center', // Center the card horizontally
    maxWidth: 500, // Optional: Set a maximum width for larger screens
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 26,
  },
  title: {
    marginTop: 9,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 18,
  },
  subtitle: {
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.6,
    fontSize: 12,
  },
  input: {
    fontSize: 12,
    marginBottom: 1,
  },
  errorHelper: {
    height: 30,
    marginTop: -4,
    marginBottom: 8,
  },
  uploadButton: {
    marginTop: 5,
    marginBottom: 16,
  },
  uploadButtonText: {
    fontSize: 14,
  },
  imagePreviewContainer: {
    marginBottom: 16,
  },
  imagePreviewText: {
    marginBottom: 8,
    opacity: 0.6,
  },
  imagePreview: {
    borderRadius: 8,
  },
  button: {
    marginTop: 4,
    paddingVertical: 3,
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
    fontSize: 11,
    opacity: 0.6,
  },
  loginButton: {
    marginLeft: 4,
    fontWeight: 'bold',
  },
});