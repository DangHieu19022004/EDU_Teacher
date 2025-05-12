import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from "../../contexts/UserContext";
import { BASE_URL } from '@/constants/Config';

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
  const [studentData, setStudentData] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingDots, setTypingDots] = useState('');
  const { user } = useUser();

  useEffect(() => {
    if (!isTyping) return;

    let count = 0;
    const interval = setInterval(() => {
      count = (count + 1) % 4;
      setTypingDots('.'.repeat(count));
    }, 500);

    return () => clearInterval(interval);
  }, [isTyping]);


  useEffect(() => {
    const initChatbot = async () => {
      const token = user?.uid || null;

      if (activeTab === 'Tư vấn học tập') {
        const welcomeMessage: Message = {
          id: Date.now(),
          text: 'Xin chào, tôi là EDUchatbot. Tôi có thể giúp gì cho bạn về học tập?',
          sender: 'bot',
        };
        setMessages([welcomeMessage]);

        if (token) {
          try {
            const res = await fetch(`${BASE_URL}ocr/get_all_student_data/`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            const json = await res.json();
            setStudentData(json.students || []);
          } catch (error) {
            console.error('❌ Lỗi khi load studentData:', error);
          }
        }
      } else {
        setMessages([
          {
            id: Date.now(),
            text: 'Xin chào, tôi có thể hỗ trợ bạn các vấn đề về ứng dụng',
            sender: 'bot',
          }
        ]);
      }
    };

    initChatbot();
  }, [activeTab]);

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
  const typingId = -1;
  const handleSendMessage = async (text: string = inputText) => {
    if (text.trim() === '') return;

    const userMessage: Message = {
      id: Date.now(),
      text,
      sender: 'user',
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    if (activeTab === 'Hỗ trợ App') {
      const token = user?.uid || null;
      if (!token) {
        setMessages((prev) => [...prev, {
          id: Date.now() + 2,
          text: '⚠️ Bạn chưa đăng nhập.',
          sender: 'bot'
        }]);
        return;
      }

      setIsTyping(true);
      setMessages((prev) => [...prev, {
        id: typingId,
        text: '🤖 ',
        sender: 'bot'
      }]);

      try {
        const response = await fetch(`${BASE_URL}chatbot/ask_chatbot/`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: text,
            students: [], // gửi mảng rỗng vì tab này không dùng dữ liệu học sinh
          }),
        });

        const data = await response.json();
        const botMessage: Message = {
          id: Date.now() + 1,
          text: data.answer || data.error || 'Không có phản hồi',
          sender: 'bot',
        };
        setMessages((prev) => [
          ...prev.filter((msg) => msg.id !== typingId),
          botMessage
        ]);
      } catch (error) {
        console.error('❌ Lỗi gọi chatbot:', error);
        setMessages((prev) => [
          ...prev.filter((msg) => msg.id !== typingId),
          {
            id: Date.now() + 1,
            text: '⚠️ Lỗi khi gọi chatbot, vui lòng thử lại sau.',
            sender: 'bot'
          }
        ]);
      } finally {
        setIsTyping(false);
      }

      return;
    }

    try {
      const token = user?.uid || null;
      if (!token) {
        setMessages((prev) => [...prev, {
          id: Date.now() + 2,
          text: '⚠️ Bạn chưa đăng nhập.',
          sender: 'bot'
        }]);
        return;
      }

      // ✅ Thêm trạng thái đang nhập
      setIsTyping(true);
      setMessages((prev) => [...prev, {
        id: typingId,
        text: '🤖 ',
        sender: 'bot'
      }]);

      const response = await fetch(`${BASE_URL}chatbot/ask_chatbot/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: text,
          students: studentData,
        }),
      });

      const data = await response.json();
      const botMessage: Message = {
        id: Date.now() + 1,
        text: data.answer || data.error || 'Không có phản hồi',
        sender: 'bot',
      };
      // ✅ Xóa dòng đang nhập và thêm kết quả thực
      setMessages((prev) => [
        ...prev.filter((msg) => msg.id !== typingId),
        botMessage
      ]);
    } catch (error) {
      console.error('❌ Lỗi gọi chatbot:', error);
      setMessages((prev) => [
        ...prev.filter((msg) => msg.id !== typingId),
        {
          id: Date.now() + 1,
          text: '⚠️ Lỗi khi gọi chatbot, vui lòng thử lại sau.',
          sender: 'bot'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
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
                {message.id === typingId
                  ? `${message.text}${typingDots}`
                  : message.text}
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
