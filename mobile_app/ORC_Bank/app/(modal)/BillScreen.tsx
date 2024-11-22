import React from "react";
import { View, Text, Image } from "react-native";
import { useRoute } from "@react-navigation/native";

export default function BillScreen() {
  // Lấy tham số từ route
  const route = useRoute<any>();
  const { photoUri } = route.params;
  return (
    <View>   
      <Image
        source={{ uri: photoUri }}
        className="size-full object-contain"
      />
    </View>
  );
}
