/** @jsx createElement */
import {createElement} from '@bikeshaving/crank/cjs';

module.exports = function* () {
  let loaded = true;
  while (true) {
    yield (
      <div class="fl w-100 w-50-m w-third-l pa4">
        <div class="aspect-ratio aspect-ratio--1x1">
        {loaded ?
          <main class="pa4 black-80 center">
            <form class="measure center" method="post" action="/login">
              <fieldset id="sign_up" class="ba b--transparent ph0 mh0">
                <legend class="f4 fw6 ph0 mh0">Please login to continue</legend>
                <div class="mt3">
                  <label
                    class="db fw6 lh-copy f6" 
                    for="username">Email
                  </label>
                  <input
                    class="pa2 input-reset ba bg-transparent w-100" 
                    autocomplete="on"
                    type="text" name="username"  id="username" />
                </div>
                <div class="mv3">
                  <label class="db fw6 lh-copy f6" for="password">Password</label>
                  <input
                    class="b pa2 input-reset ba bg-transparent w-100"
                    autocomplete="on"
                    type="password" name="password"  id="password" />
                </div>
              </fieldset>
                <div class="">
                  <input
                    class="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib"
                    type="submit" value="Sign in" />
                </div>
            </form>
          </main>
          : <div class="spinner" />}
        </div>
      </div>
    );
  };
};
