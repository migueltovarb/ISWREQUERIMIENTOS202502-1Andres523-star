__author_="AndresfelipeBolañosCabrera"
__license_= "GLP"
__vercion_="1.8.8"
__email_ = "andres.bolanosca@campusucc.edu.co" 
##############################################################

import _csv

archivo = "contactos.csv"

################# Cargar contactos del archivo que si existan
nombre_archivo = input("Ingrese el nombre del archivo de contactos (ej: contactos.txt): ")
def cargar_contactos():
    contactos = []
    lector = _csv.DictReader()
    for fila in lector:
                contactos.append(fila)
    return contactos
################## guardar los archivos de contactos

# Guardar contactos en el archivo
def guardar_contactos(contactos):
    with open(archivo, 'w', newline='', encoding='utf-8') as f:
        cargar_contactos = ['nombre', 'telefono', 'correo', 'cargo']
      
################## Registrar un nuevo contacto
nombre = input("Introduce el nombre del nuevo contacto: ")
telefono = input("Teléfono: ")
correo = input("Correo: ")
cargo = input("Cargo: ") 

contactos = cargar_contactos()
################## Validar que el correo no se repita
from codecs import register
import re
def buscar_contacto(nombre_buscar, lista_contactos):
  """
  Busca un contacto en una lista de diccionarios.
  """
  encontrado = False
  for contacto in lista_contactos:
    if contacto["nombre"] == nombre_buscar:
      encontrado = True
      print(f"Contacto encontrado:")
      print(f"  Nombre: {contacto['nombre']}")
      print(f"  Teléfono: {contacto['telefono']}")
      break # Sale del bucle una vez que se encuentra el contacto

  if not encontrado:
    print(f"No se encontró ningún contacto con el nombre '{nombre_buscar}'.")


################ Patrón de expresión regular para validar la estructura del correo
def validar_formato_correo(correo):
    patron = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if re.match(patron, correo):
        print(f"El formato de {correo} es correcto.")
        return True
    else:
        print(f"El formato de {correo} es incorrecto.")
        return False

################## Ejemplo de uso
correo_electronico = input("Ingresa un correo electrónico: ")
if validar_formato_correo(correo_electronico): 
################## correcto, puedes continuar con otros pasos
    pass
# Listar todos los contactos
def listar():
    contactos = cargar_contactos()
    if not contactos:
        print("No hay contactos registrados.")
    else:
        print("\n--- LISTA DE CONTACTOS ---")
        for c in contactos:
            print(f"{c['nombre']} | {c['telefono']} | {c['correo']} | {c['cargo']}")

# Eliminar contacto por correo
def eliminar():
    correo = input("Correo del contacto a eliminar: ")
    contactos = cargar_contactos()
    nuevos = [c for c in contactos if c['correo'] != correo]

    if len(contactos) == len(nuevos):
        print("No se encontró el contacto.")
    else:
        guardar_contactos(nuevos)
        print("Contacto eliminado correctamente.")

# Menú principal
def menu():
    while True:
        print("--- MENÚ CONNECTME ---")
        print("1. Registrar contacto")
        print("2. Buscar contacto")
        print("3. Listar contactos")
        print("4. Eliminar contacto")
        print("5. Salir")
        opcion = input("Seleccione una opción: ")

        if opcion == "1":
            register()
        elif opcion == "2":
            listar()
        elif opcion == "3":
            eliminar()
        elif opcion == "4":
            print("Saliendo...")
            break
        elif opcion == "4":
            buscar_contacto
            break
        else:
            print("Opción inválida, intente de nuevo.")

# Iniciar programa
menu()
