
import ListItem from "@/models/LitstItem";
export default class TEvent extends ListItem{
    //modelo de evento para enviar a backend
    constructor(id,title,description,priority,startDate,endDate,repetitionString, etiqueta,recordatorio) {
        super(id,title,description,priority,startDate,endDate,etiqueta,0,recordatorio)
        this.recurrencia=repetitionString
    }

}