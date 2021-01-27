/** @jsx createElement */
/**
 * Error display component module
 *
* @module app/lib/error
* @author Darryl Cousins <darryljcousins@gmail.com>
*/
import { createElement, isElement } from "@bikeshaving/crank/cjs";

/**
 * Error component
 *
 * @return {Element} DOM component
 * @param {object} props  Component properties
 * @param {Element|String|Object} props.msg Error to be displayed
 */
const ErrorMsg = ({ msg }) => {
  console.log(msg, typeof msg, isElement(msg));
  if (typeof msg === "string" || isElement(msg)) {
    return (
      <div class="dark-red mv2 pt2 pl2 br3 ba b--dark-red bg-washed-red">
        <p class="tc">{msg}</p>
      </div>
    );
  }

  if (typeof msg === "object" || !msg.msg) {
    return (
      <div class="dark-red mv2 pt2 pl2 br3 ba b--dark-red bg-washed-red">
        <p class="tc">{msg.toString()}</p>
      </div>
    );
  }

  return (
    <div class="dark-red mv2 pt2 pl2 br3 ba b--dark-red bg-washed-red">
      <p class="tc">
        {msg.msg}
        :
        {msg.err}
      </p>
    </div>
  );
};

export default ErrorMsg;
