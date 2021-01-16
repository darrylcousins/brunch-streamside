/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';
import Fetch from './lib/fetch';
import CurrentTodos from './partials/todos';
import AddTodoModal from './partials/todo-add';

module.exports = function () {
  const todo = {
    _id: new Date().getTime(),
    title: 'Fix forms',
    tags: 'Bug,Orders',
    note: 'Some note',
    author: 'Darryl',
    created: new Date().toDateString(),
    completed: true
  };
  //<AddTodoModal todo={ todo } />
  return (
    <Fragment>
      <AddTodoModal />
      <CurrentTodos />
    </Fragment>
  )
};



