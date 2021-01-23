/** @jsx createElement */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";
import CurrentTodos from "./partials/todos";
import AddTodoModal from "./partials/todo-add";

export default function Todos() {
  return (
    <Fragment>
      <AddTodoModal />
      <CurrentTodos />
    </Fragment>
  );
}
