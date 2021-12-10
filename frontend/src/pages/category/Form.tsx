import * as React from 'react';
import { Checkbox, FormControlLabel, TextField } from "@material-ui/core";
import { useForm } from "react-hook-form";
import categoryHttp from '../../util/http/category-http';
import * as yup from '../../util/vendor/yup';
import { useParams, useHistory } from 'react-router';
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { Category } from "../../util/models";
import SubmitActions from '../../components/SubmitActions';
import {DefaultForm} from "../../components/DefaultForm";

const validationSchema = yup.object().shape({
    name: yup.string()
        .label('Nome')
        .required()
        .max(255)
});

export const Form = () => {
    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        errors,
        reset,
        watch,
        triggerValidation
    } = useForm<{ name, is_active }>({
        validationSchema,
        defaultValues: {
            is_active: true
        }
    });

    const snackBar = useSnackbar();
    const history = useHistory();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState<boolean>(false);
    const [category, setCategory] = useState<Category | null>(null);

    useEffect(() => {
        if (!id) {
            return;
        }
        let isSubscribed = true;
        //using iife: immediate invoked function expression
        //instead of: async function getCategory() {
        //avoid call: getCategory();
        (async () => {
            setLoading(true);
            try {
                const { data } = await categoryHttp.get(id);
                if (isSubscribed) {
                    setCategory(data.data);
                    reset(data.data);
                    //console.log(data.data);
                }
            } catch (error) {
                console.error(error);
                snackBar.enqueueSnackbar(
                    'Não foi possível carregar categoria',
                    { variant: 'error' }
                );
            } finally {
                setLoading(false);
            }
        })();

        return () => {
            isSubscribed = false;
        }

        // setLoading(true);
        // categoryHttp
        //     .get(id)
        //     .then(({ data }) => {
        //         setCategory(data.data);
        //         reset(data.data);
        //         //console.log(data.data);
        //     })
        //     .catch((error) => {
        //         console.log(error);
        //         snackBar.enqueueSnackbar(
        //             'Não foi possível carregar categoria',
        //             { variant: 'error' }
        //         );
        //     })
        //     .finally(() => setLoading(false))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        register({ name: "is_active" })
    }, [register]);

    async function onSubmit(formData, event) {
        setLoading(true);
        try {
            const http = !category
                ? categoryHttp.create(formData)
                : categoryHttp.update(category.id, formData);
            const { data } = await http;
            snackBar.enqueueSnackbar(
                'Categoria salva com sucesso',
                { variant: 'success' }
            );
            setTimeout(() => {     //avoid no-op warning about side effect
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
        } catch (error) {
            console.error(error);
            snackBar.enqueueSnackbar(
                'Não foi possível salvar categoria',
                { variant: 'error' }
            );
        } finally {
            setLoading(false)
        }

        //console.log(event);
        // save & edit
        // save
        // http
        //     .then(({ data }) => {
        //         snackBar.enqueueSnackbar(
        //             'Categoria salva com sucesso',
        //             { variant: 'success' }
        //         );
        //         setTimeout(() => {     //avoid no-op warning about side effect
        //             event
        //                 ? ( //save & edit
        //                     id
        //                         ? history.replace(`/categories/${data.data.id}/edit`)   //categories/<id>/edit
        //                         : history.push(`/categories/${data.data.id}/edit`)      //categories/create
        //                 )
        //                 : ( //categories
        //                     history.push('/categories')
        //                 )
        //         })
        //     })
        //     .catch((error) => {
        //         console.log(error);
        //         snackBar.enqueueSnackbar(
        //             'Não foi possível salvar categoria',
        //             { variant: 'error' }
        //         );
        //     })
        //     .finally(() => setLoading(false));
    }
    //console.log(errors);
    return (
        <DefaultForm GridItemProps={{xs:12, md:6}} onSubmit={handleSubmit(onSubmit)}>
            <TextField
                name="name"
                label="Nome"
                fullWidth
                variant={"outlined"}
                inputRef={register}
                disabled={loading}
                error={errors.name !== undefined}
                helperText={errors.name && errors.name.message}
                InputLabelProps={{ shrink: true }}
            />
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
                        onChange={
                            () => setValue('is_active', !getValues()['is_active'])
                        }
                        checked={watch('is_active')}
                    />
                }
                label={'Ativo?'}
                labelPlacement={'end'}
            />
            <SubmitActions
                disabledButtons={loading}
                handleSave={() =>
                    triggerValidation().then(isValid => {
                        isValid && onSubmit(getValues(), null)
                    })
                }
            />
        </DefaultForm>
    );
}
