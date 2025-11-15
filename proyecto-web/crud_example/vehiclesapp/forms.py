from django import forms
from .models import Vehicle

class VehicleForm(forms.ModelForm):
    class Meta:
        model = Vehicle
        fields = ['numero_placa', 'marca', 'modelo', 'color']
        labels = {
            'numero_placa': 'Número de placa',
            'marca': 'Marca del vehículo',
            'modelo': 'Modelo del vehículo', 
            'color': 'Color del vehículo',
        }