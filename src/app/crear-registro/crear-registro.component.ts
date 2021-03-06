import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SPServicio } from '../servicios/sp-servicio';
import { Empleado } from '../dominio/empleado';
import { Usuario } from '../dominio/usuario';
import { ItemAddResult } from 'sp-pnp-js';
import { FileAddResult } from 'sp-pnp-js';
import { Router } from '@angular/router';
import { Sede } from '../dominio/sede';
import { Area } from '../dominio/area';
import { Cargo } from '../dominio/cargo';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Grupo } from '../dominio/grupo';



@Component({
  selector: 'app-crear-registro',
  templateUrl: './crear-registro.component.html',
  styleUrls: ['./crear-registro.component.css']
})
export class CrearRegistroComponent implements OnInit {
  empleadoForm: FormGroup;
  ObjUsuarios: [];
  usuarios: Usuario[] = [];
  usuarioActual: Usuario;
  emptyManager: boolean;
  adjuntoHV: any;
  adjuntoCertificado: any;
  adjuntoDiplomas: any;
  adjuntoHVcorporativa: any;
  sede: Sede[] = [];
  area: Area[] = [];
  cargo: Cargo[] = [];
  grupos: Grupo[] = [];
  empleado: Empleado[] = []
  // valorUsuarioPorDefecto: string = "Seleccione";
  dataUsuarios = [
    { value: 'Seleccione', label: 'Seleccione' }
  ];
  counter: number = 0;
  PermisosCrearRegistro: boolean;


  constructor(private fB: FormBuilder, private servicio: SPServicio, private router: Router, public toastr: ToastrManager) { }

  ngOnInit() {
    this.registrarControles();
    this.obtenerUsuarios();
    this.ObtenerUsuarioActual();
  };

  private registrarControles() {
    this.empleadoForm = this.fB.group({
      usuario: ['', Validators.required],
      primerNombre: ['', Validators.required],
      segundoNombre: [''],
      primerApellido: ['', Validators.required],
      segundoApellido: [''],
      numeroDocumento: ['', Validators.required],
      tipoDocumento: [''],
      fechaIngreso: ['', Validators.required],
      fechaSalida: [''],
      tipoContrato: [''],
      terminoContrato: [''],
      cargo: [''],
      salario: [''],
      lugarExpedicion: [''],
      salarioTexto: [''],
      area: [''],
      jefe: ['', Validators.required],
      direccion: [''],
      celular: [''],
      sede: [''],
      extension: [''],
      bono: [''],
      afp: [''],
      universidad: [''],
      carrera: [''],
      contactoEmergencia: [''],
      numeroContactoEmergencia: ['']
    });
    this.emptyManager = true;
  };

  obtenerUsuarios() {
    this.servicio.ObtenerTodosLosUsuarios().subscribe(
      (respuesta) => {
        this.usuarios = Usuario.fromJsonList(respuesta);
        console.log(this.usuarios);
        this.DataSourceUsuarios();
      });
  };

  ObtenerUsuarioActual() {
    this.servicio.ObtenerUsuarioActual().subscribe(
      (Response) => {
        this.usuarioActual = new Usuario(Response.Title, Response.email, Response.Id);
        this.obtenerGrupos();
        this.obtenerArea();
        // console.log(this.usuarioActual.id);
      }, err => {
        console.log('Error obteniendo usuario: ' + err);
      }
    )
  };

  obtenerGrupos() {
    let idUsuario = this.usuarioActual.id;
    this.servicio.ObtenerGruposUsuario(idUsuario).subscribe(
      (respuesta) => {
        this.grupos = Grupo.fromJsonList(respuesta);
        console.log(this.grupos)
        this.verificarPermisos();
        this.obtenerSede();
        this.obtenerCargo();
      }, err => {
        console.log('Error obteniendo grupos de usuario: ' + err);
      }
    )
  };

  verificarPermisos() {
    let existeGrupoCrearEditarPerfilEmpleado = this.grupos.find(x => x.title === "CrearEditarPerfilEmpleado");
    console.log(existeGrupoCrearEditarPerfilEmpleado);
    if (existeGrupoCrearEditarPerfilEmpleado !== undefined) {
      this.PermisosCrearRegistro = true;
    };
  };

  adjuntarHojaDeVida(event) {
    let AdjuntoHojaVida = event.target.files[0];
    if (AdjuntoHojaVida != null) {
      this.adjuntoHV = AdjuntoHojaVida;
      this.agregarHV();
    } else {
      this.adjuntoHV = null;
    };
  };

  adjuntarCertificados(event) {
    let AdjuntoCertificados = event.target.files[0];
    if (AdjuntoCertificados != null) {
      this.adjuntoCertificado = AdjuntoCertificados;
      this.agregarCertificados();
    } else {
      this.adjuntoCertificado = null;
    };
  };

  adjuntarDiplomas(event) {
    let AdjuntoDiplomas = event.target.files[0];
    console.log(AdjuntoDiplomas);
    if (AdjuntoDiplomas != null) {
      this.adjuntoDiplomas = AdjuntoDiplomas;
      this.agregarDiplomas();
    } else {
      this.adjuntoDiplomas = null;
    };
  };

  adjuntarHVcorporativa(event) {
    let AdjuntoHVcorporativa = event.target.files[0];
    if (AdjuntoHVcorporativa !== null) {
      this.adjuntoHVcorporativa = AdjuntoHVcorporativa;
      this.agregarHVCorporativa();
    }
    else {
      this.adjuntarHVcorporativa = null;
    };
  };

  seleccionarUsuario(event) {
    if (event != "Seleccione") {
      this.emptyManager = false;
    } else {
      this.emptyManager = true;
    }
  }

  private DataSourceUsuarios() {
    this.usuarios.forEach(usuario => {
      this.dataUsuarios.push({ value: usuario.id.toString(), label: usuario.nombre });
    });
  };

  obtenerSede() {
    this.servicio.obtenerSedes().subscribe(
      (respuesta) => {
        this.sede = Sede.fromJsonList(respuesta);
      });
  };

  obtenerArea() {
    this.servicio.obtenerArea().subscribe(
      (respuesta) => {
        this.area = Area.fromJsonList(respuesta);
      });
  };

  obtenerCargo() {
    this.servicio.obtenerCargo().subscribe(
      (respuesta) => {
        this.cargo = Cargo.fromJsonList(respuesta);
      });
  };

  validarVacios() {
    this.counter = 0

    if (this.empleadoForm.get('usuario').value === "") {
      this.MensajeAdvertencia('El campo "Usuario" es requerido');
      this.counter++;
    }

    if (this.empleadoForm.get('primerNombre').value === "") {
      this.MensajeAdvertencia('El campo "Primer Nombre" es requerido');
      this.counter++;
    }

    if (this.empleadoForm.get('primerApellido').value === "") {
      this.MensajeAdvertencia('El campo "Primer Apellido" es requerido');
      this.counter++;
    }

    if (this.empleadoForm.get('numeroDocumento').value === "") {
      this.MensajeAdvertencia('El campo "Número de documento" es requerido');
      this.counter++;
    }

    if(this.empleadoForm.get('jefe').value === "") {
      this.MensajeAdvertencia('El campo Jefe es requerido');
      this.counter++;
    }

    if(this.empleadoForm.get('fechaIngreso').value === "") {
      this.MensajeAdvertencia('El campo Fecha de ingreso es requerido');
      this.counter++;
    }

    if (this.counter > 0) {
      this.MensajeAdvertencia('Por favor diligencie los campos requeridos');
      return false;
    }
  }

  cancelar() {
    this.router.navigate(['/'])
  }

  onSubmit() {
    this.validarVacios();
    console.log(this.empleadoForm)
    let usuario = this.empleadoForm.get('usuario').value;
    console.log(usuario);
    let primerNombre = this.empleadoForm.get('primerNombre').value;
    let segundoNombre = this.empleadoForm.get('segundoNombre').value;
    let primerApellido = this.empleadoForm.get('primerApellido').value;
    let segundoApellido = this.empleadoForm.get('segundoApellido').value;
    let numeroDocumento = this.empleadoForm.get('numeroDocumento').value;
    let tipoDocumento = this.empleadoForm.get('tipoDocumento').value;
    let fechaIngreso = this.empleadoForm.get('fechaIngreso').value;
    let fechaSalida = this.empleadoForm.get('fechaSalida').value;
    let tipoContrato = this.empleadoForm.get('tipoContrato').value;
    let terminoContrato = this.empleadoForm.get('terminoContrato').value;
    let cargo = this.empleadoForm.get('cargo').value;
    let salario = this.empleadoForm.get('salario').value;
    let luagarExpedicion = this.empleadoForm.get('lugarExpedicion').value;
    let salarioTexto = this.empleadoForm.get('salarioTexto').value;
    let area = this.empleadoForm.get('area').value;
    let jefe = this.empleadoForm.get('jefe').value;
    let direccion = this.empleadoForm.get('direccion').value;
    let celular = this.empleadoForm.get('celular').value;
    let sede = this.empleadoForm.get('sede').value;
    let extension = this.empleadoForm.get('extension').value;
    let bono = this.empleadoForm.get('bono').value;
    let afp = this.empleadoForm.get('afp').value;
    let universidad = this.empleadoForm.get('universidad').value;
    let carrera = this.empleadoForm.get('carrera').value;
    let contactoEmergencia = this.empleadoForm.get('contactoEmergencia').value;
    let numeroContactoEmergencia = this.empleadoForm.get('numeroContactoEmergencia').value;
    let objEmpleado;
    let salarioIntegral;
    let SumaSalarioIntegral;
    let salarioInteger = parseInt(salario, 10);
    let bonoInteger = parseInt(bono, 10);
    let afpInteger = parseInt(afp, 10);
    let nombreEmpleado;
    let objHojaDeVida;
    let salarioString = `${salario}`;
    let bonoString = `${bono}`;
    let afpString = `${afp}`;



    if (tipoContrato === 'Integral') {
      SumaSalarioIntegral = salarioInteger + bonoInteger + afpInteger;
      salarioIntegral = `${SumaSalarioIntegral}`
    }
    else {
      salarioIntegral = "";
    }

    // if (tipoContrato === 'Integral' && (bono === "" || afp === "")) {
    //   this.MensajeAdvertencia('El campo Bono y Afp son requeridos cuando el tipo de contrato es Integral');
    //   return false;
    // }

    // if (terminoContrato === 'Fijo' && fechaSalida === "") {
    //   this.MensajeAdvertencia('Debe especificar la fecha de salida para contrato a término fijo');
    //   return false;
    // }

    if (terminoContrato === 'Fijo') {
      fechaSalida = fechaSalida;
    }
    else {
      fechaSalida = null;
    }

    nombreEmpleado = primerNombre + ' ' + segundoNombre + ' ' + primerApellido + ' ' + segundoApellido

    objEmpleado = {
      usuarioId: usuario,
      Title: nombreEmpleado.toUpperCase(),
      PrimerNombre: primerNombre,
      SegundoNombre: segundoNombre,
      PrimerApellido: primerApellido,
      SegundoApellido: segundoApellido,
      NumeroDocumento: numeroDocumento,
      TipoDocumento: tipoDocumento,
      FechaIngreso: fechaIngreso,
      FechaSalida: fechaSalida,
      TipoContrato: tipoContrato,
      Cargo: cargo,
      Salario: salarioString,
      lugarExpedicion: luagarExpedicion,
      salarioTexto: salarioTexto,
      Area: area,
      JefeId: jefe,
      Direccion: direccion,
      Celular: celular,
      Sede: sede,
      Extension: extension,
      Bonos: bonoString,
      AFP: afpString,
      TerminoContrato: terminoContrato,
      Carrera: carrera,
      Universidad: universidad,
      SalarioIntegral: salarioIntegral,
      ContactoEmergencia: contactoEmergencia,
      NumeroContactoEmergencia: numeroContactoEmergencia,
      IdUsuario: usuario
    }

    objHojaDeVida = {
      TipoDocumento: 'Hoja de vida',
      Empleado: nombreEmpleado,
      Title: this.adjuntoHV
    }

    if (this.empleadoForm.invalid) {
      this.MensajeAdvertencia('hay campos vacíos')
    }
    else {
      this.servicio.AgregarInfoEmpleado(objEmpleado).then(
        (result) => {
          this.MensajeExitoso("El registro se ha creado con éxito")
          setTimeout(() => {
            this.router.navigate(['/'])
          }, 2000);
        }
      ).catch(
        err => {
          this.MensajeError('error al guardar la solicitud')
        }
      );
    }
  }

  MensajeExitoso(mensaje: string) {
    this.toastr.successToastr(mensaje, 'Confirmado!');
  }

  MensajeError(mensaje: string) {
    this.toastr.errorToastr(mensaje, 'Oops!');
  }

  MensajeAdvertencia(mensaje: string) {
    this.toastr.warningToastr(mensaje, 'Validación!');
  }

  MensajeInfo(mensaje: string) {
    this.toastr.infoToastr(mensaje, 'Info');
  }

  async agregarHV() {
    let obj = {
      TipoDocumento: "Hoja de vida",
      EmpleadoId: this.empleado[0].id
    }
    await this.servicio.AgregarHojaDeVida(this.adjuntoHV.name, this.adjuntoHV).then(
      f => {
        f.file.getItem().then(item => {
          let idDocumento = item.Id;
          this.actualizarMetadatosHV(obj, idDocumento);
          // item.update(obj);               
        })
      }
    ).catch(
      (error) => {
        this.MensajeError('No se pudo cargar el archivo. Intente de nuevo')
      }
    );
  };

  async agregarCertificados() {
    let obj = {
      TipoDocumento: "Certificado",
      EmpleadoId: this.empleado[0].id
    }
    await this.servicio.AgregarCertificado(this.adjuntoCertificado.name, this.adjuntoCertificado).then(
      f => {
        f.file.getItem().then(item => {
          let idDocumento = item.Id;
          this.actualizarMetadatosCert(obj, idDocumento);
          // item.update(obj);               
        })
      }
    ).catch(
      (error) => {
        this.MensajeError('No se pudo cargar el archivo. Intente de nuevo')
      }
    );
  }

  async agregarDiplomas() {
    let obj = {
      TipoDocumento: "Diploma",
      EmpleadoId: this.empleado[0].id
    }
    await this.servicio.AgregarDiploma(this.adjuntoDiplomas.name, this.adjuntoDiplomas).then(
      f => {
        f.file.getItem().then(item => {
          let idDocumento = item.Id;
          this.actualizarMetadatoDiploma(obj, idDocumento);
          // item.update(obj);               
        })
      }
    ).catch(
      (error) => {
        this.MensajeError('No se pudo cargar el archivo. Intente de nuevo')
      }
    );
  }

  async agregarHVCorporativa() {
    let obj = {
      TipoDocumento: "Hoja de vida corporativa",
      EmpleadoId: this.empleado[0].id
    }
    await this.servicio.AgregarHojaCorporativa(this.adjuntoHVcorporativa.name, this.adjuntoHVcorporativa).then(
      f => {
        f.file.getItem().then(item => {
          let idDocumento = item.Id;
          this.actualizarMetadatoHVCorporativa(obj, idDocumento);
          // item.update(obj);               
        })
      }
    ).catch(
      (error) => {
        this.MensajeError('No se pudo cargar el archivo. Intente de nuevo')
      }
    );
  }

  actualizarMetadatosHV(obj, idDocumento) {
    this.servicio.ActualizarMetaDatosHV(obj, idDocumento).then(
      (res) => {
        this.MensajeInfo('La hoja de vida se cargó correctamente')
      }
    )
      .catch(
        (error) => {
          console.log(error);
        }
      )
  };

  actualizarMetadatosCert(obj, idDocumento) {
    this.servicio.ActualizarMetaDatosCertificado(obj, idDocumento).then(
      (res) => {
        this.MensajeInfo('El certificado se cargó correctamente')
      }
    )
      .catch(
        (error) => {
          console.log(error);
        }
      )
  }

  actualizarMetadatoDiploma(obj, idDocumento) {
    this.servicio.ActualizarMetaDatosDiploma(obj, idDocumento).then(
      (res) => {
        this.MensajeInfo('El Diploma se cargó correctamente')
      }
    )
      .catch(
        (error) => {
          console.log(error);
        }
      )
  }

  actualizarMetadatoHVCorporativa(obj, idDocumento) {
    this.servicio.ActualizarMetaDatosHVCorporativa(obj, idDocumento).then(
      (res) => {
        this.MensajeInfo('La hoja de vida corporativa se cargó correctamente')
      }
    )
      .catch(
        (error) => {
          console.log(error);
        }
      )
  }


  // pruebaArchivo(){
  //   console.log(this.adjuntoHV);
  //   this.servicio.AgregarHojaDeVida("Archivo1", this.adjuntoHV).then(
  //     (res: FileAddResult)=>{
  //       debugger
  //         let pp = res;
  //     }
  //   ).catch(
  //     (error)=>{
  //       debugger
  //       console.error(error);
  //     }

  //   )
  // }
}
