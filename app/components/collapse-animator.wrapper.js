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
 */
function CollapseWrapper(Component) {

  const collapseSection = (element) => {
    if (!element) return;

    const sectionHeight = element.scrollHeight;

    // temporarily disable all css transitions
    var elementTransition = element.style.transition;
    element.style.transition = '';

    requestAnimationFrame(() => {
      element.style.height = sectionHeight + 'px';
      element.style.transition = elementTransition;

      requestAnimationFrame(() => {
        element.style.height = 0 + 'px';
      });
    });

    // mark the section as "currently collapsed"
    element.setAttribute('data-collapsed', 'true');
  }

  const expandSection = (element) => {
    if (!element) return;

    const sectionHeight = element.scrollHeight;

    // have the element transition to the height of its inner content
    element.style.height = sectionHeight + 'px';

    // when the next css transition finishes (which should be the one we just triggered)
    element.addEventListener('transitionend', (e) => {
      // remove this event listener so it only gets triggered once
      element.removeEventListener('transitionend', arguments.callee);

      // remove "height" from the element's inline styles, so it can return to its initial value
      element.style.height = null;
    });

    // mark the section as "currently not collapsed"
    element.setAttribute('data-collapsed', 'false');
  }

  //const isCollapsed = section.getAttribute('data-collapsed') === 'true';
  const isCollapsed = false;
  const self = null;

  if(isCollapsed) {
    expandSection(self)
    section.setAttribute('data-collapsed', 'false')
  } else {
    collapseSection(self)
  }

  /**
   * Wrap a crank Component and provide animation functionality
   *
   * @function Wrapper
   * @yields {Element} Return the wrapped component
   * @param {object} props Property object
   */
  return async function* ({collapsed, ...props}) {

    for await (const {collapsed: newCollapsed, ...props} of this) {

      yield (
        <Fragment>
          <div id={`collapse-${props.id}`} class="collapsible">
            <Component
              {...props}
            />
          </div>
        </Fragment>
      );

      if (collapsed !== newCollapsed) {
        console.log('changed props collapse')
      }
      collapsed = newCollapsed;
    }
  };
}

export default CollapseWrapper;
