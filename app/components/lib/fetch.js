export const Fetch = async (src) =>
/**
* @module app/lib/fetch
* @author Darryl Cousins <darryljcousins@gmail.com>
*/
  fetch(src)
    .then(async (response) => {
      if (response.status !== 200) {
        throw new Error(JSON.stringify(await response.json()));
      }
      return response.json();
    })
    .then((json) => {
      console.log("Got this in GET fetch:", json);
      return { error: null, json };
    })
    .catch((error) => {
      console.log("Got error in GET fetch:", error);
      if (Object.prototype.hasOwnProperty.call(error, "err")) {
        return { error: error.err, json: null };
      }
      return { error, json: null };
    });

export const PostFetch = async ({ src, data, headers }) => {
  // use json if according to content-type
  const formdata =
    headers["Content-Type"] === "application/json"
      ? JSON.stringify(data)
      : data;

  const opts = {
    method: "POST",
    body: formdata,
  };

  // add headers if set in arguments - i.e. using none if sending files
  if (headers) opts.headers = headers;

  return fetch(src, opts)
    .then(async (response) => {
      if (response.status !== 200) {
        throw new Error(JSON.stringify(await response.json()));
      }
      console.log("Got this response in POST fetch", response);
      return response.json();
    })
    .then((json) => {
      console.log("Got this in POST fetch:", json);
      return { error: null, json };
    })
    .catch((error) => {
      console.log("Got error in POST fetch:", error);
      if (Object.prototype.hasOwnProperty.call(error, "err")) {
        return { error: error.err, json: null };
      }
      return { error, json: null };
    });
};
