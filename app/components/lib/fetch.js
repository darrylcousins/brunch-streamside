'use-strict';

require('isomorphic-fetch');

module.exports = async (src) => {
  return await fetch(src)
    .then(async response => {
      if (response.status !== 200) {
        throw { msg: 'Fetch Error.', err: JSON.stringify(await response.json()) };
      }
      console.log('Got this response in fetch', response);
      return response.json();
    })
    .then((json) => {
      console.log('Got this in fetch:', json);
      return { error: null, json };
    })
    .catch(function(error) {
      console.log('Got error in fetch:', error);
      if (error.hasOwnProperty('err')) {
        return { error: error.err, json: null };
      };

      return { error: error, json: null };
    })
};

