import * as React from 'react';
import { Box, Button, Checkbox, FormControlLabel, makeStyles, TextField, Theme } from "@material-ui/core";
import { ButtonProps } from "@material-ui/core/Button"
import { useForm } from "react-hook-form";
import categoryHttp from '../../util/http/category-http';
import * as yup from '../../util/vendor/yup';
import { useParams, useHistory } from 'react-router';
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

    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        errors,
        reset,
        watch
    } = useForm<{name, is_active}>({
        validationSchema,
        defaultValues: {
            is_active: true
        }
    });

    const history = useHistory();
    const { id } = useParams<{ id:string }>();
    const [category, setCategory] = useState<{ id: string } | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const buttonProps: ButtonProps = {
        className: classes.submit,
        color: 'secondary',
        variant: 'contained',
        disabled: loading
        //size: "medium"    // this is the default
    };

    useEffect(() => {
        register({ name: "is_active" })
    }, [register]);

    useEffect(() => {
        if (!id) {
            return;
        }
        setLoading(true);

        categoryHttp
            .get(id)
            .then(({ data }) => {
                setCategory(data.data)
                reset(data.data);
                console.log(data.data);
            })
            .finally(() => setLoading(false))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function onSubmit(formData, event) {
        setLoading(true);
        const http = !category
            ? categoryHttp.create(formData)
            : categoryHttp.update(category.id, formData);

        console.log(event);
        // save & edit
        // save
        http
            .then(({ data }) => {
                setTimeout( () => {     //avoid no-op warning about side effect
                    event
                    ? ( //save & edit
                        id
                            ? history.replace(`/categories/${data.data.id}/edit`)   //categories/<id>/edit
                            : history.push(`/categories/${data.data.id}/edit`)      //categories/create
                    )
                    : ( //categories
                        history.push('/categories')
                    )
                })
            })
            .finally(() => setLoading(false));
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
                disabled={loading}
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
                disabled={loading}
                InputLabelProps={{ shrink: true }}
            />
            <FormControlLabel
                disabled={loading}
                control={
                    <Checkbox
                        name="is_active"
                        color={"primary"}
                        //inputRef={register} // with manual control you should disable here
                        onChange={
                            () => setValue('is_active', !getValues()['is_active'])
                        }
                        checked={watch('is_active')}
                    />
                }
                label={'Ativo?'}
                labelPlacement={'end'}
            />
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