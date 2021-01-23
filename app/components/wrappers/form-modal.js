/** @jsx createElement */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";

import BarLoader from "../lib/bar-loader";
import Error from "../lib/error";
import { PostFetch } from "../lib/fetch";
import { CloseIcon } from "../lib/icon";

export default function FormModalWrapper(Component, options) {
  return function* (props) {
    const { id, title, src, ShowLink, color, saveMsg, successMsg } = options;
    const name = title.toLowerCase().replace(/ /g, "-");
    let visible = false;
    let loading = false;
    let success = false;
    let saving = false;
    let fetchError = null;
    let formError = null;

    const closeModal = () => {
      visible = false;
      this.refresh();
    };

    const keyUp = (ev) => {
      console.log(`key=${ev.key},code=${ev.code}`);
    };

    const showModal = () => {
      visible = !visible;
      this.refresh();
    };

    const saveData = (form) => {
      loading = true;
      saving = true;
      this.refresh();

      let hasFile = false;
      let data;
      let headers = { "Content-Type": "application/json" };

      // check to find if we have a file upload
      Object.values(form).some((value) => {
        if (typeof value.name === "string") {
          hasFile = true;
          return true;
        }
        return false;
      });

      // we have a file so need to use FormData and not json encode data
      // see PostFetch
      if (hasFile) {
        data = new FormData();
        Object.entries(form).forEach(([key, value]) => {
          data.set(key, value);
        });
        headers = false;
      } else {
        // no file - use json encoding
        data = form;
      }

      console.log(headers, data);

      PostFetch({ src, data, headers })
        .then((result) => {
          const { error, json } = result;
          if (error !== null) {
            fetchError = error;
            console.log("Fetch:", fetchError);
            loading = false;
            saving = false;
            this.refresh();
          } else {
            console.log(JSON.stringify(json));
            loading = false;
            saving = false;
            success = true;
            this.refresh();
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        })
        .catch((err) => {
          console.log("ERROR:", err);
          fetchError = err;
          loading = false;
          this.refresh();
        });
    };

    this.addEventListener("click", async (ev) => {
      if ( ["SVG", "PATH"].includes(ev.target.tagName.toUpperCase()) ) {
        showModal();
      }
    });

    const getData = () => {
      const form = document.getElementById(id);
      // get them all and use data-type to sort for type
      const data = {};
      Array.from(form.elements).forEach((el) => {
        if (el.tagName !== "FIELDSET") {
          let value;
          if (el.type === "checkbox") {
            value = el.checked;
          } else if (el.type === "file") {
            [value, ] = el.files;
          } else {
            value = el.value;
          }
          if (el.getAttribute("datatype") === "integer") {
            value = parseInt(value, 10);
          }
          if (el.getAttribute("datatype") === "array") {
            value = value.split(",").filter((item) => item !== "");
          }
          data[el.id] = value;
        }
      });
      return data;
    };

    // custom event called by form if passes validation
    this.addEventListener(`${id}.valid`, (ev) => {
      console.log("Got return event after validation", ev.detail.valid); // should be true
      if (ev.detail.valid === true) {
        // valid is true
        // call ModalWrapper method 'saveData'
        saveData(getData());
      }
    });

    const doSave = () => {
      const form = document.getElementById(id);
      // fire event listener for Form element - which fires the above
      try {
        // custom event - tell form to run validation
        form.dispatchEvent(
          new CustomEvent(`${id}.validate`, {
            bubbles: true,
          })
        );
      } catch (err) {
        console.log(err);
        formError = err;
        this.refresh();
      }
    };

    while (true)
      yield (
        <Fragment>
          <ShowLink
            name={name}
            color={color}
            title={title}
            showModal={showModal}
          />
          {visible && (
            <div
              class="db absolute left-0 w-100 h-100 z-1 bg-black-90 pa4"
              style={`top: ${Math.round(window.scrollY).toString()}px;`}
            >
              <div class="bg-white pa4 br3">
                <span
                  class="bn bg-transparent pa0 no-underline mid-gray dim o-70 absolute top-1 right-1"
                  name="close"
                  onClick={closeModal}
                  onKeyUp={keyUp}
                  role="button"
                  style="margin-right: 30px; margin-top: 30px;"
                  title="Close modal"
                  tabIndex={0}
                >
                  <CloseIcon />
                  <span class="dn">Close modal</span>
                </span>
                <div class="tc center">
                  <h2 class="fw4 fg-streamside-maroon">
                    {title}
                    .
                  </h2>
                </div>
                {fetchError && <Error msg={fetchError} />}
                {formError && <Error msg={formError} />}
                {saving && (
                  <div class="mv2 pt2 pl2 navy br3 ba b--navy bg-washed-blue">
                    <p class="tc">{saveMsg}</p>
                  </div>
                )}
                {success && (
                  <div class="mv2 pt2 pl2 br3 dark-green ba b--dark-green bg-washed-green">
                    <p class="tc">{successMsg}</p>
                  </div>
                )}
                {loading && <BarLoader />}
                {!loading && !success && !fetchError && (
                  <Component
                    {...props}
                    title={title}
                    formId={id}
                    doSave={doSave}
                    closeModal={closeModal}
                  />
                )}
              </div>
            </div>
          )}
        </Fragment>
      );
  };
}
