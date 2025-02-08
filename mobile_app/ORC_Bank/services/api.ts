const apisaveReceipt = "http://192.168.1.10:8000/ocr/saveinfor/";

const apihandleImage = "http://192.168.1.10:8000/raw/recieve_image/";

export const saveReceipt = async (formData : any) => {
    try{
        const response = await fetch(apisaveReceipt, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
            })
            const data = await response.json();
            return data;
    }catch(e){
        console.log(e);
        return null;
    }
}

export const handleImage = async (base64Data : any) => {
    try{
        const response = await fetch(apihandleImage, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              imgPath: `data:image/jpeg;base64,${base64Data}`
            })
          })
          const data = await response.json();
          return data;
    }catch(e){
        console.log(e);
        return null;
    }
}
