import * as React from 'react';
import { Box, Button, Checkbox, makeStyles, MenuItem, TextField, Theme } from "@material-ui/core";
import { ButtonProps } from "@material-ui/core/Button"
import { useForm } from "react-hook-form";
import { useState, useEffect } from 'react';
import categoryHttp from '../../util/http/category-http';
import genreHttp from '../../util/http/genre-http';

const useStyles = makeStyles((theme: Theme) => {
    return {
        submit: {
            margin: theme.spacing(1)
        }
    }
});

const Form = () => {

    const classes = useStyles();
    const buttonProps: ButtonProps = {
        className: classes.submit,
        color: 'secondary',
        variant: 'contained'
    };

    const [categories, setCategories] = useState<any[]>([]);
    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        watch
    } = useForm<{ name, categories_id }>({
        defaultValues: {
            categories_id: []
        }
    });

    useEffect(() => {
        register({ name: "categories_id" })
    }, [register]);

    useEffect(() => {
        categoryHttp
            .list()
            .then(({ data }) => setCategories(data.data))
    }, []);

    function onSubmit(formData, event) {
        console.log(event);
        // save & edit
        // save
        genreHttp
            .create(formData)
            .then((response) => console.log(response));
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
                name="name"
                label="Nome"
                fullWidth
                variant={"outlined"}
                inputRef={register}     // register => react-hook applies to field by name
            />
            <TextField
                select
                name="categories_id"
                value={watch('categories_id')}
                label="Categorias"
                margin={"normal"}
                variant={"outlined"}
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
            <Checkbox
                name="is_active"
                inputRef={register}
                defaultChecked
            />
            Ativo?
            <Box dir={"rtl"}>
                <Button {...buttonProps} onClick={() => onSubmit(getValues(), null)}>Salvar</Button>
                <Button {...buttonProps} type="submit">Salvar e continuar editando</Button>
            </Box>
        </form>
    );
}

export default Form;