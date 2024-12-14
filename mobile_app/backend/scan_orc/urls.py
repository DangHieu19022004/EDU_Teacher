from django.urls import path

from .views import getDataReceipt

urlpatterns = [
    path('saveinfor/', getDataReceipt, name='getDataReceipt')

]

