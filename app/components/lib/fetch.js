'use-strict';

require('isomorphic-fetch');

module.exports = async (src) => {
  return await fetch(src)
    .then(async response => {
      if (response.status !== 200) {
        throw { msg: 'Fetch Error.', err: JSON.stringify(await response.json()) };
      }
      return response.json();
    })
    .then((json) => {
      console.log('Got this in fetch:', json);
      return { error: null, json };
    })
    .catch(function(error) {
      return { error, json: null };
    })
};

