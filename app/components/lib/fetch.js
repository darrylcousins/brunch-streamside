'use-strict';

require('isomorphic-fetch');

exports.Fetch = async (src) => {
  return await fetch(src)
    .then(async response => {
      if (response.status !== 200) {
        throw { msg: 'Fetch Error', err: JSON.stringify(await response.json()) };
      }
      return response.json();
    })
    .then((json) => {
      console.log('Got this in GET fetch:', json);
      return { error: null, json };
    })
    .catch(error => {
      console.log('Got error in GET fetch:', error);
      if (error.hasOwnProperty('err')) {
        return { error: error.err, json: null };
      };
      return { error: error, json: null };
    })
};

exports.PostFetch = async ({src, data}) => {
  return await fetch(src, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(async response => {
      if (response.status !== 200) {
        throw { msg: 'Fetch Error.', err: JSON.stringify(await response.json()) };
      };
      console.log('Got this response in POST fetch', response);
      return response.json();
    })
    .then(json => {
      console.log('Got this in POST fetch:', json);
      return { error: null, json };
    })
    .catch(error => {
      console.log('Got error in POST fetch:', error);
      if (error.hasOwnProperty('err')) {
        return { error: error.err, json: null };
      };
      return { error: error, json: null };
    });
};
