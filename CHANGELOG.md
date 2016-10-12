### 1.0.2 2016-10-12
* Only bumping version to re-publish to NPM.
* Add description in `package.json`.

### 1.0.1 2016-10-11
* Remove duplicates of `eslint-plugin-mocha` and `eslint-plugin-react` in `package.json`.

### 1.0.0 2016-09-12
* Rename package to `tictail-tide`
* Public release

### 1.0.0-beta 2016-03-09
* Defer state updates
* Re-written in es6
* TideComponent uses setState instead of forceUpdate()
* Component logging removed

### 0.7.0 2016-03-09
* Only use `console.group` for logging when available in the browser.

### 0.6.1 2015-12-09
* Only use `console.group` for logging when available in the browser.

### 0.6.0 2015-12-03
* If there is no set state in a given `keyPath`, `TideComponent` **should not** pass `undefined` to the wrapped component as a prop. Therefore, the wrapped component's `defaultProps` will be available

### 0.5.0 2015-11-30
* Update React to 0.14

### 0.4.0 2015-11-18
* Components created with `wrap` now re-render when given new properties from the parent.

### 0.3.0 2015-11-04
* `enableLogging` should no longer automatically bind all action methods to their instance.

### 0.2.0 2015-11-03
* `Tide.wrap` has been moved to its own module. The function is now accessible through `import {wrap} from 'tictail-tide'`
