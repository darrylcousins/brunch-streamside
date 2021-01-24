/** @jsx createElement */
import { createElement } from "@bikeshaving/crank/cjs";
import BarLoader from "../lib/bar-loader";
import Error from "../lib/error";
import { Fetch } from "../lib/fetch";
import Boxes from "./boxes";

export default function* CurrentBoxes() {
  let fetchJson = {};
  let fetchError = null;
  let loading = true;

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
          console.log(JSON.stringify(fetchJson, null, 2));
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
