import React, { useEffect, useState } from "react";
import { View, Text, Image } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useRoute } from "@react-navigation/native";
import * as FileSystem from 'expo-file-system';
import FormReceipt from "@/components/FormReceipt";

export default function BillScreen() {
  const api = 'http://192.168.1.10:8000/raw/recieve_image/';
  // Lấy tham số từ route
  const route = useRoute<any>();
  const { photoUri } = route.params;

  interface dataSend {
      merchant_name: any;
      card_last_digits:  any;
      cardholder_name:  any;
      card_type:  any;
      batch_number: any;
      transaction_date:  any;
      total_amount:  any;
  }

  const [datasend, setDataSend] = useState<dataSend>({
    merchant_name: "",
    card_last_digits: "",
    cardholder_name: "",
    card_type: "",
    batch_number: "",
    transaction_date: "",
    total_amount: "",
  });

  const [imageSent, setImageSent] = useState(false);
  const [error, setError] = useState("");



  const covertImageToBase64 = async (uri: string) => {
    try{
      const base64Data = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64
      });
      return base64Data;
    }catch(e){
      console.log(e);
    }
  }

  const sendImage = async () => {
    if(photoUri && !imageSent){
      const base64Data = await covertImageToBase64(photoUri);

      if(base64Data){
        try{
          const response = await fetch(api, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              imgPath: `data:image/jpeg;base64,${base64Data}`
            })
          })
          const data = await response.json();
          if(response.ok){
            processData(data['result']);
            console.log(data);
          }else{
            setError(data.message || "Something went wrong");
          }
          setImageSent(true);
        }catch(e){
          console.log(e);
        }
      }
    }
  }

  useEffect(() => {
    if (photoUri && !imageSent) {
      sendImage();
    }
  }, [photoUri, imageSent]);

  const processData = (datarc: any) => {
    // Xử lý ngày và giờ
    const dateTimeString = datarc.datetime || "";
    const dateTimeParts = dateTimeString.split(" GIO: ");

    if (dateTimeParts.length === 2) {
      const datePart = dateTimeParts[0]; // "23/10/2024"
      const timePart = dateTimeParts[1]; // "15:19:25"

      // Tạo đối tượng Date từ chuỗi ngày và giờ
      const [day, month, year] = datePart.split("/").map(Number);
      const [hours, minutes, seconds] = timePart.split(":").map(Number);

      // Tạo một đối tượng Date mới
      const transactionDate = new Date(year, month - 1, day, hours, minutes, seconds);

      // Cập nhật dữ liệu form
      setDataSend({
        merchant_name: datarc.namemerchine || "",
        card_last_digits: datarc.cardnumber || "",
        cardholder_name: datarc.namecustomer || "",
        card_type: datarc.typecard || "",
        batch_number: datarc.batch || "",
        transaction_date: transactionDate, // Set giá trị ngày giờ đã chuyển đổi
        total_amount: datarc.cost,
      });
      console.log(datasend);
    } else {
      // Nếu chuỗi datetime không đúng định dạng, có thể log lỗi hoặc xử lý theo cách khác
      console.log("Invalid datetime format:", datarc.datetime);
    }
  }

  return (
    <View className="flex-1">
      {/* <Text>{JSON.stringify(datasend)}</Text> */}
      <FormReceipt data={datasend} />
    </View>
  );
}
