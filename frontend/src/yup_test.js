const { isValid } = require('date-fns');
const yup = require('yup');

//{name: '', description: ''}

const schema = yup.object().shape({
    name: yup
        .string()
        .required(),
    num: yup.number()
});

console.log(schema.cast({name: 'teste', num: "2"}));

schema
    .isValid({name: ''})
    .then(isValid => console.log(isValid));

// RUN
// c65f4a47b715:/var/www/frontend# node src/yup_test.js
// { num: 2, name: 'teste' }
// false

schema.validate({name: 'teste', num: "aaaaaa2"})
    .then((values) => console.log(values))
    .catch(errors => console.log(errors));

// { ValidationError: num must be a `number` type, but the final value was: `NaN` (cast from the value `"aaaaaa2"`).
//     at Object.createError (/var/www/frontend/node_modules/yup/lib/util/createValidation.js:54:21)
//     at Object.test (/var/www/frontend/node_modules/yup/lib/schema.js:478:76)
//     at validate (/var/www/frontend/node_modules/yup/lib/util/createValidation.js:71:30)
//     at runTests (/var/www/frontend/node_modules/yup/lib/util/runTests.js:39:5)
//     at NumberSchema._validate (/var/www/frontend/node_modules/yup/lib/schema.js:246:27)
//     at NumberSchema.validate (/var/www/frontend/node_modules/yup/lib/schema.js:271:51)
//     at /var/www/frontend/node_modules/yup/lib/object.js:182:17
//     at runTests (/var/www/frontend/node_modules/yup/lib/util/runTests.js:39:5)
//     at _validate (/var/www/frontend/node_modules/yup/lib/object.js:199:29)
//     at args (/var/www/frontend/node_modules/yup/lib/util/runTests.js:17:5)
//   value: { num: NaN, name: 'teste' },
//   path: 'num',
//   type: 'typeError',
//   errors:
//    [ 'num must be a `number` type, but the final value was: `NaN` (cast from the value `"aaaaaa2"`).' ],
//   params:
//    { value: NaN,
//      originalValue: 'aaaaaa2',
//      label: undefined,
//      path: 'num',
//      type: 'number' },
//   inner: [],
//   name: 'ValidationError',
//   message:
//    'num must be a `number` type, but the final value was: `NaN` (cast from the value `"aaaaaa2"`).' }
// false