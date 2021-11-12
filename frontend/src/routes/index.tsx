import {RouteProps} from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import CategoryList from "../pages/category/List";

interface myRouteProps extends RouteProps{
    label: string;
}

const routes: myRouteProps[]= [
    {
        label: 'Dashboard',
        path: '/',
        component: Dashboard,
        exact: true
    },
    {
        label: 'Listar categorias',
        path: '/categories',
        component: CategoryList,
        exact: true
    }
]

export default routes;