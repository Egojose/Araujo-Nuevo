import { Component, OnInit } from '@angular/core';
import { SPServicio } from './servicios/sp-servicio';
import { Router } from '@angular/router';
import { Usuario } from './dominio/usuario';
import { Grupo } from './dominio/grupo';
import { ToastrManager } from 'ng6-toastr-notifications';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
 
  title = 'crear-editar-empleado';
  usuario: Usuario;
  nombreUsuario: string;
  idUsuario: number;
  grupos: Grupo[] = [];
  PermisosCrearRegistro: boolean;

  public ngOnInit() {
   this.ObtenerUsuarioActual();
   this.verificarPermisos();
  }
  
  constructor(private servicio: SPServicio, private router: Router, public toastr: ToastrManager) {
   this.PermisosCrearRegistro = false;

  }

  MensajeExitoso() {
    this.toastr.successToastr('This is success toast.', 'Success!');
  }

  MensajeError() {
    this.toastr.errorToastr('This is error toast.', 'Oops!');
  }

  MensajeAdvertencia() {
    this.toastr.warningToastr('This is warning toast.', 'Alert!');
  }

  MensajeInfo() {
    this.toastr.infoToastr('This is info toast.', 'Info');
  }



  showToast(position: any = 'top-left') {
    this.toastr.infoToastr('This is a toast.', 'Toast', {
      position: position
    });
  }

  verificarPermisos() {
    let existeGrupoCrearEditarPerfilEmpleado = this.grupos.find(x => x.title === "CrearEditarPerfilEmpleado");
    if(existeGrupoCrearEditarPerfilEmpleado !== null) {
      this.PermisosCrearRegistro = true;
    } 
  }


  ObtenerUsuarioActual() {
    this.servicio.ObtenerUsuarioActual().subscribe(
      (respuesta) => {
        this.usuario = new Usuario(respuesta.Title, respuesta.email, respuesta.Id);
        this.nombreUsuario = this.usuario.nombre;
        this.idUsuario = this.usuario.id;
        sessionStorage.setItem('usuario', JSON.stringify(this.usuario));
        this.servicio.ObtenerGruposUsuario(this.usuario.id).subscribe(
          (respuesta) => {
            this.grupos = Grupo.fromJsonList(respuesta);
          }, err => {
            console.log('Error obteniendo grupos de usuario: ' + err);
          }
        )
      }, err => {
        console.log('Error obteniendo usuario: ' + err);
      }
    )
  }
}
