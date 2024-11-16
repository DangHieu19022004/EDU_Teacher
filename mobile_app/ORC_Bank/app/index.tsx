import { View, Text, ImageBackground } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import CustomButton from '@/components/CustomButton'
import { useRouter } from 'expo-router'
import AppGradient from '@/components/AppGradient'

const App = () => {
    const router = useRouter();
  return (
    <View className='flex-1'>

            <AppGradient
                    colors={["rgba(0,0,0,0.4)", "rgba(0,0,0,0.5)"]}
            >
                    <SafeAreaView className='flex-1 px-1 justify-between'>
                        <Text className='text-center text-white font-bold text-4xl'>Filter your soul</Text>
                        <View>
                            <CustomButton
                                onPress={() => console.log('Get Started')}
                                title = 'Get Started'
                            />
                        </View>
                        <StatusBar style="light" />
                    </SafeAreaView>
            </AppGradient>

      
    </View>
  )
}

export default App;