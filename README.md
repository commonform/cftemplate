# Installation

```shell
npm install --global cftemplate
```

# Use

```shell
cftemplate form.cftemplate variables.json > form.cform
```

# Template Directives

- `(( publisher/projects@edition ))` includes a project from api.commonform.org.

- `(( 543cd5e172cfc6b3c20a0d91855fea44b5bf2fd1da7bf6b7c69f95d6e2705c37 ))` includes a form from api.commonform.org.

- `(( require file.cftemplate ))` includes another cftemplate.

- `(( require directory/file.cform ))` includes a Common Form markup file.

- `(( require other/directories/file.json ))` includes a Common Form JSON file

- `(( if x begin ))more markup(( end ))` includes `more markup` only if there is an `x` template variable and its value is truthy.

- `(( unless x begin ))more markup(( end ))` includes `more markup` only if there isn't any `x` template variable or its value is falsey.

# but wait, there's more business logic

Maybe you subscribe to the Model-View-Controller school of thought. Maybe the View changes, based on the business logic, which ground to the data model. In other words, you use `if` and `unless` conditionals in the `cftemplate` to switch blocks of text on and off. The propositions in those `if/unless` conditions may be determined by business rules operating against the values in your `variables.json`.

With a third, optional, argument,

```shell
cftemplate form.cftemplate variables.json logic.js > form.cform
```

`logic.js` contains template-specific business logic that extends `variables.json` with control parameters computed from those data variables.

Those control parameters will be present during the evaluation of the `form.cftemplate`.

If no `logic.js` is provided your control parameters will have to be present in `variables.json` directly.

`logic.js` is also a good place to put other code to mutate or extend user-supplied `variables.json`.

The business logic is up to you. If you want you can write TypeScript or whatever as long as it provides the right interface.


