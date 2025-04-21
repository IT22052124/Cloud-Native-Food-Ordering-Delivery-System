import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import * as Yup from 'yup';
import { Formik } from 'formik';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../services/firebase';
import Toast from 'react-native-toast-message';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().required('Phone number is required'),
  nic: Yup.string().required('NIC number is required'),
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
      }
    } catch (error) {
      console.error('Image picker error:', error);
      setUploading(false);
    }
  };

  const uploadImageAsync = async (uri: string) => {
    try {
      // Convert image to blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Create unique filename
      const filename = `nic-images/${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const storageRef = ref(storage, filename);
      
      // Upload to Firebase
      await uploadBytes(storageRef, blob);
      
      // Get download URL
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleSubmit = async (values: {
    name: string;
    email: string;
    phone: string;
    nic: string;
    password: string;
  }) => {
    if (!nicImage) {
      Alert.alert('Error', 'Please upload your NIC image');
      return;
    }

    try {
      setLoading(true);
      await register(
        {
          name: values.name,
          email: values.email,
          phone: values.phone,
          password: values.password,
          nic: values.nic,
          nicImage,
        }, 
        'delivery' // role as second argument
      );
      router.replace('/(auth)/pending-approval');
    } catch (error : any) {
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: error.response?.data?.message || 'Server error',
        });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register as Delivery Partner</Text>
      
      <Formik
        initialValues={{
          name: '',
          email: '',
          phone: '',
          nic: '',
          password: '',
          confirmPassword: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              onChangeText={handleChange('name')}
              onBlur={handleBlur('name')}
              value={values.name}
            />
            {touched.name && errors.name && (
              <Text style={styles.errorText}>{errors.name}</Text>
            )}

            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
            />
            {touched.email && errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              onChangeText={handleChange('phone')}
              onBlur={handleBlur('phone')}
              value={values.phone}
            />
            {touched.phone && errors.phone && (
              <Text style={styles.errorText}>{errors.phone}</Text>
            )}

            <TextInput
              style={styles.input}
              placeholder="NIC Number"
              onChangeText={handleChange('nic')}
              onBlur={handleBlur('nic')}
              value={values.nic}
            />
            {touched.nic && errors.nic && (
              <Text style={styles.errorText}>{errors.nic}</Text>
            )}

            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
            />
            {touched.password && errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              secureTextEntry
              onChangeText={handleChange('confirmPassword')}
              onBlur={handleBlur('confirmPassword')}
              value={values.confirmPassword}
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={pickImage}
              disabled={uploading}
            >
              <Text style={styles.uploadButtonText}>
                {uploading ? 'Uploading...' : nicImage ? 'NIC Image Uploaded ✓' : 'Upload NIC Image'}
              </Text>
            </TouchableOpacity>

            {nicImage && (
              <Image 
                source={{ uri: nicImage }} 
                style={styles.imagePreview} 
                resizeMode="contain"
              />
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={() => handleSubmit()}
              disabled={loading || uploading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Registering...' : 'Register as Delivery Partner'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>

      <TouchableOpacity
        style={styles.loginLink}
        onPress={() => router.push('/(auth)/login')}
      >
        <Text style={styles.loginLinkText}>
          Already have an account? Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    marginBottom: 10,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  uploadButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    marginBottom: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#007AFF',
    fontSize: 16,
  },
});