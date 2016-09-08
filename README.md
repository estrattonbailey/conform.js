# Conform.js
A simple, unopinionated form submission utility library. Configure custom validation for individual fields and easily handle success and error states. **2.39kb gzipped.**

# Usage
The `success` and `error` callbacks do nothing by default, so provide your own handlers and errors states. Same for individual tests.
```javascript
import conform from 'conform.js'

const newsletter = conform(el, {
  method: 'POST',
  jsonp: true, // default false
  success: (fields, res, req) => {},
  error: (fields, res, req) => {},
  tests: [
    {
      name: /EMAIL|customer\[email\]/, // string or regex
      validate: (field) => {
        return field.value.match(/.+\@.+\..+/) ? true : false
      },
      success: () => {},
      error: () => {} 
    }
  ]
})
```

* * *
MIT License
