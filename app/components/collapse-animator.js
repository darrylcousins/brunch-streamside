/** @jsx createElement */
/**
 * Wrap a component to response to signal to animate collapse
 *
 * @module app/components/collapse-animator
 * @exports CollapseAnimator
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";

/**
 * Wrap a crank Component and animate collapse
 *
 * @function AnimateCollapseWrapper
 * @returns {Function} Return the wrapped component
 * @param {object} Component The component to be wrapped
 * @param {object} options Options for form and modal
 */
function CollapseWrapper(Component) {

  /*
   * @function collapseElement
   * from https://css-tricks.com/using-css-transitions-auto-dimensions/
   *
   */
  const collapseElement = (element) => {
    if (!element) return;
    const elementHeight = element.scrollHeight;
    var elementTransition = element.style.transition;
    element.style.transition = "";
    requestAnimationFrame(() => {
      element.style.height = elementHeight + "px";
      element.style.transition = elementTransition;
      requestAnimationFrame(() => {
        element.style.height = 0 + "px";
      });
    });
  }

  /*
   * @function transitionElementHeight
   * from https://css-tricks.com/using-css-transitions-auto-dimensions/
   * .collapsible {
   *   overflow:hidden;
   *   transition: height 0.8s ease-out;
   *   height:auto;
   * }
   *
   */
  const transitionElementHeight = (element) => {
    if (!element) return;
    let calculatedHeight = 5;
    // simply using el.scrollHeight can give some odd results when element is shrinking
    element.childNodes.forEach(el => {
      calculatedHeight += el.scrollHeight;
    });
    element.style.height = calculatedHeight + "px";
  }
  
  /*
   * @function sleepUntil
   * Wait for element to be rendered
   * From https://levelup.gitconnected.com/javascript-wait-until-something-happens-or-timeout-82636839ea93
   *
   */
  async function sleepUntil(f, timeoutMs) {
    return new Promise((resolve, reject) => {
      let timeWas = new Date();
      let wait = setInterval(function() {
        if (f()) {
          try {
            clearInterval(wait);
          } catch(e) {
          };
          resolve();
        } else if (new Date() - timeWas > timeoutMs) { // Timeout
          try {
            clearInterval(wait);
          } catch(e) {
          };
          reject();
        }
        }, 20);
      });
  }

  /**
   * Wrap a crank Component and provide animation functionality
   *
   * @function Wrapper
   * @yields {Element} Return the wrapped component
   * @param {object} props Property object
   */
  return async function* ({id, collapsed, ...props}) {

    //console.log(props);
    const fixCollapse = () => {
      const el= document.querySelector(`#${id}`);
      transitionElementHeight(el);
    };

    window.addEventListener('resize', fixCollapse);

    // send this event to resize wrapper (e.g. box-rules-form.js)
    this.addEventListener('collapse.wrapper.resize', fixCollapse);

    for await (const {id, collapsed: newCollapsed, ...props} of this) {

      const startCollapsed = (collapsed === newCollapsed) && collapsed;
      const el = yield (
        <div
          id={id}
          class={`collapsible ${startCollapsed ? "collapsed" : ""}`}
        >
          <Component
            {...props}
          />
        </div>
      );

      // wait until the element has rendered, note that this fails if component
      // is async generator and I don't know how to fix it
      await sleepUntil(() => document.querySelector(`#${el.id}`), 1000);

      const element = document.querySelector(`#${el.id}`);
      if (element) {
        if (id === "box-settings-form") {
          console.log(id, "old", collapsed, "new", newCollapsed, "start", startCollapsed);
        }
        if (newCollapsed) {
          collapseElement(element);
        } else {
          transitionElementHeight(element);
        }
        //element.scrollIntoView({ behavior: "smooth" });
      }

      collapsed = newCollapsed;

    }
  };
}

export default CollapseWrapper;
