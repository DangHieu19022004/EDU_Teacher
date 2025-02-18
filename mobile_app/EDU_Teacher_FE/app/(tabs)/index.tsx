import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Image } from "react-native";
import auth from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
  webClientId:
    "829388908015-l7l9t9fprb8g7360u1ior810pmqf1vo6.apps.googleusercontent.com",
  scopes: ["profile", "email"],
});

const AuthComponent = () => {
  // State for login status and form type
  const [loggedIn, setLoggedIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // true for signup, false for signin
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<auth.User | null>(null);

  // Handles sign-in/sign-up form submission
  const handleFormSubmit = () => {
    if (isSignUp) {
      auth()
        .createUserWithEmailAndPassword(email, password)
        .then((val) => console.log(val))
        .catch((err) => console.log(err));

      console.log("Signing Up with:", { email, password });
    } else {
      auth()
        .signInWithEmailAndPassword(email, password)
        .then((val) => console.log(val))
        .catch((err) => console.log(err));
      console.log("Signing In with:", { email, password });
    }
    // Simulate login
    setLoggedIn(true);
  };

  function onAuthStateChanged(user) {
    setUser(user);
    if (user) setLoggedIn(true);
    else setLoggedIn(false);
    if (initializing) setInitializing(false);
  }

  async function onGoogleButtonPress() {
    // Check if your device supports Google Play
    await GoogleSignin.signOut();
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // Get the users ID token
    const googleSignInResult = await GoogleSignin.signIn();

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(
      googleSignInResult.data?.idToken ?? null
    );

    // Sign-in the user with the credential
    return await auth().signInWithCredential(googleCredential);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  // Handles sign-out
  const handleSignOut = () => {
    auth()
      .signOut()
      .then(() => console.log("User signed out!"));
    setLoggedIn(false);
    setEmail("");
    setPassword("");
  };

  console.log("User:", user);

  if (loggedIn) {
    return (
      <View style={styles.center}>
        <Text>You are signed in!</Text>
        <Text>{user?.displayName}</Text>
        <Text>{user?.email}</Text>
        <Image source={{ uri: user?.photoURL }} style={{ width: 100, height: 100 }} />
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
        onPress={() =>
          onGoogleButtonPress().then((val) =>
            console.log(val, "Signed in with Google!")
          )
        }
      />
    </View>
  );
};

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
});

export default AuthComponent;
