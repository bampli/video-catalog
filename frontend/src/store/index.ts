//import {createStore, applyMiddleware, combineReducers} from "redux";
import {createStore, combineReducers} from "redux";
//import createSagaMiddleware from 'redux-saga';
import upload from "./upload";
//import rootSaga from "./root-saga";


//const sagaMiddleware = createSagaMiddleware();
const store = createStore(
    combineReducers({
        upload
    }),
    //applyMiddleware(sagaMiddleware)
);

//console.log("store->", store);

//sagaMiddleware.run(rootSaga);

export default store;
