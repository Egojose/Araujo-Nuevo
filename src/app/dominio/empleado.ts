export class Empleado {
    constructor() {}
    

    public static fromJson(element: any) {
        return new Empleado()
    }

    public static fromJsonList(elements: any) {
        var list = [];
        for (var i = 0; i < elements.length; i++) {
            list.push(this.fromJson(elements[i]));
        }
        return list;
    }
}