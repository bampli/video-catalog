import {RouteProps} from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import CategoryList from "../pages/category/List";

export interface myRouteProps extends RouteProps{
    name:string;
    label: string;
}

const routes: myRouteProps[]= [
    {
        name: 'dashboard',
        label: 'Dashboard',
        path: '/',
        component: Dashboard,
        exact: true
    },
    {
        name: 'categories.list',
        label: 'Listar categorias',
        path: '/categories',
        component: CategoryList,
        exact: true
    }
]

export default routes;