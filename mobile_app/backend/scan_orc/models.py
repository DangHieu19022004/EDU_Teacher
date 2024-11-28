from djongo import models


class Receipt(models.Model):
    id = models.AutoField(primary_key=True)  # ID duy nhất
    merchant_name = models.CharField(max_length=255, blank=True, null=True)
    card_last_digits = models.CharField(max_length=4, blank=True, null=True)
    cardholder_name = models.CharField(max_length=255, blank=True, null=True)
    card_type = models.CharField(max_length=50, blank=True, null=True)
    batch_number = models.CharField(max_length=50, blank=True, null=True)
    transaction_date = models.DateTimeField(blank=True, null=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    image_path = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.merchant_name} - {self.card_last_digits} - {self.cardholder_name} - {self.card_type} - {self.batch_number} - {self.transaction_date} - {self.total_amount} - {self.image_path}"
