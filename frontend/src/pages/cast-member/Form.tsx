import * as React from 'react';
import { FormControl, FormControlLabel, FormHelperText, FormLabel, Radio, RadioGroup, TextField } from "@material-ui/core";
import { useForm } from "react-hook-form";
import castMemberHttp from '../../util/http/cast-member-http';
import * as yup from '../../util/vendor/yup';
import { useParams, useHistory } from 'react-router';
import { useContext, useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { CastMember } from '../../util/models';
import SubmitActions from '../../components/SubmitActions';
import {DefaultForm} from "../../components/DefaultForm";
import LoadingContext from '../../components/loading/LoadingContext';

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
        watch,
        triggerValidation
    } = useForm<{ name, type }>({
        validationSchema,
        // defaultValues: {
        // }
    });

    const snackBar = useSnackbar();
    const history = useHistory();
    const { id } = useParams<{ id: string }>();
    const loading = useContext(LoadingContext);
    const [castMember, setCastMember] = useState<CastMember | null>(null);

    useEffect(() => {
        if (!id) {
            return;
        }
        let isSubscribed = true;
        (async () => {
            try {
                const { data } = await castMemberHttp.get(id);
                if (isSubscribed) {
                    setCastMember(data.data)
                    reset(data.data);
                    //console.log(data.data);
                }
            } catch (error) {
                console.error(error);
                snackBar.enqueueSnackbar(
                    'Não foi possível carregar membro de elenco',
                    { variant: 'error' }
                );
            }
        })();

        return () => {
            isSubscribed = false;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        register({ name: "type" })
    }, [register]);

    async function onSubmit(formData, event) {
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
        }
        //console.log(event);
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
            <SubmitActions
                disabledButtons={loading}
                handleSave={() =>
                    triggerValidation().then(isValid => {
                        isValid && onSubmit(getValues(), null)
                    })
                }
            />
        </DefaultForm >
    );
}
