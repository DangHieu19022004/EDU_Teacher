import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const onboardingData = [
  {
    image: require('../../assets/images/intro1.png'),
    title: 'Quản lý học bạ dễ dàng',
    description: 'Không còn lo lắng về giấy tờ thất lạc, bạn có thể quản lý kết quả học tập một cách nhanh chóng & chính xác ngay trên điện thoại.',
  },
  {
    image: require('../../assets/images/intro2.png'),
    title: 'Quét học bạ thông minh',
    description: 'Chỉ cần chụp ảnh học bạ, EduScan sẽ tự động trích xuất thông tin bằng công nghệ AI, giúp bạn tiết kiệm thời gian nhập liệu.',
  },
  {
    image: require('../../assets/images/intro3.png'),
    title: 'Chatbot hỗ trợ 24/7',
    description: 'Bạn có thắc mắc về điểm số, xếp loại hay cần tư vấn? Chatbot EduScan sẽ giúp bạn giải đáp ngay lập tức.',
  }
];

const intro: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace('/(auth)/login');
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <View style={styles.container}>
      {/* Nút quay lại */}
      {currentIndex > 0 && (
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backText}>{'< Quay lại'}</Text>
        </TouchableOpacity>
      )}

      {/* Nút Bỏ qua */}
      <TouchableOpacity style={styles.skipButton} onPress={() => router.replace('/(auth)/login')}>
        <Text style={styles.skipText}>Bỏ qua</Text>
      </TouchableOpacity>

      {/* Hình ảnh */}
      <View style={styles.illustrationContainer}>
        <Image source={onboardingData[currentIndex].image} style={styles.image} />
      </View>

      {/* Tiêu đề */}
      <Text style={styles.title}>{onboardingData[currentIndex].title}</Text>

      {/* Mô tả */}
      <Text style={styles.description}>{onboardingData[currentIndex].description}</Text>

      {/* Pagination */}
      <View style={styles.pagination}>
        {onboardingData.map((_, index) => (
          <View key={index} style={[styles.dot, currentIndex === index ? styles.activeDot : styles.inactiveDot]}></View>
        ))}
      </View>

      {/* Nút tiếp theo hoặc bắt đầu khám phá */}
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <LinearGradient colors={['#007AFF', '#0051A8']} style={styles.gradient}>
          <Text style={styles.buttonText}>{currentIndex === onboardingData.length - 1 ? 'Bắt đầu khám phá' : 'Tiếp theo'}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 20,
  },
  skipButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  skipText: {
    color: '#888',
    fontSize: 16,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  backText: {
    color: '#007AFF',
    fontSize: 16,
  },
  illustrationContainer: {
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 30,
  },
  button: {
    width: '80%',
    borderRadius: 25,
    overflow: 'hidden',
  },
  gradient: {
    padding: 15,
    alignItems: 'center',
    borderRadius: 25,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#007AFF',
  },
  inactiveDot: {
    backgroundColor: '#D3D3D3',
  },
});

export default intro;
