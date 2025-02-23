import { View, Text, SafeAreaView, Button, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { sha256 } from 'react-native-sha256';
import { AccessToken, AuthenticationToken, LoginManager } from 'react-native-fbsdk-next';
import { getAuth, FacebookAuthProvider, onAuthStateChanged, signInWithCredential, signOut } from '@react-native-firebase/auth';

const index = () => {

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  // Handle user state changes
  function onAuthStateChangedHandler(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const auth = getAuth();
    const subscriber = onAuthStateChanged(auth, onAuthStateChangedHandler);
    return subscriber; // unsubscribe on unmount
  }, []);

  function generateNonce(length = 16) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let nonce = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      nonce += characters[randomIndex];
    }
    return nonce;
  }

  async function onFacebookButtonPressIOS() {
    const auth = getAuth();
    const nonce = generateNonce();
    const nonceSha256 = await sha256(nonce);
    const result = await LoginManager.logInWithPermissions(
      ['public_profile', 'email'],
      'limited',
      nonceSha256,
    );

    if (result.isCancelled) {
      throw 'User cancelled the login process';
    }

    const data = await AuthenticationToken.getAuthenticationTokenIOS();

    if (!data) {
      throw 'Something went wrong obtaining authentication token';
    }

    const facebookCredential = FacebookAuthProvider.credential(data.authenticationToken, nonce);

    return signInWithCredential(auth, facebookCredential);
  }

  async function onFacebookButtonPressAndroid() {
    const auth = getAuth();
    const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

    if (result.isCancelled) {
      throw 'User cancelled the login process';
    }

    const data = await AccessToken.getCurrentAccessToken();

    if (!data) {
      throw 'Something went wrong obtaining access token';
    }

    const facebookCredential = FacebookAuthProvider.credential(data.accessToken);

    return signInWithCredential(auth, facebookCredential);
  }

  if (initializing) return null;

  if (!user) {
    return (
      <SafeAreaView style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <Text>index</Text>
        <Button
        title="Facebook Sign-In"
        onPress={Platform.OS === "ios" ? () => onFacebookButtonPressIOS().then(() => console.log('Signed in with Facebook!')) : () => onFacebookButtonPressAndroid().then(() => console.log('Signed in with Facebook!'))}
      />
      <Text>{Platform.OS}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{flex:1, justifyContent:'center', alignItems:'center'}}>
      <Text>Welcome {user.displayName}</Text>
      <Button title="Sign out" onPress={() => signOut(getAuth())} />
    </SafeAreaView>
  );
}

export default index