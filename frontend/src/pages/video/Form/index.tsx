import * as React from 'react';
import {
    Card, CardContent, Checkbox,
    FormControlLabel, Grid, makeStyles,
    TextField, Theme, Typography,
    useMediaQuery, useTheme
} from "@material-ui/core";
import { useForm } from "react-hook-form";
import { createRef, useCallback, useContext, useState, useEffect, useRef } from 'react';
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
import useSnackbarFormError from '../../../hooks/useSnackbarFormError';
import LoadingContext from '../../../components/loading/LoadingContext';
import SnackbarUpload from '../../../components/SnackbarUpload';
import { useDispatch } from "react-redux";
//import { UploadModule, UploadState, Upload } from "../../../store/upload/types";
import { Creators } from "../../../store/upload";
import { FileInfo } from "../../../store/upload/types";

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
        .label('T??tulo')
        .required()
        .max(255),
    description: yup.string()
        .label('Sinopse')
        .required(),
    year_launched: yup.number()
        .label('Ano de lan??amento')
        .required().min(1), // original backend added min:1 rule
    duration: yup.number()
        .label('Dura????o')
        .required()
        .min(1),        // original backend added min:1 rule
    //.xpto()         // see global custom rule created at util/vendor/yup.ts
    genres: yup.array()
        .label('G??neros')
        .required()
        .min(1)
        .test({
            message: 'Cada g??nero precisa ter pelo menos uma categoria selecionada',
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
        .label('Classifica????o')
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
        triggerValidation,
        formState
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
    useSnackbarFormError(formState.submitCount, errors);

    const classes = useStyles();
    const {enqueueSnackbar} = useSnackbar();
    const history = useHistory();
    const { id } = useParams<{ id: string }>();
    const loading = useContext(LoadingContext);
    const [video, setVideo] = useState<Video | null>(null);
    const theme = useTheme();
    const isGreaterMd = useMediaQuery(theme.breakpoints.up('md'));

    const castMemberRef = useRef() as React.MutableRefObject<CastMemberFieldComponent>;
    const genreRef = useRef() as React.MutableRefObject<GenreFieldComponent>;
    const categoryRef = useRef() as React.MutableRefObject<CategoryFieldComponent>;

    const uploadsRef = useRef(
        zipObject(fileFields, fileFields.map(() => createRef()))
    ) as React.MutableRefObject<{ [key: string]: React.MutableRefObject<InputFileComponent> }>;

    // const uploads = useSelector<UploadModule, Upload[]>(
    //     (state) => state.upload.uploads
    // );

    const dispatch = useDispatch();

    const resetForm = useCallback((data) => {
        Object.keys(uploadsRef.current).forEach(
            field => uploadsRef.current[field].current.clear()
        );
        castMemberRef.current.clear();
        genreRef.current.clear();
        categoryRef.current.clear();
        reset(data);    // optional
    }, [castMemberRef, categoryRef, genreRef, reset, uploadsRef]); // {current: xx} changes are here

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
            try {
                const { data } = await videoHttp.get(id);
                if (isSubscribed) {
                    setVideo(data.data);
                    resetForm(data.data);
                    //console.log("uE-1", data.data);
                }
            } catch (error) {
                console.error(error);
                enqueueSnackbar(
                    'N??o foi poss??vel carregar video',
                    { variant: 'error' }
                );
            }
        })();
        return () => {
            isSubscribed = false;
        }
    }, [id, resetForm, enqueueSnackbar]);

    async function onSubmit(formData, event) {
        const sendData = omit(
            formData,
            [...fileFields, 'cast_members', 'genres', 'categories']
        );
        sendData['cast_members_id'] = formData['cast_members'].map(cast_member => cast_member.id);
        sendData['categories_id'] = formData['categories'].map(category => category.id);
        sendData['genres_id'] = formData['genres'].map(genre => genre.id);

        try {
            const http = !video
                ? videoHttp.create(sendData)
                : videoHttp.update(
                    video.id, sendData  // since video & files are separated now
                    //{ ...sendData, _method: 'PUT' }, { http: { usePost: true } }
                );
            const { data } = await http;
            enqueueSnackbar(
                'V??deo salvo com sucesso',
                { variant: 'success' }
            );
            //console.log("onSubmit", id, video);

            uploadFiles(data.data);

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
            });
        } catch (error) {
            console.error(error);
            enqueueSnackbar(
                'N??o foi poss??vel salvar v??deo',
                { variant: 'error' }
            );
        }
    }

    function uploadFiles(video) {
        const files: FileInfo[] = fileFields
            .filter(fileField => getValues()[fileField])
            .map(fileField => ({ fileField, file: getValues()[fileField] as File }));

        if (!files.length) {
            return;
        }

        dispatch(Creators.addUpload({ video, files }));

        enqueueSnackbar('', {
            key: 'snackbar-upload',
            persist: true,
            anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'right'
            },
            content: (key, message) => {
                const id = key as any;
                return <SnackbarUpload id={id} />
            }
        });
    }

    return (
        <DefaultForm
            GridItemProps={{ xs: 12 }}
            onSubmit={handleSubmit(onSubmit)}
        >
            <Grid container spacing={5}>
                <Grid item xs={12} md={6}>
                    <TextField
                        name="title"
                        label="T??tulo"
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
                                label="Ano de lan??amento"
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
                                label="Dura????o"
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

                    <CastMemberField
                        ref={castMemberRef}
                        castMembers={watch('cast_members')}
                        setCastMembers={(value) => setValue('cast_members', value, true)}
                        error={errors.cast_members}
                        disabled={loading}
                    />
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <GenreField
                                ref={genreRef}
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
                                ref={categoryRef}
                                categories={watch('categories')}
                                setCategories={(value) => setValue('categories', value, true)}
                                genres={watch('genres')}
                                error={errors.categories}
                                disabled={loading}
                            />
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
                                        Incluir este conte??do em lan??amentos
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