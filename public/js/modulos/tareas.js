import Swal from 'sweetalert2';
import axios from 'axios';
import { actualizarAvance } from '../funciones/avance';

//Tecnica de delegation util cuando hay un listado de elementos
const tareas = document.querySelector('.listado-pendientes');

if(tareas) {
    tareas.addEventListener('click', e => {
        if(e.target.classList.contains('fa-check-circle')){
            const icono = e.target;
            const idTarea = icono.parentElement.parentElement.dataset.tarea;

            //request hacia /tares/:id
            const url = `${location.origin}/tareas/${idTarea}`;

            axios.patch(url, {idTarea})
                .then(function(respuesta){
                    if(respuesta.status === 200){
                        icono.classList.toggle('completo');

                        actualizarAvance();
                    }
                })
        }

        if(e.target.classList.contains('fa-trash')){
            const tareaHTML = e.target.parentElement.parentElement,
                  idTarea = tareaHTML.dataset.tarea;
                  
                  Swal.fire({
                    title: 'Deseas borrar esta tarea?',
                    text: "Una tarea eliminada no se puede recuperar",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Si, Borrar', 
                    cancelButtonText: 'No, Cancelar'
                  }).then((result) => {
                    if (result.value) {
                        const url = `${location.origin}/tareas/${idTarea}`;

                        //Enviar el delete por axios
                        axios.delete(url, { params: { idTarea } })
                            .then(function(respuesta) {
                                //Eliminar nodo de la vista
                                if(respuesta.status === 200){
                                    tareaHTML.parentElement.removeChild(tareaHTML);

                                    //Opcional alerta
                                    Swal.fire(
                                        'Tarea Eliminada',
                                        respuesta.data,
                                        'success'
                                    )

                                    actualizarAvance();
                                }
                            });
                        }
                  })
        }
    });
}
export default tareas;