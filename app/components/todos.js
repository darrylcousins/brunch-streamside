/** @jsx createElement */
/**
 * Provide display of todos
 *
 * @module app/components/todos
 * @exports CurrentTodos
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement } from "@bikeshaving/crank/cjs";
import BarLoader from "../lib/bar-loader";
import Error from "../lib/error";
import { Fetch } from "../lib/fetch";
import FilterSelect from "../form/filter-select";
import FilterPill from "../form/filter-pill";
import EditTodoModal from "./todo-edit";
import RemoveTodoModal from "./todo-remove";
import fields from "./todo-fields";

/**
 * Fetch todos from api and construct component
 *
 * @generator
 * @yields {Element} DOM component of listing todos
 */
function* CurrentTodos() {
  /**
   * Json object containing todos returned from api
   *
   * @member {object} fetchJson
   */
  let fetchJson = [];
  /**
   * If fetch returns an error
   *
   * @member {object|string} fetchError
   */
  let fetchError = null;
  /**
   * True while loading data from api
   *
   * @member {boolean} loading
   */
  let loading = true;
  /**
   * Object holding current filters
   *
   * @member {object} loading
   */
  let filters = {
    author: [],
    tags: [],
    completed: [0],
  };

  /**
   * Method to handle special case of `completed` as a filter
   *
   * @function mapCompletedFilters
   * @param {Array} arr The array of filters
   */
  const mapCompletedFilters = (arr) => {
    if (arr.length > 1) return [];
    return arr
      .map((el) => (el === 0 ? "Todo" : "Completed"))
      .filter((el) => el !== "All");
  };

  /**
   * Method to construct query string to include current filters when fetching
   * todos from api
   *
   * @function getQueryString
   * @param {Array} parts The array of parts used to construct query string
   */
  const getQueryString = (parts) => {
    let qs = "?";
    parts.completed.forEach((bool) => {
      qs += `&completed=${bool}`;
    });
    parts.author.forEach((author) => {
      qs += `&author=${author}`;
    });
    parts.tags.forEach((tag) => {
      qs += `&tags=${tag}`;
    });
    return qs;
  };

  /**
   * Fetch data from api and set `fetchJson` and `fetchError` dependent on result
   *
   * @function fetchData
   * @param {Array} parts The array of parts used to construct query string
   */
  const fetchData = (parts) => {
    Fetch(`/api/current-todos${getQueryString(parts)}`)
      .then((result) => {
        const { error, json } = result;
        if (error !== null) {
          fetchError = error;
          loading = false;
          this.refresh();
        } else {
          console.log(json);
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

  fetchData(filters);

  /**
   * When filters are selected refetch the data from api
   *
   * @function addFilter
   * @param {string} name The string to be included in filters
   * @param {string} type The type of filter: completed, author etc
   */
  const addFilter = (name, type) => {
    const { ...parts } = filters;
    if (["All", "Author", "Tags"].includes(name)) return;
    if (type === "completed") {
      if (name === "Completed") parts[type] = [1];
      if (name === "Todo") parts[type] = [0];
      filters = { ...parts };
      fetchData(filters);
    } else if (!parts[type].includes(name)) {
      parts[type].push(name);
      filters = { ...parts };
      fetchData(filters);
    }
  };

  /**
   * When a filter is removed refetch the data from api
   *
   * @function removeFilter
   * @param {string} name The string to be removed from filters
   * @param {string} type The type of filter: completed, author etc
   */
  const removeFilter = (name, type) => {
    const { ...parts } = filters;
    if (type === "completed") {
      parts[type] = [0, 1];
      filters = { ...parts };
      fetchData(filters);
    } else if (parts[type].includes(name)) {
      parts[type] = parts[type].filter((el) => el !== name);
      filters = { ...parts };
      fetchData(filters);
    }
  };

  /**
   * Get the array of authors for dropdown list
   *
   * @function getAuthorFields
   * @returns {Array} Array of strings
   */
  const getAuthorFields = () => [
    "Author",
    ...fields.Author.datalist.filter((el) => !filters.author.includes(el)),
  ];

  /**
   * Get the array of tags for dropdown list
   *
   * @function getTagFields
   * @returns {Array} Array of strings
   */
  const getTagFields = () => [
    "Tags",
    ...fields.Tags.datalist.filter((el) => !filters.tags.includes(el)),
  ];

  while (true) {
    yield (
      <div class="">
        <div class="mb3 pr4 tr w-100">
          <span class="mr2">Filters:</span>
          <FilterSelect
            name="author"
            position="left"
            crank-key="author-filter"
            callback={addFilter}
            type="author"
            fields={getAuthorFields()}
          />
          <FilterSelect
            name="tags"
            position="center"
            crank-key="tag-filter"
            callback={addFilter}
            type="tags"
            fields={getTagFields()}
          />
          <FilterSelect
            name="completed"
            position="right"
            callback={addFilter}
            crank-key="completed-filter"
            type="completed"
            fields={["All", "Completed", "Todo"]}
          />
        </div>
        <div class="pr4 tr w-100">
          {filters.author.map((author) => (
            <FilterPill
              name={author}
              crank-key={author.toLowerCase()}
              type="author"
              callback={removeFilter}
            />
          ))}
          {filters.tags.map((tag) => (
            <FilterPill
              name={tag}
              crank-key={tag.toLowerCase()}
              type="tags"
              callback={removeFilter}
            />
          ))}
          {mapCompletedFilters(filters.completed).map((el) => (
            <FilterPill
              name={el}
              crank-key={el.toLowerCase()}
              type="completed"
              callback={removeFilter}
            />
          ))}
        </div>
        <h2 class="pt0 f5 f4-ns lh-title-ns ma0 fg-streamside-maroon">Todos</h2>
        {fetchError && <Error msg={fetchError} />}
        {loading && <BarLoader />}
        {fetchJson.length > 0 ? (
          <div class="flex flex-wrap">
            {fetchJson.map((todo) => (
              <div class="mv2 ph1 w-100 w-third-ns mw9">
                <article class="br2 ba dark-gray b--black-10">
                  <div class="pa2 ph3-ns pb3-ns">
                    <div class="dt w-100 mt1">
                      <div class="dtc">
                        <h1 class="f5 f4-ns mv0">
                          <span class={`${todo.completed && "strike"}`}>
                            {" "}
                            {todo.title}
                          </span>{" "}
                          {todo.completed && <span>✓</span>}
                        </h1>
                      </div>
                      <div class="dtc tr">
                        <h2 class="f5 mv0">
                          <small class="fw3 ttu tracked fg-streamside-orange">
                            {todo.author}
                          </small>
                        </h2>
                        <h2 class="f5 mv0">
                          <small class="fw3 ttu tracked fg-streamside-maroon">
                            {todo.created}
                          </small>
                        </h2>
                        <h2 class="f5 mv0">
                          <small class="fw3 ttu tracked fg-streamside-blue">
                            {todo.tags.length === 0
                              ? ""
                              : todo.tags.map((el) => (
                                <span class="db">{el}</span>
                              ))}
                          </small>
                        </h2>
                        <span class="dn">{todo._id}</span>
                        <EditTodoModal todo={todo} />
                        <RemoveTodoModal todo={todo} />
                      </div>
                    </div>
                    <p class="f6 lh-copy mw6 mt2 mid-gray">{todo.note}</p>
                  </div>
                </article>
              </div>
            ))}
          </div>
        ) : (
          <p class="lh-copy">No todos found.</p>
        )}
      </div>
    );
  }
}

export default CurrentTodos;
