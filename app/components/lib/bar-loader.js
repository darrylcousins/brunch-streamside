/** @jsx createElement */
/**
 * Loading indicator module
 *
 * @module app/lib/bar-loader
 * @exports {Element} BarLoader
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement } from "@bikeshaving/crank/cjs";

/**
 * Loader component
 *
 * @return {Element} DOM component
 */
const BarLoader = () => (
  <div class="progress-bar mt2">
    <span class="bar">
      <span class="progress" />
    </span>
  </div>
);

export default BarLoader;
