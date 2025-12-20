// function hello(data) {
//     var s = data

//     setTimeout(() => {console.log(s);
//     }, 1000)

//     s = 20

//     setTimeout(() => {
//         console.log(s);
//     })
// }

// hello('g')

async function l() {
    const data = new Promise((resolve) => {
        resolve(10)
    }).then(json => console.log(json)
    )
    return data
}

console.log(l());

