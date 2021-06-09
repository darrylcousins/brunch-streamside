/** @jsx createElement */
/**
 * Creates element to render modal form for filter orders.
 *
 * @module app/components/orders-filter
 * @exports FilterOrders
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";

import { CloseIcon, FilterIcon } from "../lib/icon";
import Button from "../lib/button";

/**
 * Creates element to render a modal for selecting order filter.
 *
 * @generator
 * @yields {Element}
 */
function* FilterOrders({updateFilter}) {

  /**
   * Fields we can filter on
   *
   * @member {boolean} fields
   */
  let fields = [
    {
      title: 'Pickup Date',
      id: 'pickup'
    }
  ];
  /**
   * Form filter field
   *
   * @member {boolean} filter_field
   */
  let filter_field = fields[0].id;
  /**
   * Form filter value
   *
   * @member {string} filter_value
   */
  let filter_value = "";
  /**
   * Is the modal visible?
   *
   * @member {boolean} visible
   */
  let visible = false;

  /**
   * Action which closes the modal and refreshes component. Normally attached
   * to the modal `close` button and the `cancel` button.
   *
   * @function closeModal
   */
  const closeModal = () => {
    visible = false;
    this.refresh();
  };

  /**
   * Action which opens the modal and refreshes component
   *
   * @function showModal
   */
  const showModal = () => {
    visible = true;
    this.refresh();
  };

  /**
   * Control the value field
   *
   * @function updateValue
   */
  const updateValue = async (value) => {
    console.log('got this date:', value);
    filter_value = value;
    this.refresh();
  };

  /**
   * User has clicked apply, set the filter
   *
   * @function setFilter
   */
  const setFilter = async (ev) => {
    updateFilter({
      filter_field,
      filter_value: new Date(Date.parse(filter_value)).getTime(),
    });
    closeModal();
  };

  /**
   * Hide the modal on escape key
   *
   * @function hideModal
   * @param {object} ev Event emitted
   * @listens window.keyup
   */
  const hideModal = async (ev) => {
    if (ev.key && ev.key === "Escape") {
      closeModal();
    }
  };

  this.addEventListener("keyup", hideModal);

  for (const _ of this) { // eslint-disable-line no-unused-vars
    yield (
      <Fragment>
        <button
          class={`dib w-25 f6 outline-0 black-70 b--dark-green ba ba1 bg-transparent br2 br--left mv1 pointer`}
          title="Filter orders"
          type="button"
          onclick={showModal}>
            <span class="v-mid">Add filter</span>
            <span class="v-mid">
              <FilterIcon />
            </span>
        </button>
        {visible && (
          <div
            class="db absolute left-0 w-100 z-1 bg-black-90 pa4"
            style={`top: ${Math.round(window.scrollY).toString()}px;`}
          >
            <div class="bg-white pa4 br3">
              <button
                class="bn outline-0 bg-transparent pa0 no-underline mid-gray dim o-70 absolute top-1 right-1"
                name="close"
                onclick={closeModal}
                type="button"
                style="margin-right: 30px; margin-top: 30px;"
                title="Close modal"
              >
                <CloseIcon />
                <span class="dn">Close modal</span>
              </button>

              <fieldset class="w-100 center dark-gray tl ba b--transparent ph0 mh0">
                <legend class="f4 fw6 ph0 mh0">Filter options</legend>

                <div class="fl w-50">
                  <div class="tl ph2 mt1 ml0">
                    <label class="fw6 lh-copy f6" htmlFor="field" for="field">
                      Field
                    </label>
                    <select
                      class="mr1 pa2 ba bg-transparent hover-bg-near-white w-100 input-reset br2"
                      id="field"
                    >
                      {fields.map(field => (
                        <option
                          selected={field.id === filter_field}
                          value={field.id}>{field.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div class="fl w-50">
                  <div class="tl ph2 mt1 ml0">
                    <label class="fw6 lh-copy f6" htmlFor="filter" for="filter">
                      Value
                    </label>
                    <input
                      class="mr1 pa2 ba bg-transparent hover-bg-near-white w-100 input-reset br2"
                      type="date"
                      value={filter_value}
                      id="filter"
                      onchange={(ev) => updateValue(ev.target.value)}
                    />
                  </div>
                </div>
                <div class="w-100 tr">
                  <Button type="primary" onclick={setFilter}>
                    Apply
                  </Button>
                  <Button type="secondary" onclick={closeModal}>
                    Cancel
                  </Button>
                </div>
              </fieldset>
            </div>
          </div>
        )}
      </Fragment>
    );
  };
};

export default FilterOrders;
