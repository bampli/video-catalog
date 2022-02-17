import * as React from 'react';
import LoadingContext from "./LoadingContext";
import { useEffect, useMemo, useState } from "react";
import {
    addGlobalRequestInterceptor, removeGlobalRequestInterceptor,
    addGlobalResponseInterceptor,removeGlobalResponseInterceptor
} from "../../util/http";

export const LoadingProvider = (props) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [countRequest, setCountRequest] = useState(0);

    //useMemo vs useCallback
    useMemo(() => {
        let isSubscribed = true;
        //axios.interceptors.request.use();
        const requestIds = addGlobalRequestInterceptor((config) => {
            // see store/upload/sagas.ts about config.headers: 'x-ignore-loading'
            if (isSubscribed && (!config.headers || !config.headers.hasOwnProperty('x-ignore-loading'))) {
                setLoading(true);
                setCountRequest((prevCountRequest) => prevCountRequest + 1);
            }
            // do we need to extract header? 'x-ignore-loading'
            // config.headers = omit(config.headers, 'x-ignore-loading'); // import omit from lodash
            return config;
        });
        //axios.interceptors.response.use();
        const responseIds = addGlobalResponseInterceptor(
            (response) => {
                if (isSubscribed && !(response.config.headers as any).hasOwnProperty('x-ignore-loading')) {
                    decrementCountRequest();
                }
                return response;
            },
            (error) => {
                if (isSubscribed && (!error.config || !(error.config.headers as any).hasOwnProperty('x-ignore-loading'))) {
                    decrementCountRequest();
                }
                return Promise.reject(error);
            }
        );
        return () => {
            isSubscribed = false;
            removeGlobalRequestInterceptor(requestIds);
            removeGlobalResponseInterceptor(responseIds);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [true]);

    useEffect(() => {
        if (!countRequest) {
            setLoading(false);
        }
    }, [countRequest]);

    function decrementCountRequest() {
        setCountRequest((prevCountRequest) => prevCountRequest - 1);
    }

    return (
        <LoadingContext.Provider value={loading}>
            {props.children}
        </LoadingContext.Provider>
    );
};