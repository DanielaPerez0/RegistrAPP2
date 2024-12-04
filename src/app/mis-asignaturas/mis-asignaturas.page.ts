import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-mis-asignaturas',
  templateUrl: './mis-asignaturas.page.html',
  styleUrls: ['./mis-asignaturas.page.scss'],
})
export class MisAsignaturasPage implements OnInit {
  userId: string | null = null;
  userType: string | null = null;
  asignaturas: any[] = [];
  userAsignaturas: any[] = [];
  qrCodeData: string | null = null;

  constructor(
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.userType = localStorage.getItem('userType');
    this.userId = localStorage.getItem('userId');

    if (!this.userType || !this.userId) {
      this.router.navigate(['/login']);
    } else {
      this.loadAsignaturas();
    }
  }

  loadAsignaturas() {
    this.http.get<any[]>('https://my-json-server.typicode.com/dedcodex27800/registrapp/asignaturas').subscribe(
      (asignaturas) => {
        this.asignaturas = asignaturas;
        this.filterUserAsignaturas();
      },
      (error) => {
        console.error('Error al cargar las asignaturas:', error);
      }
    );
  }

  filterUserAsignaturas() {
    this.userAsignaturas = [];

    if (this.userType === 'estudiante') {
      const estudianteId = Number(this.userId);
      this.userAsignaturas = this.asignaturas.filter(asignatura =>
        asignatura.estudiantesId.includes(estudianteId)
      );
    } else if (this.userType === 'docente') {
      const docenteId = Number(this.userId);
      this.userAsignaturas = this.asignaturas.filter(asignatura =>
        asignatura.docenteId === docenteId
      );
    }

    this.userAsignaturas = this.userAsignaturas.map(asignatura => ({ ...asignatura, qrCodeData: '' }));
  }

  async generarQr(asignatura: any) {
    // Verificar clases previas para la asignatura
    this.http.get<any[]>(`https://my-json-server.typicode.com/dedcodex27800/registrapp/clasesDictadas?asignaturaId=${asignatura.id}`).subscribe(
      async (clases) => {
        // Filtrar clases de la misma asignatura
        const clasesFiltradas = clases.filter(clase => clase.asignaturaId === asignatura.id);

        // Obtener la fecha y hora de la clase más reciente
        const ultimaClase = clasesFiltradas.reduce((latest, current) => {
          const currentDate = new Date(current.fecha);
          const latestDate = new Date(latest.fecha);
          return currentDate > latestDate ? current : latest;
        }, { fecha: '' });

        // Si hay una clase registrada, verificar la diferencia de tiempo
        if (ultimaClase.fecha) {
          const ultimaFecha = new Date(ultimaClase.fecha);
          const fechaActual = new Date();

          // Calcular la diferencia de tiempo en horas
          const diferenciaHoras = (fechaActual.getTime() - ultimaFecha.getTime()) / (1000 * 3600);

          if (diferenciaHoras < 2) {
            this.mostrarToast('No se pueden registrar dos clases en menos de 2 horas.');
            return; // Salir de la función si no se cumple la condición
          }
        }

        // Si pasa la verificación de tiempo, proceder con la generación del QR y el registro de la clase
        const alert = await this.alertController.create({
          header: 'Confirmación',
          message: 'Al generar un código QR, se registrará una clase dictada, ¿desea continuar?',
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel',
              handler: () => {
                console.log('Generación de QR cancelada');
              },
            },
            {
              text: 'Sí',
              handler: () => {
                // Generar el QR y asignarlo a la asignatura específica
                asignatura.qrCodeData = `https://my-json-server.typicode.com/dedcodex27800/registrapp/asistencia/${asignatura.id}`;

                // Registrar la clase en la base de datos
                const nuevaClase = {
                  asignaturaNombre: asignatura.nombre,
                  asignaturaId: asignatura.id,
                  docenteId: this.userId,
                  fecha: new Date().toISOString() // Fecha y hora actual en formato ISO
                };

                this.http.post('https://my-json-server.typicode.com/dedcodex27800/registrapp/clasesDictadas', nuevaClase).subscribe(
                  (response) => {
                    console.log('Clase registrada exitosamente:', response);
                    this.mostrarToast('Clase registrada y QR generado.');
                  },
                  (error) => {
                    console.error('Error al registrar la clase:', error);
                    this.mostrarToast('Error al registrar la clase.');
                  }
                );
              },
            },
          ],
        });

        await alert.present();
      },
      (error) => {
        console.error('Error al obtener las clases registradas:', error);
      }
    );
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      color: "success",
      duration: 1200,
      position: 'middle',
    });
    await toast.present();
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
