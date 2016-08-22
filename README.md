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
