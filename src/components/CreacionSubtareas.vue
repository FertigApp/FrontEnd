<template>
  <!--  template por de fecto de vue para paginas que no se han implementado-->
  <div >
    <!--    Alerta cuando hay error al crear tareas-->
    <b-alert :show="error" @dismissed="error=!error" class="text-left" variant="danger" dismissible>Error al crear subtarea</b-alert>
    <!--    pop up con formulario para crear tarea-->
    <b-modal id="create-subTask"
             title="Crear Subtarea"
             @ok="ok"
    >
      <!--      template del footer del dialogo de crear tarea-->
      <template #modal-footer="{ ok, cancel}">
        <b-button variant="danger" @click="deleteItem()" v-if="isEdit">
          Eliminar
        </b-button>
        <b-button variant="secondary" @click="cancel()">
          Cancelar
        </b-button>
        <b-button variant="primary" @click="isEdit?save():ok()">
          OK
        </b-button>
      </template>
      <template>
        <form ref="form">
          <!--        Alerta de formulario incompleto-->
          <b-alert :show="incomplete" class="text-left" variant="danger" dismissible>Por favor rellene todos los campos</b-alert>
          <!--      campo para titulo de tarea-->
          <b-form-group
              id="fieldset-title"
              label-cols-sm="4"
              label-cols-lg="3"
              description="Titulo de la subtarea que deseas crear"
              label="Titulo"
              label-for="title"
          ><b-form-input id="title" required v-model="tarea.nombre"></b-form-input>
          </b-form-group>
          <!--      campo para descripcion de tarea-->
          <b-form-group
              id="fieldset-description"
              label-cols-sm="4"
              label-cols-lg="3"
              description="Descripción de la subtarea que deseas crear"
              label="Descripción"
              label-for="description"
          ><b-form-textarea required
                            id="description"
                            rows="3"
                            max-rows="8"
                            v-model="tarea.descripcion"
          ></b-form-textarea>
          </b-form-group>
          <!--      campo para prioridad de tarea-->
          <b-form-group
              id="fieldset-priority"
              label-cols-sm="4"
              label-cols-lg="3"
              description="Prioridad de 1 a 5 de la subtarea"
              label="Prioridad"
              label-for="priority"
          >
            <b-form-input id="priority" v-model="tarea.prioridad" type="range" min="1" max="5"></b-form-input>
          </b-form-group>
          <!--      campos para fecha de finalización-->
          <b-form-group
              id="fieldset-end-date"
              label-cols-sm="4"
              label-cols-lg="3"
              description="Fecha y hora en que la subtarea termina"
              label="Fecha de finalización"
              label-for="end-date, end-time"
          >
            <b-datepicker required id="end-date" value-as-date v-model="tarea.fechaFin" :locale="'es'" placeholder="Ninguna Fecha seleccionada"></b-datepicker>
            <b-form-timepicker required id="end-time" v-model="endHour" placeholder="Ninguna hora seleccionada"></b-form-timepicker>
          </b-form-group>
        </form>
      </template>
    </b-modal>
  </div>
</template>

<script>
import Task from "@/models/Task";
import ListItem from "@/models/ListItem";
import cloneDeep from "lodash/cloneDeep";
//import Routine from "@/models/Routine";

export default {
  name: 'Creacionsubtareas',
  props: {'id': {Type: Number, required: true} },
  data(){
    return{
      //item a editar
      listItem:new ListItem(),
      //tarea que se crea
      tarea:new Task(),
      //campo para guardar la hora de finalizacion
      endHour:null,
      //variable error al crear tarea
      error:false,
      //variable de formulario de creación de tarea incmoleto
      incomplete:false,
      isEdit:false
    }},
  methods:{
    newTask(padre){
      console.log(padre)
      this.$bvModal.show('create-subTask')
      if(!this.error){
        Object.assign(this.$data, this.$options.data())
        this.tarea.prioridad=3
      }
      this.listItem = padre
    },
    deleteItem(){
      this.$store.dispatch("DataModule/deleteSubTask",{tarea: this.tarea, padre: this.listItem}).then(()=> {
        console.log("entro a borrar")
        this.$store.dispatch("DataModule/update")
      })
      this.$bvModal.hide("create-subTask")
    },
    ok(bvModalEvt){
      //evitar que se oculte cuando no estan completos los campos
      if(!this.$refs.form.checkValidity()){
        bvModalEvt.preventDefault()
        this.incomplete=true
      }
      else{
        this.incomplete=false
        //se rellenan los campos que no se muestran en la interfaz
        this.tarea.recordatorio=0
          // metodo de crear tarea
          //se añade las horas a la fecha de finalización
          let h=this.endHour.split(":")
          this.tarea.fechaFin.setHours(h[0],h[1])
            //se llama al user service para crear la tarea
            this.$store.dispatch("DataModule/createSubTask", {tarea: this.tarea, id: this.id, padre: this.listItem}).then(
                ()=>{
                  this.$store.dispatch("DataModule/update") // Luego de la petición, llamar a la función para obtener las tareas
                  this.error=false
                },()=>{
                  this.error=true
                }
            )
        }

    },
    edit(item,padre){
      this.isEdit=true
      this.listItem=padre
      this.tarea=cloneDeep(item)
      this.status=false
      let options = {
        hour: 'numeric', minute: 'numeric', milliseconds:'numeric'
      };

      this.endHour=new Intl.DateTimeFormat( 'es',options).format(new Date(item.fechaFin))
    },
    save(){
      //llamada al store para enviar la request
      this.$store.dispatch('DataModule/editSubTask',{padre: this.listItem, tarea: this.tarea}).then(
          ()=>{
            console.log("entro a guardar cambios")
            this.$bvModal.hide('create-subTask')
            this.$store.dispatch('DataModule/update')
          },
          ()=>{
            this.error=true
            this.message="Error al editar Tarea"
            this.$bvModal.hide('create-subTask')
          }
      )
    }
  }

}
</script>
