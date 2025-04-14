import requests

url = "http://34.69.155.77:8001/correct"
data = {"text": "cäc mon"}

response = requests.post(url, json=data)
print(response.json())
