# conform.js
A tiny zero-dependency form utility. **~930bytes gzipped.**

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](http://standardjs.com)

## Usage
```html
<form id='myForm' action='/submit'>
  <input name='name' />
  <input name='email' type='email' />
  <input name='address[street]' />
  <input name='address[city]' />
  <input name='address[state]' />
  <input name='address[zip]' />
</form>
```

```javascript
import conform from 'conform.js'

const form = document.getElementById('myForm')

const myForm = conform(form, {
  email: (node) => {
    return /.+\@.+\..+/.test(node.value)
  },
	'address[*]': (node) => {
  	return node.value !== ''
  }
}, (err, formValues) => {
	if (err) {
  	console.error(err)
  } else {
    fetch(form.action, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(formValues) // { name: '', email: '', ... } etc
    }).then(res => res.json()).then(res => {
      // success
    })
	}
})

/**
 * Remove form submit listener
 */
myForm.destroy()
```

**MIT License**
