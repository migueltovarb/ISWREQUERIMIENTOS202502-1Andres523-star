from django.db import models

class Vehicle(models.Model):
    COLOR_CHOICES = [
        ('Rojo', 'Rojo'),
        ('Azul', 'Azul'),
        ('Verde', 'Verde'),
        ('Negro', 'Negro'),
        ('Blanco', 'Blanco'),
        ('Gris', 'Gris'),
        ('Plateado', 'Plateado'),
    ]
    
    numero_placa = models.CharField(max_length=10, verbose_name='Número de placa')
    marca = models.CharField(max_length=100, verbose_name='Marca del vehículo')
    modelo = models.CharField(max_length=100, verbose_name='Modelo del vehículo') 
    color = models.CharField(max_length=50, choices=COLOR_CHOICES, verbose_name='Color del vehículo')
    
    def __str__(self):
        return f"{self.marca} {self.modelo} - {self.numero_placa}"