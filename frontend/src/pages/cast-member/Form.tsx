import * as React from 'react';
import { Box, Button, FormControl, FormControlLabel, FormHelperText, FormLabel, makeStyles, Radio, RadioGroup, TextField, Theme } from "@material-ui/core";
import { ButtonProps } from "@material-ui/core/Button"
import { useForm } from "react-hook-form";
import castMemberHttp from '../../util/http/cast-member-http';
import * as yup from '../../util/vendor/yup';
import { useParams, useHistory } from 'react-router';
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";

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
    type: yup.number()
        .label('Tipo')
        .required()
});

export const Form = () => {
    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        errors,
        reset,
        watch
    } = useForm<{ name, type }>({
        validationSchema,
        // defaultValues: {
        // }
    });

    const classes = useStyles();
    const snackBar = useSnackbar();
    const history = useHistory();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState<boolean>(false);
    const [castMember, setCastMember] = useState<{ id: string } | null>(null);

    const buttonProps: ButtonProps = {
        className: classes.submit,
        color: 'secondary',
        variant: 'contained',
        disabled: loading
    };

    useEffect(() => {
        if (!id) {
            return;
        }
        (async () => {    //iife
            setLoading(true);
            try {
                const { data } = await castMemberHttp.get(id);
                setCastMember(data.data)
                reset(data.data);
                //console.log(data.data);
            } catch (error) {
                console.error(error);
                snackBar.enqueueSnackbar(
                    'Não foi possível carregar membro de elenco',
                    { variant: 'error' }
                );
            } finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        register({ name: "type" })
    }, [register]);

    async function onSubmit(formData, event) {
        setLoading(true);
        try {
            const http = !castMember
                ? castMemberHttp.create(formData)
                : castMemberHttp.update(castMember.id, formData);
            const { data } = await http;
            snackBar.enqueueSnackbar(
                'Membro de elenco salvo com sucesso',
                { variant: 'success' }
            );
            setTimeout(() => {     //avoid no-op warning about side effect
                event
                    ? ( //save & edit
                        id
                            ? history.replace(`/cast-members/${data.data.id}/edit`)   //cast_members/<id>/edit
                            : history.push(`/cast-members/${data.data.id}/edit`)      //cast_members/create
                    )
                    : ( //cast_members
                        history.push('/cast-members')
                    )
            });
        } catch (error) {
            console.log(error);
            snackBar.enqueueSnackbar(
                'Não foi possível salvar membro de elenco',
                { variant: 'error' }
            );
        } finally {
            setLoading(false);
        }
        //console.log(event);
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
            <FormControl
                margin={"normal"}
                error={errors.type !== undefined}
                disabled={loading}
            >
                <FormLabel component="legend">Tipo</FormLabel>
                <RadioGroup
                    name="type"
                    onChange={(e) => {
                        setValue('type', parseInt(e.target.value));
                    }}
                    value={watch('type') + ""} // GRANDE MACETE: CONVERTE PARA STRING & EVITA ERRO!
                >
                    <FormControlLabel value="1" control={<Radio color={"primary"} />} label="Diretor" />
                    <FormControlLabel value="2" control={<Radio color={"primary"} />} label="Ator" />
                </RadioGroup>
                {
                    errors.type && <FormHelperText id="type-helper-text">{errors.type.message}</FormHelperText>
                }
            </FormControl>
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
        </form >
    );
}
