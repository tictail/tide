### 2.1.0 2018-01-12
* Add a new special property `tidePointer` on `TideComponent`. The `tidePointer` prop is an object that is supplied as the second argument to keypath functions. See https://github.com/tictail/tide/pull/29. 

### 2.0.0 2017-06-20
* Replace `react-pure-render/shallowEqual` with `shallowequal` 

### 2.0.0-alpha.3 2017-04-23
* React 15.5 support
* Nicer api for the logging plugin

### 2.0.0-alpha1 2017-03-07
* Major internal re-write to improve modularity and enable extensions.
* Breaking: `Base` is renamed to `Tide`
* Breaking: Changed the API for adding actions: `Tide.addActions` is remove in favor of `initActions`
* Breaking: Changed api for logging. Logging is now separated into different and need to be enabled one by one.
* Breaking: Removed magic 'toJS()' handling in Component.
* New feature: Added namespaces for actions.
* New feature: `wrap` takes a third argument, a map of transform functions that props are passed through when they are updated.
* New feature: `Tide.addMiddleWare`, a hook to add middleware that intercepts state changes.
* New feature: `Tide.addProp`, a hook to safely monkey patch props onto a tide instance.
* New feature: `Tide.addComponentProp`, a hook to add properties to the props of `TideComponent`.
* [Upgrade guide](TODO)

### 1.2.1 2016-11-23
* Fix breaking bug introduced in 1.2.0 when trying to access `tide` from context in `TideComponent`
* Fix breaking bug when trying to directly nest multiple `TideComponent`s

### 1.2.0 2016-11-21
* Add support for defining a key path as a function in a Tide component. The function receives the current state as its only argument, and should return the key path in one of the other supported forms.

### 1.1.0 2016-11-09
* Add a parameter `{immediate: true}` to `setState`, `updateState` and `mutate` to make the change event emit immediately instead of deferring it. See `https://github.com/tictail/tide/issues/11`.

### 1.0.3 2016-10-13
* Move package to `tide` on npm

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
