import React, { useState } from 'react';
import { View, TextInput, Button, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';

const ChatbotScreen = () => {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: 'teacher', text: input }];
    setMessages(newMessages);

    // Gửi dữ liệu đến API backend
    const res = await fetch('http://192.168.x.x:8000/chatbot/advice/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();

    setMessages([...newMessages, { sender: 'bot', text: data.reply || data.advice || 'Không có phản hồi' }]);
    setInput('');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <View style={styles.container}>
        <ScrollView style={styles.chatContainer}>
          {messages.map((msg, index) => (
            <View
              key={index}
              style={[
                styles.messageBubble,
                msg.sender === 'teacher' ? styles.teacherBubble : styles.botBubble,
              ]}
            >
              <Text style={styles.messageText}>{msg.text}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={styles.inputContainer}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Nhập câu hỏi..."
            style={styles.input}
          />
          <Button title="Gửi" onPress={handleSend} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  chatContainer: { flex: 1, padding: 10 },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    marginVertical: 6,
    borderRadius: 12,
  },
  teacherBubble: {
    backgroundColor: '#d1e7ff',
    alignSelf: 'flex-end',
    borderTopRightRadius: 0,
  },
  botBubble: {
    backgroundColor: '#e2e2e2',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 0,
  },
  messageText: { fontSize: 16 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    marginRight: 10,
    height: 40,
    backgroundColor: '#fff',
  },
});

export default ChatbotScreen;
