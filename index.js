import nanoajax from 'nanoajax'
import jsonp from 'micro-jsonp'

const origin = window.location.origin || window.location.protocol+'//'+window.location.host

const getAction = (form) => {
  let action = form.getAttribute('action')
  return action.split(/\#/)[0]
}

/**
 * Merge two objects into a 
 * new object
 *
 * @param {object} target Root object
 * @param {object} source Object to merge 
 *
 * @return {object} A *new* object with all props of the passed objects
 */
export const merge = (target, ...args) => {
  for (let i = 0; i < args.length; i++){
    let source = args[i]
    for (let key in source){
      if (source[key]) target[key] = source[key]
    }
  }

  return target 
}

const toQueryString = (fields) => {
  let data = ''
  let names = Object.keys(fields)

  for (let i = 0; i < names.length; i++){
    let field = fields[names[i]]
    data += `${encodeURIComponent(field.name)}=${encodeURIComponent(field.value || '')}${i < names.length -1 ? '&' : ''}`
  }

  return data
}

const isValid = (fields) => {
  let keys = Object.keys(fields)

  for (let i = 0; i < keys.length; i++){
    let field = fields[keys[i]]
    if (!field.valid) return false
  }

  return true
}

const getFormFields = (form) => {
  let fields = [].slice.call(form.querySelectorAll('[name]'))

  if (!fields) return

  return fields.reduce((result, field) => {
    result[field.getAttribute('name')] = {
      valid: true,
      name: field.getAttribute('name'),
      value: field.value || undefined,
      field
    }

    return result
  }, {}) 
} 

const runValidation = (fields, tests) => tests.forEach((test => {
  let field = fields[test.name]

  if (test.validate(field)){
    test.success(field)
    field.valid = true
  } else {
    test.error(field)
    field.valid = false 
  }
}))

const jsonpSend = (action, fields, successCb, errorCb) => {
  jsonp(`${action}&${toQueryString(fields)}`, {
    param: 'c',
    response: (err, data) => {
      err ? errorCb(fields, err, null) : successCb(fields, data, null)
    }
  })
} 

const send = (action, fields, successCb, errorCb) => nanoajax.ajax({
  url: `${action}&${toQueryString(fields)}`,
  method: 'GET'
}, (status, res, req) => {
  let success = status >= 200 && status <= 300
  success ? successCb(fields, res, req) : errorCb(fields, res, req)
})

export default (form, options = {}) => {
  form = form.getAttribute('action') ? form : form.getElementsByTagName('form')[0]

  const instance = Object({})

  merge(instance, {
    success: (data, response) => {},
    error: (data, response) => {},
    action: getAction(form),
    tests: []
  }, options)

  form.onsubmit = (e) => {
    e.preventDefault()

    instance.fields = getFormFields(form)

    runValidation(instance.fields, instance.tests)

    isValid(instance.fields) ?
      !!instance.jsonp ? 
        jsonpSend(instance.action, instance.fields, instance.success, instance.error)
        : send(instance.action, instance.fields, instance.success, instance.error)
      : instance.error(fields)
  }

  return instance
}
