import requests

url = "http://35.225.133.162:8001/correct"
data = {"text": "cäc mon"}

response = requests.post(url, json=data)
print(response.json())
