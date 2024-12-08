import React, { useEffect, useState } from "react";
import { View, Text, Image } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useRoute } from "@react-navigation/native";
import * as FileSystem from 'expo-file-system';
import FormReceipt from "@/components/FormReceipt";

export default function BillScreen() {
  // const api = 'http://192.168.1.10:8000/raw/recieve_image/';
  // // Lấy tham số từ route
  // const route = useRoute<any>();
  // const { photoUri } = route.params;

  // const [imageData, setImageData] = useState(null);
  // const [imageSent, setImageSent] = useState(false);
  // const [error, setError] = useState("");

  // const covertImageToBase64 = async (uri: string) => {
  //   try{
  //     const base64Data = await FileSystem.readAsStringAsync(uri, {
  //       encoding: FileSystem.EncodingType.Base64
  //     });
  //     return base64Data;
  //   }catch(e){
  //     console.log(e);
  //   }
  // }

  // const sendImage = async () => {
  //   if(photoUri && !imageSent){
  //     const base64Data = await covertImageToBase64(photoUri);

  //     if(base64Data){
  //       try{
  //         const response = await fetch(api, {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json"
  //           },
  //           body: JSON.stringify({
  //             imgPath: `data:image/jpeg;base64,${base64Data}`
  //           })
  //         })
  //         const data = await response.json();
  //         if(response.ok){
  //           setImageData(data['result']);
  //           console.log(data);
  //         }else{
  //           setError(data.message || "Something went wrong");
  //         }
  //         setImageSent(true);
  //       }catch(e){
  //         console.log(e);
  //       }
  //     }
  //   }
  // }

  // useEffect(() => {
  //   if (photoUri && !imageSent) {
  //     sendImage();
  //   }
  // }, [photoUri, imageSent]);
  return (
    <View className="flex-1">
      <FormReceipt />
    </View>
  );
}
