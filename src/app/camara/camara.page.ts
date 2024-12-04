import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-camara',
  templateUrl: './camara.page.html',
  styleUrls: ['./camara.page.scss'],
})
export class CamaraPage implements OnInit {
  scanResult = '';
  asignaturaId: string = ''; // Variable para almacenar el ID de la asignatura
  asignaturaName: string = ''; // Variable para almacenar el nombre de la asignatura
  lastScanTimestamp: number = 0; // Timestamp de la última vez que se escaneó un QR

  constructor(
    private modalController: ModalController,
    private toastController: ToastController,
    private alertController: AlertController,
    private router: Router,
    private httpClient: HttpClient
  ) { }

  ngOnInit() {
    this.startScanner();
  }

  startScanner() {
    const html5QrCode = new Html5QrcodeScanner("qr-reader", {
      fps: 10,
      qrbox: 250
    }, false); // Se debe dejar false para evitar detalles de depuración

    html5QrCode.render((qrCodeMessage) => {
      this.scanResult = qrCodeMessage;
      this.asignaturaId = this.extractAsignaturaId(qrCodeMessage); // Extraer el ID de asignatura del QR
      this.getAsignaturaName(this.asignaturaId);  // Obtener el nombre de la asignatura
      this.checkIfAssistanceCanBeRegistered(this.asignaturaId);  // Verificar si se puede registrar la asistencia
      html5QrCode.clear();  // Detenemos el escáner después de obtener el resultado
    }, (errorMessage) => {
      // Si ocurre un error en el escaneo, lo registramos en la consola
      console.log(errorMessage);
    });
  }

  // Método para extraer el ID de la asignatura desde el mensaje del QR
  extractAsignaturaId(qrData: string): string {
    const urlParts = qrData.split('/');
    return urlParts[urlParts.length - 1]; // Devuelve el último segmento como el ID de la asignatura
  }

// Método para obtener el nombre de la asignatura y asegurarse de que se haya completado
getAsignaturaName(asignaturaId: string): Promise<void> {
  console.log("Obteniendo asignatura con ID:", asignaturaId);  // Verifica el ID que llega
  return new Promise((resolve, reject) => {
    this.httpClient.get<any>(`https://my-json-server.typicode.com/dedcodex27800/registrapp/asignaturas/${asignaturaId}`).subscribe(
      (asignatura) => {
        console.log("Respuesta de la API:", asignatura);  // Verifica lo que llega de la API
        if (asignatura && asignatura.nombre) {
          this.asignaturaName = asignatura.nombre;  // Asigna el nombre de la asignatura
          console.log("Asignatura encontrada:", this.asignaturaName);
          resolve(); // Resuelve la promesa cuando el nombre se obtiene correctamente
        } else {
          this.mostrarToast('Asignatura no encontrada');
          reject('Asignatura no encontrada'); // Rechaza la promesa si no se encuentra la asignatura
        }
      },
      (error) => {
        console.error('Error al obtener el nombre de la asignatura:', error);
        this.mostrarToast('Error al obtener la asignatura');
        reject(error); // Rechaza la promesa en caso de error
      }
    );
  });
}
  
// Método para verificar si la asistencia se puede registrar
checkIfAssistanceCanBeRegistered(asignaturaId: string) {
  const lastTimestamp = localStorage.getItem(`lastScanTimestamp_${asignaturaId}`);

  if (lastTimestamp) {
    const currentTimestamp = new Date().getTime();
    const timeDifference = (currentTimestamp - Number(lastTimestamp)) / (1000 * 60 * 60); // Convertir a horas

    if (timeDifference < 2) {
      // Si la diferencia es menor a 2 horas, mostrar un mensaje de error
      this.mostrarToast('No puedes registrar la misma clase en menos de 2 horas.');
      return;
    }
  }

  // Primero obtener el nombre de la asignatura antes de intentar registrar la asistencia
  this.getAsignaturaName(asignaturaId).then(() => {
    // Si el nombre está disponible, se procede a registrar la asistencia
    this.registrarAsistencia(asignaturaId, this.asignaturaName);
  }).catch((error: any) => {
    // Si hubo un error al obtener el nombre de la asignatura, no se registra la asistencia
    console.error('No se pudo obtener el nombre de la asignatura:', error);
  });
}

  registrarAsistencia(asignaturaId: string, asignaturaName: string) {
    const estudianteId = localStorage.getItem('userId'); // Obtener el ID del estudiante desde el almacenamiento local
    if (estudianteId) {
      // Verifica si el nombre de la asignatura está disponible antes de registrar la asistencia
      if (!asignaturaName) {
        console.error('El nombre de la asignatura no está disponible. No se puede registrar la asistencia.');
        this.mostrarToast('No se pudo registrar la asistencia debido a un error.');
        return;
      }

      const nuevaAsistencia = {
        estudianteId: estudianteId,
        asignaturaId: asignaturaId,
        asignaturaName: asignaturaName, // Ahora también guardamos el nombre de la asignatura
        fecha: new Date().toISOString(), // Fecha actual en formato ISO
        estado: 'Presente'
      };

      console.log('Registrando asistencia con la siguiente información:', nuevaAsistencia); // Verifica los datos antes de enviarlos

      // Enviar la asistencia a la base de datos
      this.httpClient.post('https://my-json-server.typicode.com/dedcodex27800/registrapp/asistencias', nuevaAsistencia).subscribe(
        async (response: any) => {
          // Al registrar la asistencia con éxito, navegar a la página de asistencias
          this.router.navigate(['/asistencias']);
          this.mostrarToast('Asistencia registrada exitosamente');
          // Guardar el timestamp de la última vez que se registró la asistencia
          localStorage.setItem(`lastScanTimestamp_${asignaturaId}`, new Date().getTime().toString());
        },
        (error: any) => {
          // Si ocurre un error, mostrar un mensaje de error
          console.error('Error al registrar la asistencia:', error);
          this.mostrarToast('Error al registrar la asistencia');
        }
      );
    }
  }

  // Mostrar un mensaje tipo toast
  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      color: 'success',
      duration: 1200,
      position: 'middle',
    });
    await toast.present();
  }
}
