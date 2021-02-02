/** @jsx createElement */
/**
 * Starting point of url route /todos
 *
 * @module app/route/todo
 * @exports Todos
 * @requires module:app/todos
 * @requires module:app/todos-add
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";
import CurrentTodos from "../components/todos";
import AddTodoModal from "../components/todo-add";

/**
 * Route for todos, linked from navigation
 *
 * @function
 * @returns {Element} DOM component
 * @example
 * import {renderer} from '@bikeshaving/crank/cjs/dom';
 * renderer.render(<Todos />, document.querySelector('#app'))
 */
function Todos() {
  return (
    <Fragment>
      <AddTodoModal />
      <CurrentTodos />
    </Fragment>
  );
}

export default Todos;
