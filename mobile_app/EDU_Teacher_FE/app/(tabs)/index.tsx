import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Image, Alert, ActivityIndicator } from "react-native";
import auth from "@react-native-firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
  webClientId:
    "829388908015-l7l9t9fprb8g7360u1ior810pmqf1vo6.apps.googleusercontent.com",
  scopes: ["profile", "email"],
});
const BASE_URL = "http://192.168.1.243:8000/auth";
const AuthComponent = () => {
  // State for login status and form type
  const [loggedIn, setLoggedIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // true for signup, false for signin
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<auth.User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  function onAuthStateChanged(user) {
    setUser(user);
    setLoggedIn(!!user); // Nếu user tồn tại → true, nếu không → false
    setIsLoading(false);
    if (initializing) setInitializing(false);
  }

  // Handles sign-in/sign-up form submission
  const handleFormSubmit = () => {
    try{
      let userCredential;
      if (isSignUp) {
        userCredential = auth()
          .createUserWithEmailAndPassword(email, password)
          .then((val) => console.log(val))
          .catch((err) => console.log(err));

        console.log("Signing Up with:", { email, password });
      } else {
        userCredential = auth()
          .signInWithEmailAndPassword(email, password)
          .then((val) => console.log(val))
          .catch((err) => console.log(err));
        console.log("Signing In with:", { email, password });
      }
      // Simulate login
      setLoggedIn(true);
    } catch (error) {
      console.log("Auth Error:", error);
      Alert.alert("Authentication Failed", (error as Error).message);
    }

  };

  async function onGoogleButtonPress() {
    try{
      setIsLoading(true);
      // Check if your device supports Google Play
      await GoogleSignin.signOut();
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      // Get the users ID token
      const googleSignInResult = await GoogleSignin.signIn();

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(
        googleSignInResult.data?.idToken ?? null
      );

      const userCredential = await auth().signInWithCredential(googleCredential);
      const firebaseIdToken = await userCredential.user.getIdToken();
      console.log("Firebase Token:", firebaseIdToken);

      const response = await fetch(`${BASE_URL}/googlelogin/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: firebaseIdToken }),
      });

      const data = await response.json();
      console.log("Response from Backend:", data);

      if (data.access_token && response.ok) {
        await AsyncStorage.setItem("access_token", data.access_token); // Lưu token để duy trì đăng nhập
        setLoggedIn(true);
      }else{
        Alert.alert("Login Failed", data.message || "Unknown error occurred.");
      }
    } catch (error) {
      console.log("Google Sign-In Error:", error);
      Alert.alert("Google Sign-In Failed", (error as Error).message);
    }
    setIsLoading(false);
    // // Sign-in the user with the credential
    // return await auth().signInWithCredential(googleCredential);
  }

  //check login status
  useEffect(() => {
    async function checkLoginStatus() {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("access_token");
      if (token) {
        const response = await fetch(`${BASE_URL}/verify-token/`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
          setLoggedIn(true);
        } else {
          await AsyncStorage.removeItem("access_token");
          setLoggedIn(false);
        }
      }
      setIsLoading(false)
    }

    checkLoginStatus();
  }, []);


  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  // Handles sign-out
  const handleSignOut = async () => {
    try{
      setIsLoading(true);
      await auth()
        .signOut()
        .then(() => console.log("User signed out!"));
      await AsyncStorage.removeItem("access_token");
      setLoggedIn(false);
      setUser(null);
      setEmail("");
      setPassword("");
    }catch (error) {
      console.log("Sign-Out Error:", error);
    }
    setIsLoading(false);
  };

  console.log("User:", user);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (loggedIn) {
    return (
      <View style={styles.center}>
        <Text style={{color: "red"}} >You are signed in!</Text>
        <Text>{user?.displayName}</Text>
        <Text>{user?.email}</Text>
        {user?.avatar && <Image source={{ uri: user?.avatar }} style={styles.avatar} />}
        <Button title="Sign Out" onPress={handleSignOut} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{isSignUp ? "Sign Up" : "Sign In"}</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />

      <Button
        title={isSignUp ? "Sign Up" : "Sign In"}
        onPress={handleFormSubmit}
      />

      <Button
        title={
          isSignUp
            ? "Already have an account? Sign In"
            : "Don't have an account? Sign Up"
        }
        onPress={() => setIsSignUp(!isSignUp)}
      />
      <Button
        title="Sign In with Google"
        color="#4285F4"
        onPress={onGoogleButtonPress}
      />
    </View>
  );
};
// CSS Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginVertical: 10,
  },
});


export default AuthComponent;
