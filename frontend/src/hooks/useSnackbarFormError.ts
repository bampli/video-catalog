import { useSnackbar } from "notistack";
import { useEffect } from 'react';

const useSnackbarFormError = (submitCount, errors) => {
    const {enqueueSnackbar} = useSnackbar();
    useEffect( () => {
        const hasError = Object.keys(errors).length !== 0;
        if (submitCount > 0 && hasError){
            enqueueSnackbar(
                'Formulário inválido, reveja os campos em vermelho.',
                {variant: 'error'}
            )
        }
    }, [submitCount, errors, enqueueSnackbar])
};

export default useSnackbarFormError;