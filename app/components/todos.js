/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';
import Fetch from './lib/fetch';
import CurrentTodos from './partials/todos';
import AddTodoModal from './partials/todo-add';

module.exports = function () {
  return (
    <Fragment>
      <AddTodoModal />
      <CurrentTodos />
    </Fragment>
  )
};



