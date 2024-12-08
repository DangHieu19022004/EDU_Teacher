import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import RNDateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

interface FormReceiptProps {
  data?: any;
}

const FormReceipt = ({data} : FormReceiptProps) => {
  const [formData, setFormData] = useState({
    merchant_name: "",
    card_last_digits: "",
    cardholder_name: "",
    card_type: "",
    batch_number: "",
    transaction_date: "",
    total_amount: "",
  });

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());

  const setnDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      setDate(selectedDate);
      setFormData({
        ...formData,
        transaction_date: selectedDate.toISOString(),
      });
    }
  };

  const setTimeHandler = (event: DateTimePickerEvent, selectedTime?: Date) => {
    if (selectedTime) {
      setTime(selectedTime);
      const updatedDate = new Date(date);
      updatedDate.setHours(selectedTime.getHours());
      updatedDate.setMinutes(selectedTime.getMinutes());
      updatedDate.setSeconds(selectedTime.getSeconds());
      setFormData({
        ...formData,
        transaction_date: updatedDate.toISOString(),
      });
    }
  };

  const handleSubmit = () => {
    console.log("Submitted Data:", formData);
  };

  return (
    <ScrollView>
      <View className="flex-1 px-4 py-4 ">
        <Text className="text-3xl  font-bold mb-4">Thông tin hóa đơn</Text>

        {/* Name Input */}
        <View className="w-full mb-4">
          <Text className="text-lg font-semibold mb-2">Tên máy</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
            placeholder="Nhập tên đại lý"
            value={formData.merchant_name}
            onChangeText={(text) =>
              setFormData({ ...formData, merchant_name: text })
            }
          />
        </View>

        {/* Email Input */}
        <View className="w-full mb-6">
          <Text className="text-lg font-semibold mb-2">4 số cuối thẻ</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
            placeholder="Nhập 4 số cuối thẻ ngân hàng / CARD"
            keyboardType="numeric"
            value={formData.card_last_digits}
            onChangeText={(text) =>
              setFormData({ ...formData, card_last_digits: text })
            }
          />
        </View>

        {/* Name card holder Input */}
        <View className="w-full mb-6">
          <Text className="text-lg font-semibold mb-2">Tên khách hàng</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
            placeholder="Nhập tên khách hàng / NAME"
            value={formData.cardholder_name}
            onChangeText={(text) =>
              setFormData({ ...formData, cardholder_name: text })
            }
          />
        </View>

        {/* Card type Input */}
        <View className="w-full mb-6">
          <Text className="text-lg font-semibold mb-2">Loại thẻ</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
            placeholder="Nhập loại thẻ / CARD TYPE"
            value={formData.card_type}
            onChangeText={(text) =>
              setFormData({ ...formData, card_type: text })
            }
          />
        </View>

        {/* Batch number Input */}
        <View className="w-full mb-6">
          <Text className="text-lg font-semibold mb-2">Số lô</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
            placeholder="Nhập số lô / BATCH NUMBER"
            keyboardType="numeric"
            value={formData.batch_number}
            onChangeText={(text) =>
              setFormData({ ...formData, batch_number: text })
            }
          />
        </View>

        {/* Transaction date Input */}
        <View className="w-full mb-6">
          <Text className="text-lg font-semibold mb-2">Ngày giao dịch</Text>

          <View className="border border-gray-300 rounded-lg px-4 py-3 bg-white">
            {Platform.OS === "android" ? (
              <TouchableOpacity
                onPress={() =>
                  DateTimePickerAndroid.open({
                    value: date,
                    onChange: setnDate,
                  })
                }
              >
                <Text>{date.toDateString()}</Text>
              </TouchableOpacity>
            ) : (
              <RNDateTimePicker
                value={date}
                mode="time"
                display="spinner"
                onChange={setnDate}
              />
            )}
          </View>
        </View>

        {/* Transaction time Input */}
        <View className="w-full mb-6">
          <Text className="text-lg font-semibold mb-2">Giờ giao dịch</Text>

          <View className="border border-gray-300 rounded-lg px-4 py-3 bg-white">
            {Platform.OS === "android" ? (
              <TouchableOpacity
                onPress={() =>
                  DateTimePickerAndroid.open({
                    value: time,
                    onChange: setTimeHandler,
                    mode: "time",
                  })
                }
              >
                <Text>{time.toLocaleTimeString()}</Text>
              </TouchableOpacity>
            ) : (
              <RNDateTimePicker
                value={time}
                mode="time"
                display="spinner"
                onChange={setTimeHandler}
              />
            )}
          </View>
        </View>

        {/* Total amount Input */}
        <View className="w-full mb-6">
          <Text className="text-lg font-semibold mb-2">Tổng số tiền</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
            placeholder="Nhập tổng số tiền / TOTAL AMOUNT"
            value={formData.total_amount}
            onChangeText={(text) =>
              setFormData({ ...formData, total_amount: text })
            }
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className="bg-blue-500 rounded-lg w-full py-4"
          onPress={handleSubmit}
        >
          <Text className="text-white text-center text-lg font-bold">
            Lưu thông tin
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default FormReceipt;
