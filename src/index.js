import React from 'react';
import ReactDOM from 'react-dom';
import './assets/main.css';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import Router from './Router';
import * as serviceWorker from './serviceWorker';

import { CLIENT_ID, BASE_KEY } from './utils/localStorageInfo'

import Amplify from '@aws-amplify/core'
import config from './aws-exports'
Amplify.configure(config)

const LOCAL_KEY = localStorage.getItem(BASE_KEY);

if (!LOCAL_KEY) {
  localStorage.setItem(BASE_KEY, CLIENT_ID);
}

ReactDOM.render(
  <Router />,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
