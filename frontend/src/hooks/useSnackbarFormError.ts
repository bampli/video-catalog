import { useSnackbar } from "notistack";
import { useEffect } from 'react';

const useSnackbarFormError = (submitCount, errors) => {
    const snackbar = useSnackbar();
    useEffect( () => {
        const hasError = Object.keys(errors).length !== 0;
        if (submitCount > 0 && hasError){
            snackbar.enqueueSnackbar(
                'Formulário inválido, reveja os campos em vermelho.',
                {variant: 'error'}
            )
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [submitCount])
};

export default useSnackbarFormError;