/** @jsx createElement */
/**
 * Router and starting  point of the browser app.
 * Renders [crank]{@link https://www.npmjs.com/@bikeshaving/crank} elements and
 * routing with [crossroads]{@link https://www.npmjs.com/package/crossroads}
 *
 * @author Darryl Cousins <darryljcousins@gmail.com>
 * @module app/initialize
 * @requires @bikeshaving/crank
 * @requires crossroads
 * @listens DOMContentLoaded
 */
import "regenerator-runtime/runtime"; // regeneratorRuntime error
import { createElement } from "@bikeshaving/crank/cjs";
import { renderer } from "@bikeshaving/crank/cjs/dom";
import crossroads from "crossroads";
import Home from "./route/home";
import Orders from "./route/orders";
import Box from "./route/boxes";
import Todos from "./route/todos";
import PackingLists from "./route/packing-lists";

crossroads.addRoute("/", () =>
  renderer.render(<Home />, document.querySelector("#app"))
);
crossroads.addRoute("/boxes", () =>
  renderer.render(<Box />, document.querySelector("#app"))
);
crossroads.addRoute("/orders", () =>
  renderer.render(<Orders />, document.querySelector("#app"))
);
crossroads.addRoute("/todos", () =>
  renderer.render(<Todos />, document.querySelector("#app"))
);
crossroads.addRoute("/packing-lists", () =>
  renderer.render(<PackingLists />, document.querySelector("#app"))
);

document.addEventListener("DOMContentLoaded", () => {
  console.log("Initialized app");

  const path = window.location.pathname;

  crossroads.parse(path);
});
