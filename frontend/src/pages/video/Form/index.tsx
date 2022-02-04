import * as React from 'react';
import {
    Card, CardContent, Checkbox,
    FormControlLabel, FormHelperText, Grid, makeStyles,
    TextField, Theme, Typography,
    useMediaQuery, useTheme
} from "@material-ui/core";
import { useForm } from "react-hook-form";
import { createRef, useState, useEffect, useRef } from 'react';
import videoHttp from '../../../util/http/video-http';
import * as yup from '../../../util/vendor/yup';
import { useParams, useHistory } from 'react-router';
import { useSnackbar } from "notistack";
import { Video, VideoFileFieldsMap } from "../../../util/models";
import SubmitActions from '../../../components/SubmitActions';
import { DefaultForm } from "../../../components/DefaultForm";

import RatingField from './RatingField';
import UploadField from './UploadField';
import GenreField, { GenreFieldComponent } from './GenreField';
import CategoryField, { CategoryFieldComponent } from './CategoryField';
import CastMemberField, { CastMemberFieldComponent } from './CastMemberField';
//import { Category, Genre } from "../../../util/models";
import { omit, zipObject } from 'lodash';
import { InputFileComponent } from '../../../components/InputFile';

const useStyles = makeStyles((theme: Theme) => ({
    cardUpload: {
        borderRadius: "4px",
        backgroundColor: "#f5f5f5",
        margin: theme.spacing(2, 0)
    },
    cardOpened: {
        borderRadius: "4px",
        backgroundColor: "#F5F5F5"
    },
    cardContentOpened: {
        paddingBottom: theme.spacing(2) + 'px !important'
    }
}));

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
        .required()
        .min(1),        // original backend added min:1 rule
      //.xpto()         // see global custom rule created at util/vendor/yup.ts
    genres: yup.array()
        .label('Gêneros')
        .required()
        .min(1)
        .test({
            message: 'Cada gênero precisa ter pelo menos uma categoria selecionada',
            test(value) {  // genre[{name, categories: [] ...}, {}, {}, ...]
                //console.log(this);    // useful to check yup values
                return (value as any).every(
                    v => v.categories.filter(
                        cat => this.parent.categories.map(c => c.id).includes(cat.id)
                    ).length !== 0
                )
            }       // use this.parent.categories to reach categories (or other) from yup
        }),         // ok for chaining several tests: .test().test().test()
    categories: yup.array()
        .label('Categorias')
        .required()
        .min(1),
    cast_members: yup.array()
        .label('Membros do elenco')
        .required()
        .min(1),
    rating: yup.string()
        .label('Classificação')
        .required(),
});

const fileFields = Object.keys(VideoFileFieldsMap);

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
    } = useForm<{
        title,
        description,
        year_launched,
        duration,
        genres,
        categories,
        cast_members,
        rating,
        opened
    }>({
        validationSchema,
        defaultValues: {
            rating: null,
            genres: [],
            categories: [],
            cast_members: [],
            opened: false
        }
    });

    const classes = useStyles();
    const snackBar = useSnackbar();
    const history = useHistory();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState<boolean>(false);
    const [video, setVideo] = useState<Video | null>(null);
    const theme = useTheme();
    const isGreaterMd = useMediaQuery(theme.breakpoints.up('md'));

    const castMemberRef = useRef() as React.MutableRefObject<CastMemberFieldComponent>;
    const genreRef = useRef() as React.MutableRefObject<GenreFieldComponent>;
    const categoryRef = useRef() as React.MutableRefObject<CategoryFieldComponent>;
    
    const uploadsRef = useRef(
        zipObject(fileFields, fileFields.map(() => createRef()))
    ) as React.MutableRefObject<{ [key: string]: React.MutableRefObject<InputFileComponent> }>;
    // automated Refs for fileFields:
    // fileFields looks like ['thumb_file', 'banner_file']
    // fileFields.map(() => createRef()) is Refs array [{current: undefined, {ref1, ref2} }]
    // uploadsRef = zipObject( ['thumb_file': ref1, 'banner_file': ref2] )
    // then use uploadsRef.current['thumb_file'].current.clear()

    useEffect(() => {
        [
            'rating',
            'opened',
            'genres',
            'categories',
            'cast_members',
            ...fileFields
        ].forEach(name => register(name));
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
                    //console.log("uE-1", data.data);
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
        //const sendData = omit(formData, ['cast_members', 'genres', 'categories']);
        const sendData = omit(formData, [...fileFields, 'cast_members', 'genres', 'categories']);
        sendData['cast_members_id'] = formData['cast_members'].map(cast_member => cast_member.id);
        sendData['categories_id'] = formData['categories'].map(category => category.id);
        sendData['genres_id'] = formData['genres'].map(genre => genre.id);

        setLoading(true);
        try {
            const http = !video
                ? videoHttp.create(sendData)
                : videoHttp.update(
                    video.id,
                    { ...sendData, _method: 'PUT' }, { http: { usePost: true } }
                );
            const { data } = await http;
            snackBar.enqueueSnackbar(
                'Vídeo salvo com sucesso',
                { variant: 'success' }
            );
            console.log("onSubmit", id, video);
            id && resetForm(video);
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
                // ? ( //save & edit
                //     !id && history.push(`/videos/${data.data.id}/edit`)      //videos/create
                // )
                // : ( //videos
                //     history.push('/videos')
                // )
            });
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

    function resetForm(data) {
        Object.keys(uploadsRef.current).forEach(
            field => uploadsRef.current[field].current.clear()
        );
        castMemberRef.current.clear();
        genreRef.current.clear();
        categoryRef.current.clear();
        reset(data);    // optional
    }

    //console.log("index", errors);

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
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <CastMemberField
                                castMembers={watch('cast_members')}
                                setCastMembers={(value) => setValue('cast_members', value, true)}
                                error={errors.cast_members}
                                disabled={loading}
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <GenreField
                                genres={watch('genres')}
                                setGenres={(value) => setValue('genres', value, true)}
                                categories={watch('categories')}
                                setCategories={(value) => setValue('categories', value, true)}
                                error={errors.genres}
                                disabled={loading}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <CategoryField
                                categories={watch('categories')}
                                setCategories={(value) => setValue('categories', value, true)}
                                genres={watch('genres')}
                                error={errors.categories}
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormHelperText>
                                Escolha pelo menos um gênero de vídeo.
                            </FormHelperText>
                            <FormHelperText>
                                Escolha pelo menos uma categoria de cada gênero.
                            </FormHelperText>
                        </Grid>
                    </Grid>
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
                    <Card className={classes.cardUpload}>
                        <CardContent>
                            <Typography color="primary" variant="h6">
                                Imagens
                            </Typography>
                            <UploadField
                                ref={uploadsRef.current['thumb_file']}
                                accept={'image/*'}
                                label={'Thumb'}
                                setValue={(value) => setValue('thumb_file', value)}
                            />
                            <UploadField
                                ref={uploadsRef.current['banner_file']}
                                accept={'image/*'}
                                label={'Banner'}
                                setValue={(value) => setValue('banner_file', value)}
                            />
                        </CardContent>
                    </Card>
                    <Card className={classes.cardUpload}>
                        <CardContent>
                            <Typography color="primary" variant="h6">
                                Videos
                            </Typography>
                            <UploadField
                                ref={uploadsRef.current['trailer_file']}
                                accept={'video/mp4'}
                                label={'Trailer'}
                                setValue={(value) => setValue('trailer_file', value)}
                            />
                            <UploadField
                                ref={uploadsRef.current['video_file']}
                                accept={'video/mp4'}
                                label={'Principal'}
                                setValue={(value) => {
                                    setValue('video_file', value);
                                    //console.log(getValues());
                                }}
                            />
                        </CardContent>
                    </Card>

                    <Card className={classes.cardOpened}>
                        <CardContent className={classes.cardContentOpened}>
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
                                        Incluir este conteúdo em lançamentos
                                    </Typography>
                                }
                                labelPlacement="end"
                            />
                        </CardContent>
                    </Card>
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