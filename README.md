# conform.js
A tiny form submission utility library. Configure custom validation for individual fields and easily handle success and error states. 

**2.76kb gzipped.**

## Usage
```javascript
import conform from 'conform.js'

// CommonJS (via UMD)
var conform = require('conform.js/browser')
```

Create an instance by passing a wrapping element or your form itself, followed by an optional `options` object.
```javascript
const newsletter = conform(el, {
  method: 'POST',
  jsonp: 'callback',
  tests: [
    {
      name: /EMAIL|customer\[email\]/,
      validate: ({ value }) => /.+\@.+\..+/.test(value),
      success: () => {},
      error: () => {} 
    }
  ]
})

newsletter.on('success', ({ fields, res, req }) => console.log(res))
newsletter.on('error', ({ fields, res, req }) => console.log(err))
```

## Options

### method
Your normal HTTP methods. Defaults to `POST`.

### jsonp
Use JSONp instead of XMLHttpRequest. Defaults to `false`. To enable, *pass the name of the callback parameter* required by your service. Most are `callback`, but for instance, Mailchimp is `c`.

### tests
An array of objects corresponding to the form fields you want to validate. Use the `success` and `error` callbacks to add error states to individual fields Each object should contain the following:
- `name` - a string or regex used to match an fields's `name` attribute
- `validate` - a function that gets passed a field object to test against. If the function returns true, the field is valid. The field object looks like this:
  - `valid` - boolean, whether or not the field has passed validation 
  - `value` - the field's value
  - `name` - the `name` attribute on the field's input element
  - `node` - the input element itself
- `success` - fired if the field is validated successfully, the above field object is passed to the callback 
- `error` - fired if the field is validated unsuccessfully, the above field object is passed to the callback 

## API
```javascript
import conform from 'conform.js'

const form = conform(el)
```

### .on(event, data) 
Conform fires three events:

#### submit
When the form is initially submitted.
```javascript
form.on('submit', () => {
  // do stuff
  // show a loader
})
```

#### success
If the request completes successfully.
```javascript
form.on('success', ({ fields, res, req }) => {
  // handle response
})
```

#### error
If the request fails.
```javascript
form.on('error', ({ fields, res, req }) => {
  // handle response
})
```

## Dependencies 
- [nanoajax:](https://github.com/yanatan16/nanoajax) An ajax library you need a microscope to see. by [@yanatan16](https://github.com/yanatan16)
- [micro-jsonp:](https://github.com/estrattonbailey/micro-jsonp) A hyper-minimal standalone jsonp implementation in ES6. by [@estrattonbailey](https://github.com/estrattonbailey)
- [loop.js:](https://github.com/estrattonbailey/loop.js) Loop is a bare-bones pub/sub style event emitter. by [@estrattonbailey](https://github.com/estrattonbailey)

## TODO
1. Return optional form error messages for individual fields.

* * *
MIT License
