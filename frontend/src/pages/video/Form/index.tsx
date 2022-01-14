import * as React from 'react';
import { Checkbox, FormControlLabel, Grid, TextField, Typography, useMediaQuery, useTheme } from "@material-ui/core";
import { useForm } from "react-hook-form";
import { useState, useEffect } from 'react';
import videoHttp from '../../../util/http/video-http';
import * as yup from '../../../util/vendor/yup';
import { useParams, useHistory } from 'react-router';
import { useSnackbar } from "notistack";
import { Video } from "../../../util/models";
import SubmitActions from '../../../components/SubmitActions';
import { DefaultForm } from "../../../components/DefaultForm";
import RatingField from './RatingField';

const validationSchema = yup.object().shape({
    title: yup.string()
        .label('Título')
        .required()
        .max(255),
    description: yup.string()
        .label('Sinopse')
        .required(),
    year_launched: yup.number()
        .label('Ano de lançamento')
        .required().min(1), // original backend added min:1 rule
    duration: yup.number()
        .label('Duração')
        .required().min(1), // original backend added min:1 rule
    rating: yup.string()
        .label('Classificação')
        .required(),
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
    } = useForm<{ title, description, year_launched, rating, duration }>({
        validationSchema,
        defaultValues: {
        }
    });

    const snackBar = useSnackbar();
    const history = useHistory();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState<boolean>(false);
    const [video, setVideo] = useState<Video | null>(null);
    const theme = useTheme();
    const isGreaterMd = useMediaQuery(theme.breakpoints.up('md'));

    useEffect(() => {
        ['rating', 'opened'].forEach(name => register(name));
    }, [register]);

    useEffect(() => {
        if (!id) {
            return;
        }
        let isSubscribed = true;
        (async () => { // iife
            setLoading(true);
            try {
                const { data } = await videoHttp.get(id);
                if (isSubscribed) {
                    setVideo(data.data);
                    reset(data.data);
                    //console.log(data.data);
                }
            } catch (error) {
                console.error(error);
                snackBar.enqueueSnackbar(
                    'Não foi possível carregar video',
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

    async function onSubmit(formData, event) {
        setLoading(true);
        try {
            const http = !video
                ? videoHttp.create(formData)
                : videoHttp.update(video.id, formData);
            const { data } = await http;
            snackBar.enqueueSnackbar(
                'Vídeo salvo com sucesso',
                { variant: 'success' }
            );
            setTimeout(() => {     //avoid no-op warning about side effect
                event
                    ? ( //save & edit
                        id
                            ? history.replace(`/videos/${data.data.id}/edit`)   //videos/<id>/edit
                            : history.push(`/videos/${data.data.id}/edit`)      //videos/create
                    )
                    : ( //videos
                        history.push('/videos')
                    )
            })
        } catch (error) {
            console.error(error);
            snackBar.enqueueSnackbar(
                'Não foi possível salvar vídeo',
                { variant: 'error' }
            );
        } finally {
            setLoading(false);
        }
    }
    //console.log(errors);
    return (
        <DefaultForm
            GridItemProps={{ xs: 12 }}
            onSubmit={handleSubmit(onSubmit)}
        >
            <Grid container spacing={5}>
                <Grid item xs={12} md={6}>
                    <TextField
                        name="title"
                        label="Título"
                        fullWidth
                        variant={"outlined"}
                        inputRef={register}     // register => react-hook applies to field by name
                        disabled={loading}
                        error={errors.title !== undefined}
                        helperText={errors.title && errors.title.message}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        name="description"
                        label="Sinopse"
                        multiline
                        rows="4"
                        margin={"normal"}
                        variant={"outlined"}
                        inputRef={register}
                        disabled={loading}
                        fullWidth
                        error={errors.description !== undefined}
                        helperText={errors.description && errors.description.message}
                        InputLabelProps={{ shrink: true }}
                    />
                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <TextField
                                name="year_launched"
                                label="Ano de lançamento"
                                type="number"
                                margin={"normal"}
                                variant={"outlined"}
                                inputRef={register}
                                disabled={loading}
                                fullWidth
                                error={errors.year_launched !== undefined}
                                helperText={errors.year_launched && errors.year_launched.message}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                name="duration"
                                label="Duração"
                                type="number"
                                margin={"normal"}
                                variant={"outlined"}
                                inputRef={register}
                                disabled={loading}
                                fullWidth
                                error={errors.duration !== undefined}
                                helperText={errors.duration && errors.duration.message}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                    </Grid>
                    Elenco
                    <br />
                    Gêneros e Categorias
                </Grid>
                <Grid item xs={12} md={6}>
                    <RatingField
                        value={watch('rating')}
                        setValue={(value) => setValue('rating', value, true)}
                        disabled={loading}
                        error={errors.rating}
                        FormControlProps={{
                            margin: isGreaterMd ? 'none' : 'normal'
                        }}
                    />
                    <br />
                    Uploads
                    <br />
                    <FormControlLabel
                        disabled={loading}
                        control={
                            <Checkbox
                                name="opened"
                                color={"primary"}
                                onChange={
                                    () => setValue('opened', !getValues()['opened'])
                                }
                                checked={watch('opened')}
                                disabled={loading}
                            />
                        }
                        label={
                            <Typography color="primary" variant={"subtitle2"}>
                                Quero que este conteúdo apareça em lançamentos
                            </Typography>
                        }
                        labelPlacement={'end'}
                    />
                </Grid>
            </Grid>
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