import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import HomeScreen from './home';
import Student from './infostudent';
import SettingsScreen from './setting';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const SCREEN_WIDTH = Dimensions.get('window').width;

const MainScreen: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<'home' | 'infostudent' | 'setting'>('home');
  const translateX = useSharedValue(0); // Giá trị dịch chuyển theo trục X

  // Pre-render các màn hình
  const screens = useMemo(() => ({
    home: <HomeScreen />,
    infostudent: <Student />,
    setting: <SettingsScreen />,
  }), []);

  // Xử lý vuốt sang trái
  const handleSwipeLeft = useCallback(() => {
    if (activeScreen === 'home') {
      setActiveScreen('infostudent');
    } else if (activeScreen === 'infostudent') {
      setActiveScreen('setting');
    }
  }, [activeScreen]);

  // Xử lý vuốt sang phải
  const handleSwipeRight = useCallback(() => {
    if (activeScreen === 'infostudent') {
      setActiveScreen('home');
    } else if (activeScreen === 'setting') {
      setActiveScreen('infostudent');
    }
  }, [activeScreen]);

  // Xử lý chuyển màn hình khi nhấn nút
  const handleNavigationPress = useCallback((route: 'home' | 'infostudent' | 'setting') => {
    // Xác định hướng chuyển động dựa trên vị trí của màn hình mới
    const screenOrder = ['home', 'infostudent', 'setting'];
    const currentIndex = screenOrder.indexOf(activeScreen);
    const nextIndex = screenOrder.indexOf(route);

    if (nextIndex > currentIndex) {
      // Chuyển sang phải (ví dụ: từ Trang chủ sang Bản thân)
      translateX.value = withSpring(-SCREEN_WIDTH, { damping: 15, stiffness: 100 }, () => {
        runOnJS(setActiveScreen)(route); // Gọi hàm chuyển màn hình
        translateX.value = 0; // Reset giá trị dịch chuyển
      });
    } else if (nextIndex < currentIndex) {
      // Chuyển sang trái (ví dụ: từ Bản thân sang Trang chủ)
      translateX.value = withSpring(SCREEN_WIDTH, { damping: 15, stiffness: 100 }, () => {
        runOnJS(setActiveScreen)(route); // Gọi hàm chuyển màn hình
        translateX.value = 0; // Reset giá trị dịch chuyển
      });
    }
  }, [activeScreen]);

  // Cử chỉ vuốt
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX; // Cập nhật giá trị dịch chuyển
    })
    .onEnd((event) => {
      if (event.translationX > SCREEN_WIDTH / 4) {
        // Vuốt sang phải
        translateX.value = withSpring(SCREEN_WIDTH, { damping: 15, stiffness: 100 }, () => {
          runOnJS(handleSwipeRight)(); // Gọi hàm chuyển màn hình
          translateX.value = 0; // Reset giá trị dịch chuyển
        });
      } else if (event.translationX < -SCREEN_WIDTH / 4) {
        // Vuốt sang trái
        translateX.value = withSpring(-SCREEN_WIDTH, { damping: 15, stiffness: 100 }, () => {
          runOnJS(handleSwipeLeft)(); // Gọi hàm chuyển màn hình
          translateX.value = 0; // Reset giá trị dịch chuyển
        });
      } else {
        // Không vuốt đủ, trở về vị trí ban đầu
        translateX.value = withSpring(0, { damping: 15, stiffness: 100 });
      }
    });

  // Hiệu ứng cho màn hình hiện tại
  const currentScreenStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  // Hiệu ứng cho màn hình tiếp theo (khi vuốt sang trái)
  const nextScreenStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value + SCREEN_WIDTH }],
    };
  });

  // Hiệu ứng cho màn hình trước đó (khi vuốt sang phải)
  const previousScreenStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value - SCREEN_WIDTH }],
    };
  });

  // Xác định màn hình tiếp theo (khi vuốt sang trái)
  const getNextScreen = () => {
    if (activeScreen === 'home') return 'infostudent';
    if (activeScreen === 'infostudent') return 'setting';
    return 'home';
  };

  // Xác định màn hình trước đó (khi vuốt sang phải)
  const getPreviousScreen = () => {
    if (activeScreen === 'infostudent') return 'home';
    if (activeScreen === 'setting') return 'infostudent';
    return 'setting';
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {/* Màn hình trước đó (khi vuốt sang phải) */}
        <Animated.View style={[{ position: 'absolute', width: '100%', height: '100%' }, previousScreenStyle]}>
          {screens[getPreviousScreen()]}
        </Animated.View>

        {/* Màn hình tiếp theo (khi vuốt sang trái) */}
        <Animated.View style={[{ position: 'absolute', width: '100%', height: '100%' }, nextScreenStyle]}>
          {screens[getNextScreen()]}
        </Animated.View>

        {/* Màn hình hiện tại */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[{ flex: 1 }, currentScreenStyle]}>
            {screens[activeScreen]}
          </Animated.View>
        </GestureDetector>

        {/* Thanh điều hướng */}
        <View style={styles.bottomNav}>
          {[
            { icon: 'home', text: 'Trang chủ', route: 'home' },
            { icon: 'user', text: 'Bản thân', route: 'infostudent' },
            { icon: 'cog', text: 'Cài đặt', route: 'setting' },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.navItem}
              onPress={() => handleNavigationPress(item.route as any)}
            >
              <FontAwesome
                name={item.icon as any}
                size={24}
                color={activeScreen === item.route ? '#1E88E5' : 'gray'}
              />
              <Text
                style={[
                  styles.navText,
                  { color: activeScreen === item.route ? '#1E88E5' : 'gray' },
                ]}
              >
                {item.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#DDD',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 12, marginTop: 3 },
});

export default MainScreen;
