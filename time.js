

class Data {
    #hello;
    constructor(hello) {
        this.#hello = hello
    }

    async helloMethod(data = '') {
        return data + this.#hello
    }
}


const intstance = new Data('hello')
const data = await new  Promise((resolve) => {resolve(intstance.helloMethod('hello'))}).catch((error) => console.error(error))
console.log(data);



