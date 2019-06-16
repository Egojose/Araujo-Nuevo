export class Documentos{

    constructor(public title: string, public id: number) {}

    public static fromJson(element: any) {
        return new Documentos(element.Title, element.Id);
    }

    public static fromJsonList(elements: any) {
        var list = [];
        for (var i = 0; i < elements.length; i++) {
            list.push(this.fromJson(elements[i]));
        }
        return list;
    }
}