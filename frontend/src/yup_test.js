const { isValid } = require("date-fns");
const yup = require("yup");

// //{name: '', description: ''}

// const schema = yup.object().shape({
//     name: yup
//         .string()
//         .required(),
//     num: yup.number()
// });

// console.log(schema.cast({name: 'teste', num: "2"}));

// schema
//     .isValid({name: ''})
//     .then(isValid => console.log(isValid));

// // RUN
// // c65f4a47b715:/var/www/frontend# node src/yup_test.js
// // { num: 2, name: 'teste' }
// // false

// schema.validate({name: 'teste', num: "aaaaaa2"})
//     .then((values) => console.log(values))
//     .catch(errors => console.log(errors));

// // { ValidationError: num must be a `number` type, but the final value was: `NaN` (cast from the value `"aaaaaa2"`).
// //     at Object.createError (/var/www/frontend/node_modules/yup/lib/util/createValidation.js:54:21)
// //     at Object.test (/var/www/frontend/node_modules/yup/lib/schema.js:478:76)
// //     at validate (/var/www/frontend/node_modules/yup/lib/util/createValidation.js:71:30)
// //     at runTests (/var/www/frontend/node_modules/yup/lib/util/runTests.js:39:5)
// //     at NumberSchema._validate (/var/www/frontend/node_modules/yup/lib/schema.js:246:27)
// //     at NumberSchema.validate (/var/www/frontend/node_modules/yup/lib/schema.js:271:51)
// //     at /var/www/frontend/node_modules/yup/lib/object.js:182:17
// //     at runTests (/var/www/frontend/node_modules/yup/lib/util/runTests.js:39:5)
// //     at _validate (/var/www/frontend/node_modules/yup/lib/object.js:199:29)
// //     at args (/var/www/frontend/node_modules/yup/lib/util/runTests.js:17:5)
// //   value: { num: NaN, name: 'teste' },
// //   path: 'num',
// //   type: 'typeError',
// //   errors:
// //    [ 'num must be a `number` type, but the final value was: `NaN` (cast from the value `"aaaaaa2"`).' ],
// //   params:
// //    { value: NaN,
// //      originalValue: 'aaaaaa2',
// //      label: undefined,
// //      path: 'num',
// //      type: 'number' },
// //   inner: [],
// //   name: 'ValidationError',
// //   message:
// //    'num must be a `number` type, but the final value was: `NaN` (cast from the value `"aaaaaa2"`).' }
// // false

const columns = [
  {
    name: "id",
    label: "ID",
    width: "30%",
    options: {
      sort: false,
    },
  },
  {
    name: "name",
    label: "Nome",
    width: "43%",
  },
  {
    name: "is_active",
    label: "Ativo?",
    width: "4%",
  },
  {
    name: "created_at",
    label: "Criado em",
    width: "10%",
  },
  {
    name: "actions",
    label: "Ações",
    width: "13%",
  },
];

const schema = yup.object().shape({
  search: yup
    .string()
    .transform((value) => (!value ? undefined : value))
    .default(""),
  pagination: yup.object().shape({
    page: yup
      .number()
      .transform((value) =>
        isNaN(value) || parseInt(value) < 1 ? undefined : value
      )
      .default(1),
    per_page: yup
      .number()
      .transform((value) => (isNaN(value) ? undefined : value))
      .default(15),
  }),
  order: yup.object().shape({
    sort: yup
      .string()
      .nullable()
      .transform((value) => {
        const columnsName = columns
          .filter((column) => !column.options || column.options.sort !== false)
          .map((column) => column.name);
        return columnsName.includes(value) ? value : undefined;
      })
      .default(null),
    dir: yup.string()
      .nullable()
      .transform(value => !value || !['asc', 'desc'].includes(value.toLowerCase()) ? undefined : value)
      .default(null)
  }),
});

console.log(schema.cast({}));

// 756cc8ecebc9:/var/www/frontend# node src/yup_test.js
// { order: { dir: null, sort: null },
//   pagination: { per_page: 15, page: 1 },
//   search: '' }

console.log(schema.cast({
    pagination: {
        page: 'asdasdas'
    }
}));

// 756cc8ecebc9:/var/www/frontend# node src/yup_test.js
// { order: { dir: null, sort: null },
//   pagination: { per_page: 15, page: 1 },
//   search: '' }

