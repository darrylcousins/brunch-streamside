# Calling the api

Call on browser action should always use app/components/fetch. Fetch will
handle the error when status is not 200. The action can therefore rely on
'error' and 'json' in the result.

In api/queries it will send either 200 or not.

The source api method can then comfortably throw an error and expect it to get up the line to Fetch.
