/** @jsx createElement */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";
import { renderer } from "@bikeshaving/crank/cjs/dom";

import OrderDetail from "./order-detail";
import OrderModal from "./order-modal";
import EditOrderModal from "./order-edit";
import RemoveOrderModal from "./order-remove";
import { DownloadIcon, HelpIcon, CloseIcon, EditIcon } from "../lib/icon";
import Button from "../lib/button";

export const sortObjectByKeys = (o) =>
  Object.keys(o)
    .sort()
    .reduce((r, k) => ((r[k] = o[k]), r), {});

export const sortObjectByKey = (o, key) => {
  o.sort((a, b) => {
    var nameA = a[key].toUpperCase(); // ignore upper and lowercase
    var nameB = b[key].toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });
  return o;
};
