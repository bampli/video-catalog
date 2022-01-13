/* eslint-disable no-template-curly-in-string */
import { setLocale } from 'yup';
import { LocaleObject } from 'yup/lib/locale';

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
};

setLocale(ptBR);

export * from 'yup';