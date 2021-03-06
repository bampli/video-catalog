import * as React from 'react';
import Form from "./Form";
import { Page } from "../../components/Page";
import { useParams } from 'react-router';

const PageForm = () => {
    const { id } = useParams<{ id }>();
    return (
        <Page title={!id ? 'Criar gênero' : 'Editar gênero'}>
            <Form />
        </Page>
    );
}

export default PageForm;