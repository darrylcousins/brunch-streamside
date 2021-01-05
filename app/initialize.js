/** @jsx createElement */
import 'regenerator-runtime/runtime.js'; // regeneratorRuntime error
import {createElement} from '@bikeshaving/crank/cjs';
import {renderer} from '@bikeshaving/crank/cjs/dom';
import crossroads from 'crossroads';
//import LoginForm from 'components/login-form';
import Home from 'components/home';
import Orders from 'components/orders';
import Boxes from 'components/boxes';

const index = crossroads.addRoute('/', () =>  renderer.render(<Home />, document.querySelector('#app')));
const boxes = crossroads.addRoute('/boxes', () =>  renderer.render(<Boxes />, document.querySelector('#app')));
const orders = crossroads.addRoute('/orders', () =>  renderer.render(<Orders />, document.querySelector('#app')));

document.addEventListener('DOMContentLoaded', () => {

  console.log('Initialized app');

  const path = window.location.pathname;

  crossroads.parse(path);
});
