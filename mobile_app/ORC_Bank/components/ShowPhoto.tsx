import React from "react";
import { View, Image, Text } from "react-native";

const ShowPhoto = ({ route }: any) => {
  const { photoUri } = route.params;

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-bold mb-4">Ảnh vừa chụp</Text>
      <Image
        source={{ uri: photoUri }}
        style={{ width: 300, height: 400, borderRadius: 10 }}
      />
    </View>
  );
};

export default ShowPhoto;
