import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

const ChatbotScreen: React.FC = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState('Tư vấn học tập');

  const studySuggestions = [
    'Học sinh Nguyễn Văn A lớp 11A3 niên khóa 2022 - 2024 nền khi nào đi học tiết Văn - Anh',
    'Học sinh Nguyễn Văn A lớp 11A3 niên khóa 2022 - 2024 yêu cầu môn nào',
    'Em B lớp 12A4 niên khóa 2024 - 2026 nền cài thiên môn gì để thi đại học',
  ];

  const appSupportSuggestions = [
    'Hướng dẫn sử dụng',
    'Những chức năng của chatbot là gì?'
  ];

  const currentSuggestions = activeTab === 'Tư vấn học tập' ? studySuggestions : appSupportSuggestions;

  useEffect(() => {
    const welcomeMessage: Message = {
      id: Date.now(),
      text: activeTab === 'Tư vấn học tập'
        ? 'Xin chào, tôi là EDUchatbot. Tôi có thể giúp gì cho bạn về học tập?'
        : 'Xin chào, tôi có thể hỗ trợ bạn các vấn đề về ứng dụng',
      sender: 'bot',
    };
    setMessages([welcomeMessage]);
  }, [activeTab]);

  const handleSendMessage = (text: string = inputText) => {
    if (text.trim() === '') return;

    const userMessage: Message = {
      id: Date.now(),
      text: text,
      sender: 'user',
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    setTimeout(() => {
      let botResponse = '';

      if (activeTab === 'Tư vấn học tập') {
        // Logic trả lời cho tab tư vấn học tập
        if (text.toLowerCase().includes('xin chào')) {
          botResponse = 'Xin chào, tôi có thể giúp gì cho bạn về học tập?';
        } else if (text.toLowerCase().includes('khối') || text.toLowerCase().includes('ngành')) {
          botResponse = 'Dựa trên môn Văn - Anh, bạn có thể xem xét các khối D (Văn, Toán, Anh) hoặc khối C (Văn, Sử, Địa). Bạn cần tư vấn cụ thể hơn không?';
        } else if (text.toLowerCase().includes('yếu')) {
          botResponse = 'Theo học bạ, bạn cần cải thiện môn Toán. Điểm trung bình môn Toán của bạn là 5.8, thấp hơn mặt bằng lớp.';
        } else if (text.toLowerCase().includes('cải thiện')) {
          botResponse = 'Bạn nên tập trung cải thiện môn Hóa vì điểm môn này đang ở mức trung bình (6.2) và là môn quan trọng cho khối thi bạn định hướng.';
        } else {
          botResponse = 'Tôi là EDUchatbot, hệ thống hỗ trợ giáo dục. Bạn có thể hỏi tôi về thông tin học bạ, điểm số hoặc các vấn đề liên quan đến giáo dục.';
        }
      } else {
        // Logic trả lời cho tab hỗ trợ app
        if (text.toLowerCase().includes('xin chào')) {
          botResponse = 'Xin chào, tôi có thể hỗ trợ bạn các vấn đề về ứng dụng';
        } else if (text.toLowerCase().includes('giới thiệu') || text.toLowerCase().includes('ứng dụng')) {
          botResponse = 'Ứng dụng là một nền tảng hỗ trợ giáo viên trong công tác quản lý học bạ và theo dõi học lực học sinh, tích hợp các công nghệ hiện đại như AI, OCR, và chatbot. Với các tính năng nổi bật như quét học bạ bằng ảnh, phân tích điểm số, tư vấn học tập, và gửi email cho phụ huynh, hệ thống giúp tự động hóa quá trình nhập liệu, tra cứu và thống kê học tập. Giáo viên có thể đăng ký, đăng nhập linh hoạt qua Google, Facebook hoặc tài khoản cá nhân, đồng thời sử dụng chatbot thông minh để được hỗ trợ sử dụng ứng dụng và tư vấn hướng nghiệp theo từng học sinh. Dữ liệu được lưu trữ và xử lý hiệu quả trên nền tảng MongoDB và VectorDB, bảo đảm tính chính xác và tiện lợi trong công tác giáo dục.';
        } else if (text.toLowerCase().includes('hướng dẫn') || text.toLowerCase().includes('sử dụng')) {
          botResponse = 'Để sử dụng ứng dụng:\n1. Đăng nhập bằng tài khoản Google/Facebook hoặc email\n2. Vào mục Quét học bạ để chụp ảnh học bạ\n3. Hệ thống sẽ tự động nhận diện và nhập điểm\n4. Sử dụng chatbot để được tư vấn học tập hoặc hỗ trợ kỹ thuật';
        } else if (text.toLowerCase().includes('chức năng')) {
          botResponse = 'Các chức năng chính của chatbot:\n- Tư vấn học tập theo từng học sinh\n- Hướng dẫn sử dụng ứng dụng\n- Phân tích điểm số và đưa ra nhận xét\n- Gợi ý cải thiện học lực\n- Trả lời các câu hỏi thường gặp về ứng dụng';
        } else {
          botResponse = 'Tôi có thể hỗ trợ bạn về cách sử dụng ứng dụng hoặc các tính năng của hệ thống. Bạn cần giúp gì cụ thể không?';
        }
      }

      const botMessage: Message = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 500);
  };

  const handleSuggestionPress = (suggestion: string) => {
    setInputText(suggestion);
    handleSendMessage(suggestion);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setMessages([]); // Clear messages when switching tabs
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../../../assets/images/chatbot_logo.png')}
          style={styles.logo}
        />
        <Text style={styles.headerTitle}>Trợ lý học tập – EDUchatbot</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Tư vấn học tập' && styles.activeTab]}
          onPress={() => handleTabChange('Tư vấn học tập')}
        >
          <Text style={[styles.tabText, activeTab === 'Tư vấn học tập' && styles.activeTabText]}>
            Tư vấn học tập
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Hỗ trợ App' && styles.activeTab]}
          onPress={() => handleTabChange('Hỗ trợ App')}
        >
          <Text style={[styles.tabText, activeTab === 'Hỗ trợ App' && styles.activeTabText]}>
            Hỗ trợ App
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chat messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatContainer}
      >
        <ScrollView
          ref={(ref) => ref?.scrollToEnd({ animated: true })}
          contentContainerStyle={styles.messagesContainer}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.sender === 'user' ? styles.userBubble : styles.botBubble,
              ]}
            >
              <Text style={message.sender === 'user' ? styles.userText : styles.botText}>
                {message.text}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Suggestions */}
        <View style={styles.suggestionContainer}>
          <Text style={styles.suggestionHeader}>Gợi ý:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {currentSuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionChip}
                onPress={() => handleSuggestionPress(suggestion)}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Nhập câu hỏi của bạn..."
            placeholderTextColor="#999"
            onSubmitEditing={() => handleSendMessage()}
          />
          <TouchableOpacity style={styles.sendButton} onPress={() => handleSendMessage()}>
            <FontAwesome name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

// Styles remain the same as previous version
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#0066CC',
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'white',
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#0066CC',
  },
  tabText: {
    color: '#666666',
    fontSize: 16,
  },
  activeTabText: {
    color: '#0066CC',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  messagesContainer: {
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderBottomLeftRadius: 0,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#84C2FF',
    borderBottomRightRadius: 0,
  },
  botText: {
    color: '#333',
    fontSize: 14,
  },
  userText: {
    color: '#333',
    fontSize: 14,
  },
  suggestionContainer: {
    marginBottom: 10,
  },
  suggestionHeader: {
    color: '#333',
    fontSize: 14,
    marginBottom: 5,
  },
  suggestionChip: {
    backgroundColor: 'rgba(0, 102, 204, 0.1)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  suggestionText: {
    color: '#0066CC',
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    borderRadius: 25,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    color: '#333',
    fontSize: 14,
    paddingVertical: 8,
  },
  sendButton: {
    padding: 10,
    backgroundColor: '#0066CC',
    borderRadius: 20,
  },
});

export default ChatbotScreen;
