import * as React from 'react';
import { Checkbox, FormControlLabel, MenuItem, TextField } from "@material-ui/core";
import { useForm } from "react-hook-form";
import { useState, useEffect } from 'react';
import genreHttp from '../../util/http/genre-http';
import categoryHttp from '../../util/http/category-http';
import * as yup from '../../util/vendor/yup';
import { useParams, useHistory } from 'react-router';
import { useSnackbar } from "notistack";
import { Category, Genre } from "../../util/models";
import SubmitActions from '../../components/SubmitActions';
import {DefaultForm} from "../../components/DefaultForm";

const validationSchema = yup.object().shape({
    name: yup.string()
        .label('Nome')
        .required()
        .max(255),
    categories_id: yup.array()
        .label('Categorias')
        .required()
});


const Form = () => {
    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        errors,
        reset,
        watch,
        triggerValidation
    } = useForm<{ name, is_active, categories_id }>({
        validationSchema,
        defaultValues: {
            is_active: true,
            categories_id: []
        }
    });

    const snackBar = useSnackbar();
    const history = useHistory();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState<boolean>(false);
    const [genre, setGenre] = useState<Genre | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        let isSubscribed = true;
        (async () => {    //iife: Immediately Invoked Function Expression 
            setLoading(true);
            const promises = [categoryHttp.list({queryParams: {all: ''}})];
            if (id) {
                promises.push(genreHttp.get(id));
            }
            try {
                const [categoriesResponse, genreResponse] = await Promise.all(promises);
                if (isSubscribed) {
                    setCategories(categoriesResponse.data.data);
                    if (id) {
                        setGenre(genreResponse.data.data);
                        const categories_id = genreResponse.data.data.categories.map(category => category.id);
                        reset({
                            ...genreResponse.data.data,
                            categories_id //: categories_id
                        })
                    }
                }
            } catch (error) {
                console.error(error);
                snackBar.enqueueSnackbar(
                    'Não foi possível carregar as informações',
                    { variant: 'error' }
                );
            } finally {
                setLoading(false);
            }
        })();

        return () => {
            isSubscribed = false;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        register({ name: "is_active" });
        register({ name: "categories_id" })
    }, [register]);

    async function onSubmit(formData, event) {
        setLoading(true);
        try {
            const http = !genre
                ? genreHttp.create(formData)
                : genreHttp.update(genre.id, formData);
            const { data } = await http;
            snackBar.enqueueSnackbar(
                'Gênero salvo com sucesso',
                { variant: 'success' }
            );
            setTimeout(() => {     //avoid no-op warning about side effect
                event
                    ? ( //save & edit
                        id
                            ? history.replace(`/genres/${data.data.id}/edit`)   //genres/<id>/edit
                            : history.push(`/genres/${data.data.id}/edit`)      //genres/create
                    )
                    : ( //genres
                        history.push('/genres')
                    )
            })
        } catch (error) {
            console.error(error);
            snackBar.enqueueSnackbar(
                'Não foi possível salvar gênero',
                { variant: 'error' }
            );
        } finally {
            setLoading(false);
        }
    }
    //console.log(errors);
    return (
        <DefaultForm GridItemProps={{xs:12, md:6}} onSubmit={handleSubmit(onSubmit)}>
            <TextField
                name="name"
                label="Nome"
                fullWidth
                variant={"outlined"}
                inputRef={register}     // register => react-hook applies to field by name
                disabled={loading}
                error={errors.name !== undefined}
                helperText={errors.name && errors.name.message}
                InputLabelProps={{ shrink: true }}
            />
            <TextField
                select
                name="categories_id"
                value={watch('categories_id')}
                label="Categorias"
                margin={"normal"}
                variant={"outlined"}
                disabled={loading}
                fullWidth
                onChange={(e) => {
                    setValue('categories_id', e.target.value, true);
                }}
                SelectProps={{
                    multiple: true
                }}
                error={errors.categories_id !== undefined}
                helperText={errors.categories_id && errors.categories_id.message}
                InputLabelProps={{ shrink: true }}
            >
                <MenuItem value="" disabled>
                    <em>Selecione Categorias</em>
                </MenuItem>
                {
                    categories.map(
                        (category, key) => (
                            <MenuItem key={key} value={category.id}>{category.name}</MenuItem>
                        )
                    )
                }
            </TextField>
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

export default Form;