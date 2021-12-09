import * as React from 'react';
import { Box, Button, Checkbox, FormControlLabel, makeStyles, MenuItem, TextField, Theme } from "@material-ui/core";
import { ButtonProps } from "@material-ui/core/Button"
import { useForm } from "react-hook-form";
import { useState, useEffect } from 'react';
import genreHttp from '../../util/http/genre-http';
import categoryHttp from '../../util/http/category-http';
import * as yup from '../../util/vendor/yup';
import { useParams, useHistory } from 'react-router';
import { useSnackbar } from "notistack";

interface Category {
    id: string;
    name: string;
    description: string;
    is_active: boolean;
}

interface Genre {
    id: string;
    name: string;
    is_active: number;
    categories: Category[];
}

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
        .max(255),
    categories_id: yup.array()
        .label('Categorias')
        .required()
});


const Form = () => {

    const classes = useStyles();

    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        errors,
        reset,
        watch
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

    const buttonProps: ButtonProps = {
        className: classes.submit,
        color: 'secondary',
        variant: 'contained',
        disabled: loading
    };

    useEffect(() => {
        register({ name: "is_active" });
        register({ name: "categories_id" })
    }, [register]);

    useEffect(() => {
        if (!id) {
            categoryHttp
                .list<{ data: Category[] }>()
                .then(({ data }) => setCategories(data.data))
            return;
        }
        setLoading(true);

        genreHttp
            .get<{ data: Genre }>(id)
            .then(({ data }) => {
                setGenre(data.data);
                setCategories(data.data.categories);
                const categories_id = data.data.categories.map(category => category.id);
                reset({
                    ...data.data,
                    categories_id
                });
                //console.log(data.data);
            })
            .catch((error) => {
                console.log(error);
                snackBar.enqueueSnackbar(
                    'Não foi possível carregar gênero',
                    { variant: 'error' }
                );
            })
            .finally(() => setLoading(false))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function onSubmit(formData, event) {
        setLoading(true);
        const http = !genre
            ? genreHttp.create(formData)
            : genreHttp.update(genre.id, formData);

        //console.log(event, formData);
        // save & edit
        // save
        http
            .then(({ data }) => {
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
            })
            .catch((error) => {
                console.log(error);
                snackBar.enqueueSnackbar(
                    'Não foi possível salvar gênero',
                    { variant: 'error' }
                );
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
            >
                <MenuItem value="">
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

export default Form;