'use strict'

import React from 'react';
import ReactDOM from 'react-dom';

import {Router, Route, browserHistory} from 'react-router';

import {Provider} from 'react-redux';
import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';

import {syncHistoryWithStore, routerReducer} from 'react-router-redux'

import injectTapEventPlugin from 'react-tap-event-plugin';

import * as reducers from './reducers';

import Main from './components/main.react';

injectTapEventPlugin();


const store = createStore(
    combineReducers({
        ...reducers,
        routing: routerReducer
    }),
    applyMiddleware(thunk));

const history = syncHistoryWithStore(browserHistory, store);

ReactDOM.render(
    <Provider store={store}>
        <Router history={history}>
            <Route path="/" component={Main}/>
        </Router>
    </Provider>, document.getElementById('react--app'));