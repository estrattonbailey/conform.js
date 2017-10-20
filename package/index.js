export default function Conform (form, fields, done) {
  let data = {}

  function onSubmit (e) {
    e.preventDefault()

    let tests = []

    for (let name in fields) {
      tests.push({
        test: new RegExp(
          name.replace(/[-[\]{}()+?.,\\^$|#\s]/g, '\\$&').replace(/\*/g, '(?:.*)')
        ),
        handler: fields[name]
      })
    }

    let valid = []

    for (let { test, handler } of tests) {
      for (let el of form.elements) {
        if (/INPUT|SELECT|TEXTAREA/.test(el.nodeName)) {
          test.test(el.name) && valid.push(handler(el))
        }
      }
    }

    if (valid.indexOf(false) > -1) {
      return done && done(`One or more fields is invalid.`)
    }

    for (let el of form.elements) {
      if (/INPUT|SELECT|TEXTAREA/.test(el.nodeName)) {
        data[el.name] = el.value
      }
    }

    done && done(null, data)
  }

  form.addEventListener('submit', onSubmit)

  return {
    destroy () {
      form.removeEventListener('submit', onSubmit)
    }
  }
}
