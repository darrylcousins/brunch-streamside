/** @jsx createElement */
/**
 * Starting point of url route /
 *
 * @module app/route/home
 * @exports Home
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement } from "@bikeshaving/crank/cjs";

/**
 *  Route to home page, linked from navigation
 *
 * @function
 * @returns {Element} DOM component
 * @example
 * import {renderer} from '@bikeshaving/crank/cjs/dom';
 * renderer.render(<Home />, document.querySelector('#app'))
 */
function Home() {
  return (
    <h2 class="lh-title">Box Management</h2>
  );
}

export default Home;
