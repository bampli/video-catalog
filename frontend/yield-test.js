function* test(){
    // const acoes = yield capturarAcoes();
    // if(acoes == 'add_upload_files'){
    //    axios.get()
    // }
    console.log('luiz carlos');
    // //logica
    // //logica
    // yield axios.get();
    yield "saga";
    // yield "saga";
    // yield "saga";
    // yield* test1();
    // yield "saga";
    // yield "saga";
    // yield "saga";
}

const iterator = test();

console.log(iterator.next());
console.log(iterator.next());
//console.log(iterator.next());
