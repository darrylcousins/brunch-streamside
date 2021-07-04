/** @jsx createElement */
/**
 * Creates element to render a editable rule
 *
 * @module app/components/box-rule
 * @exports BoxRulesModal
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement, Fragment, Portal} from "@bikeshaving/crank/cjs";
import { EditIcon, DeleteIcon } from "../lib/icon";
import RulesForm from "./box-rules-form";
import RemoveBoxRuleModal from "./box-rule-remove";

/**
 * Display a box rule
 *
 * @generator BoxRule
 * @yields {Element} DOM element displaying modal
 * @param {object} props Property object
 */
function* BoxRule({ rule }) {

  /**
   * Hold collapsed state of add form
   *
   * @member {boolean} collapsed
   */
  let disabled = true;

  /*
   * Control the collapse of form
   * @function toggleCollapse
   */
  const toggleForm = () => {
    disabled = !disabled;
    this.refresh();
  };

  for ({rule} of this) {
    yield (
      <div class="flex mb2 center ph1 ba b--black-40 br2">
        <div class="">
          <RulesForm rule={rule} disabled={disabled} toggleCollapse={toggleForm} />
        </div>
        {disabled && (
          <div class=" tr mt3">
            <button
              class="bn outline-0 bg-transparent pa0 no-underline dark-gray dim pointer"
              name="edit"
              onclick={toggleForm}
              type="button"
              title="Edit rule"
            >
              <EditIcon />
              <span class="dn">Edit rule</span>
            </button>
            <RemoveBoxRuleModal rule={rule} />
          </div>
        )}
      </div>
    );
  };
}

export default BoxRule;
