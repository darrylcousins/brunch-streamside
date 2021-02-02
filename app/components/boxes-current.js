/** @jsx createElement */
/**
 * Top of hierarchy of elements to render boxes
 *
 * @module app/components/boxes-current
 * @exports CurrentBoxes
 * @requires module:app/components/boxes~Boxes
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement } from "@bikeshaving/crank/cjs";
import BarLoader from "../lib/bar-loader";
import Error from "../lib/error";
import { Fetch } from "../lib/fetch";
import Boxes from "./boxes";

/**
 * Uses fetch to collect current boxes from api and then passes data to
 * {@link module:app/boxes} to display as a table.
 *
 * @generator
 * @yields {Element}
 */
function* CurrentBoxes() {

  /**
   * Contains box data as collected from [api/current-boxes]{@link
   * module:api/current-boxes}. The data uses delivery date as keys to unsorted
   * array of box data.
   *
   * @returns {Element} Dom component
   * @member fetchJson
   * @type {object.<string, Array>}
   */
  let fetchJson = {};

  /**
   * If fetching data was unsuccessful.
   *
   * @member fetchError
   * @type {object|string|null}
   */
  let fetchError = null;

  /**
   * Display loading indicator while fetching data
   *
   * @member loading
   * @type {boolean}
   */
  let loading = true;

  /**
   * Uses fetch to collect current boxes from api and then refreshs `this`
   * (Called as soon as the element is mounted.)
   *
   * @function fetchData
   */
  const fetchData = () => {
    Fetch(`/api/current-boxes`)
      .then((result) => {
        const { error, json } = result;
        if (error !== null) {
          fetchError = error;
          loading = false;
          this.refresh();
        } else {
          fetchJson = json;
          loading = false;
          this.refresh();
        }
      })
      .catch((err) => {
        fetchError = err;
        loading = false;
        this.refresh();
      });
  };

  fetchData();

  while (true) {
    yield (
      <div class="f6 w-100 mt2 pb2 center">
        <h2 class="pt0 f5 f4-ns lh-title-ns">Current Boxes</h2>
        {fetchError && <Error msg={fetchError} />}
        {Object.keys(fetchJson).length > 0 ? (
          <Boxes boxes={fetchJson} />
        ) : (
          <p class="lh-copy">Nothing to see here as yet.</p>
        )}
        <span>{Object.keys(fetchJson).length > 0}</span>
        {loading && <BarLoader />}
      </div>
    );
  }
}

export default CurrentBoxes;
