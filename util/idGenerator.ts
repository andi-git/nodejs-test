export class IdGenerator {

    private static s4():string {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    public static guid():string {
        let id:string = "";
        let first:boolean = true;
        for (let i:number = 0; i < 8; i++) {
            if (first === false) {
                id += '-';
            }
            id += IdGenerator.s4();
            first = false;
        }
        return id;
    }
}