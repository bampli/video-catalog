/* eslint-disable no-template-curly-in-string */
import { setLocale } from 'yup';
import { LocaleObject } from 'yup/lib/locale';
//import { addMethod, number, NumberSchema } from 'yup';

const ptBR: LocaleObject = {
  mixed: {
    required: "${path} é requerido",
    notType: "${path} é inválido"
  },
  string: {
    max: "${path} deve ter no máximo ${max} caracteres",
  },
  number: {
    min: "${path} deve ser no mínimo ${min}",
  },
  array: {
    min: "${path} deve ter pelo menos ${min} elemento(s)",
  },
};

setLocale(ptBR);

// Global yup method for number
// addMethod<NumberSchema>(number, 'xpto', function(){
//   return this.test({
//     message: 'error message',
//     test(value) {
//       return true;
//     }
//   })
// })

export * from 'yup';