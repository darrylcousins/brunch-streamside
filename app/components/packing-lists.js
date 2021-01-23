/** @jsx createElement */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";
import PackingLists from "./partials/packing-lists";

export default function PackingList() {
  return (
    <Fragment>
      <PackingLists />
    </Fragment>
  );
}
