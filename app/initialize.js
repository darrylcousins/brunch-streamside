/** @jsx createElement */
import 'regenerator-runtime/runtime.js'; // regeneratorRuntime error
import {createElement} from '@bikeshaving/crank/cjs';
import {renderer} from '@bikeshaving/crank/cjs/dom';
import crossroads from 'crossroads';
import LoginForm from 'components/login-form';

const login = crossroads.addRoute('/', () =>  renderer.render(<LoginForm />, document.querySelector('#app')));

document.addEventListener('DOMContentLoaded', () => {

  console.log('Initialized app');

  const path = window.location.pathname;

  crossroads.parse(path);
});
