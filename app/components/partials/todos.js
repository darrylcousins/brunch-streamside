/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';

import BarLoader from '../lib/bar-loader';
import Error from '../lib/error';
import { Fetch } from '../lib/fetch';
import {
  DeleteIcon,
  EditIcon
} from '../lib/icon';
import Button from '../lib/button';
import FilterSelect from '../form/filter-select';
import FilterPill from '../form/filter-pill';
import EditTodoModal from './todo-edit';
import RemoveTodoModal from './todo-remove';
import fields from './todo-fields';

function *CurrentTodos() {
  let fetchJson = Array();
  let fetchError = null;
  let loading = true;
  let filters = {
    author: [],
    tags: [],
    completed: [0, 1]
  };

  const mapCompletedFilters = (arr) => {
    if (arr.length > 1) return [];
    return arr.map(el => {
      if (el === 0) return 'Todo';
      if (el === 1) return 'Completed';
    }).filter(el => el !== 'All');
  };

  for (const _  of this) {

    const getQueryString = (filters) => {
      const url = '/api/current-todos';
      let qs = '?';
      filters.completed.forEach(bool => qs += `&completed=${bool}`);
      filters.author.forEach(author => qs += `&author=${author}`);
      filters.tags.forEach(tag => qs += `&tags=${tag}`);
      return qs;
    };

    const fetchData = (filters) => {
      Fetch(`/api/current-todos${getQueryString(filters)}`)
        .then(result => {
          const { error, json } = result;
          if (error !== null) {
            fetchError = error;
            loading = false;
            this.refresh();
          } else {
            fetchJson = json;
            loading = false;
            this.refresh();
          };
        })
        .catch(err => {
          fetchError = err;
          loading = false;
          this.refresh();
        });
    };

    fetchData(filters);

    const addFilter = (name, type) => {
      if (['All', 'Author', 'Tags'].includes(name)) return;
      if (type === 'completed') {
        if (name === 'Completed') filters[type] = [1];
        if (name === 'Todo') filters[type] = [0];
        filters = Object.assign({}, filters);
        fetchData(filters);
      } else {
        if (!filters[type].includes(name)) {
          filters[type].push(name);
          filters = Object.assign({}, filters);
          fetchData(filters);
        }
      }
    };

    const removeFilter = (name, type) => {
      if (type === 'completed') {
        filters[type] = [0, 1];
        filters = Object.assign({}, filters);
        fetchData(filters);
      } else {
        if (filters[type].includes(name)) {
          filters[type] = filters[type].filter(el => el !== name);
          filters = Object.assign({}, filters);
          fetchData(filters);
        }
      }
    };


    while (true) {
      yield (
        <div class="">
          <div class="mb3 pr4 tr w-100">
            <span class="mr2">Filters:</span>
            <FilterSelect name="author" position="left"
              crank-key="author-filter"
              callback={ addFilter }
              type="author"
              fields={ ['Author', ...fields['Author'].datalist.filter(el => !filters.author.includes(el)) ] } />
            <FilterSelect name="tags" position="center"
              crank-key="tag-filter"
              callback={ addFilter }
              type="tags"
              fields={ ['Tags', ...fields['Tags'].datalist.filter(el => !filters.tags.includes(el))] } />
            <FilterSelect name="completed" position="right"
              callback={ addFilter }
              crank-key="completed-filter"
              type="completed"
              fields={ ['All', 'Completed', 'Todo'] } />
          </div>
          <div class="pr4 tr w-100">
            { filters.author.map(author => (
              <FilterPill name={ author }
                crank-key={ author.toLowerCase() }
                type="author"
                callback={ removeFilter } />
            ))}
            { filters.tags.map(tag => (
              <FilterPill name={ tag }
                crank-key={ tag.toLowerCase() }
                type="tags"
                callback={ removeFilter } />
            ))}
                { mapCompletedFilters(filters.completed).map(el => (
              <FilterPill name={ el }
                crank-key={ el.toLowerCase() }
                type="completed"
                callback={ removeFilter } />
            ))}
          </div>
          <h2 class="pt0 f5 f4-ns lh-title-ns ma0 fg-streamside-maroon">Todos</h2>
          { fetchError && <Error msg={fetchError} /> }
          { loading && <BarLoader /> }
          { fetchJson.length > 0 ? (
            <div class="flex flex-wrap">
              { 
                fetchJson.map((todo, index) => (
                  <div class="mv2 ph1 w-100 w-third-ns mw9">
                    <article class="br2 ba dark-gray b--black-10">
                      <div class="pa2 ph3-ns pb3-ns">
                        <div class="dt w-100 mt1">
                          <div class="dtc">
                            <h1 class="f5 f4-ns mv0">
                              <span class={ `${todo.completed && 'strike' }` }> { todo.title }</span> { todo.completed && <span>✓</span> }
                            </h1>
                          </div>
                          <div class="dtc tr">
                            <h2 class="f5 mv0"><small class="fw3 ttu tracked fg-streamside-orange">{ todo.author }</small></h2>
                            <h2 class="f5 mv0"><small class="fw3 ttu tracked fg-streamside-maroon">{ todo.created }</small></h2>
                            <h2 class="f5 mv0">
                              <small class="fw3 ttu tracked fg-streamside-blue">
                                { (todo.tags.length === 0) ? '' : (
                                  todo.tags.map(el => <span class="db">{ el }</span>)
                                ) }
                              </small>
                            </h2>
                            <EditTodoModal todo={ todo } />
                            <RemoveTodoModal todo={ todo } />
                          </div>
                        </div>
                        <p class="f6 lh-copy mw6 mt2 mid-gray">
                          { todo.note }
                        </p>
                      </div>
                    </article>
                  </div>
                ))
              }
            </div>
          ) : (
            <p class="lh-copy">No todos found.</p>
          )}
        </div>
      );
    };
  };
};

module.exports = CurrentTodos;
