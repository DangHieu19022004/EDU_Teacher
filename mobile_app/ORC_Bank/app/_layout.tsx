import { Slot, SplashScreen, Stack } from "expo-router";
import { useFonts } from 'expo-font';

// Import your global CSS file
import "../global.css";
import { useEffect } from "react";

// prevent the splash screen from auto hiding until load all the font assets
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

    const [fontsLoaded, error] = useFonts({
        "Roboto-Mono" : require("../assets/fonts/RobotoMono-Regular.ttf"),
    });

    useEffect(() => {
        if(error) throw error;
        if(fontsLoaded) SplashScreen.hideAsync();
    }, [fontsLoaded, error])


    if(!fontsLoaded) return null;
    if(!fontsLoaded && !error) return null;

    return (
        <Stack>
            
            <Stack.Screen 
                name="index"
                options={{headerShown: false}}
            />
            
        </Stack>
    )
}