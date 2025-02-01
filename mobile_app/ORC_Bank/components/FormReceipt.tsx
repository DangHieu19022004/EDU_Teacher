import React, { useEffect, useState } from "react";
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

const FormReceipt = ({ data }: FormReceiptProps) => {

  const api = "http://192.168.1.10:8000/ocr/saveinfor/";


  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());

  const [formData, setFormData] = useState({
    merchant_name:"",
    card_last_digits: "",
    cardholder_name: "",
    card_type: "",
    batch_number:"",
    transaction_date: "",
    total_amount: "",
  });

  useEffect(() => {
    if (data) {
      setFormData({
        merchant_name: data.merchant_name || "",
        card_last_digits: data.card_last_digits || "",
        cardholder_name: data.cardholder_name || "",
        card_type: data.card_type || "",
        batch_number: data.batch_number || "",
        transaction_date: data.transaction_date || "",
        total_amount: data.total_amount || "",
      });
      if (data.transaction_date) {
        const dateTime = new Date(data.transaction_date);
        setDate(dateTime);
        setTime(dateTime);
      }
    }else{
      resetInput();
    }

    // const dateTime = new Date(data.transaction_date);
    // setDate(dateTime);
    // setTime(dateTime);

  }, [data]);


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


  const resetInput = () => {
    setFormData({
      merchant_name: "",
      card_last_digits: "",
      cardholder_name: "",
      card_type: "",
      batch_number: "",
      transaction_date: "",
      total_amount: "",
    })
  }

  const handleSubmit = async () => {
    if(formData.merchant_name === "" || formData.card_last_digits === "" || formData.cardholder_name === "" || formData.card_type === "" || formData.batch_number === "" || formData.transaction_date === "" || formData.total_amount === ""){
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    try{
      const response = await fetch(api, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })
      const data = await response.json();
      if(response.ok){
        alert(data.message || "Success");
        resetInput();
      }else{
        alert(data.message || "Something went wrong");
      }
    }catch(e){
      console.log(e);
    }
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

          <View className="flex-row items-center space-x-2">
            {/* Type hour */}
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 bg-white w-20 text-center"
              placeholder="Giờ"
              keyboardType="numeric"
              maxLength={2}
              value={time.getHours().toString().padStart(2, "0")}
              onChangeText={(text) => {
                const hours = Math.min(23, Math.max(0, parseInt(text) || 0));
                const updatedTime = new Date(time);
                updatedTime.setHours(hours);
                setTime(updatedTime);
                setFormData({
                  ...formData,
                  transaction_date: updatedTime.toISOString(),
                });
              }}
            />

            <Text> : </Text>

            {/* Type minute */}
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 bg-white w-20 text-center"
              placeholder="Phút"
              keyboardType="numeric"
              maxLength={2}
              value={time.getMinutes().toString().padStart(2, "0")}
              onChangeText={(text) => {
                const minutes = Math.min(59, Math.max(0, parseInt(text) || 0));
                const updatedTime = new Date(time);
                updatedTime.setMinutes(minutes);
                setTime(updatedTime);
                setFormData({
                  ...formData,
                  transaction_date: updatedTime.toISOString(),
                });
              }}
            />

            <Text> : </Text>

            {/* Type seconds */}
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 bg-white w-20 text-center"
              placeholder="Giây"
              keyboardType="numeric"
              maxLength={2}
              value={time.getSeconds().toString().padStart(2, "0")}
              onChangeText={(text) => {
                const seconds = Math.min(59, Math.max(0, parseInt(text) || 0));
                const updatedTime = new Date(time);
                updatedTime.setSeconds(seconds);
                setTime(updatedTime);
                setFormData({
                  ...formData,
                  transaction_date: updatedTime.toISOString(),
                });
              }}
            />
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
