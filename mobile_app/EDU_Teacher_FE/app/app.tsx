import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./login"; // Import màn hình login
import RegisterScreen from "./register"; // Import màn hình register

export type RootStackParamList = {
    login: undefined;
    register: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const app = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="login">
        <Stack.Screen name="login" component={LoginScreen} />
        <Stack.Screen name="register" component={RegisterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default app;
