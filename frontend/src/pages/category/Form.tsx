import * as React from 'react';
import { Box, Button, Checkbox, makeStyles, TextField, Theme } from "@material-ui/core";
import { ButtonProps } from "@material-ui/core/Button"
import { useForm } from "react-hook-form";
import categoryHttp from '../../util/http/category-http';
import * as yup from '../../util/vendor/yup';
import { useParams } from 'react-router';
import { useEffect, useState } from "react";

const useStyles = makeStyles((theme: Theme) => {
    return {
        submit: {
            margin: theme.spacing(1)
        }
    }
});

const validationSchema = yup.object().shape({
    name: yup.string()
        .label('Nome')
        .required()
        .max(255)
});

export const Form = () => {

    const classes = useStyles();

    const buttonProps: ButtonProps = {
        className: classes.submit,
        color: 'secondary',
        variant: 'contained'
        //size: "medium"    // this is the default
    };

    const { register, handleSubmit, getValues, errors, reset } = useForm({
        validationSchema,
        defaultValues: {
            name: '',       // added here to avoid error!
            is_active: true
        }
    });

    const { id } = useParams<{ id }>();
    const [category, setCategory] = useState<{ id: string } | null>(null);

    useEffect(() => {
        if (!id) {
            return;
        }

        categoryHttp
            .get(id)
            .then(({ data }) => {
                setCategory(data.data)
                reset(data.data);
            })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function onSubmit(formData, event) {
        const http = !category
            ? categoryHttp.create(formData)
            : categoryHttp.update(category.id, formData);

        console.log(event);
        // save & edit
        // save
        http
            .then((response) => console.log(response));
    }

    //console.log(errors);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
                name="name"
                label="Nome"
                fullWidth
                variant={"outlined"}
                inputRef={register}
                // inputRef={register({
                //     required: "O campo nome é requerido",
                //     maxLength: {
                //         value: 2,
                //         message: 'O máximo caracteres é 2'
                //     }
                // })}
                error={errors.name !== undefined}
                helperText={errors.name && errors.name.message}
                InputLabelProps={{ shrink: true }}
            />
            {/* {
                errors.name && errors.name.type === 'required' &&
                (<p>{errors.name.message} </p>)
            } */}
            <TextField
                name="description"
                label="Descrição"
                multiline
                rows="4"
                fullWidth
                variant={"outlined"}
                margin={"normal"}
                inputRef={register}
                InputLabelProps={{ shrink: true }}
            />
            <Checkbox
                name="is_active"
                color={"primary"}
                inputRef={register}
                defaultChecked
            />
            Ativo?
            <Box dir={"rtl"}>
                <Button
                    color={"primary"}
                    {...buttonProps}
                    onClick={() => onSubmit(getValues(), null)}
                >
                    Salvar
                </Button>
                <Button
                    color={"primary"}
                    {...buttonProps}
                    type="submit"
                >
                    Salvar e continuar editando
                </Button>
            </Box>
        </form>
    );
}

//export default Form;