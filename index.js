import nanoajax from 'nanoajax'
import jsonp from 'micro-jsonp'

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

const send = (method, action, fields, successCb, errorCb) => nanoajax.ajax({
  url: `${action}&${toQueryString(fields)}`,
  method: method 
}, (status, res, req) => {
  let success = status >= 200 && status <= 300
  success ? successCb(fields, res, req) : errorCb(fields, res, req)
})

export default (form, options = {}) => {
  form = form.getAttribute('action') ? form : form.getElementsByTagName('form')[0]

  const instance = {
    method: options.method || 'POST',
    success: options.success ? options.success : (fields, res, req) => {},
    error: options.error ? options.error : (fields, res, req) => {},
    tests: options.tests || [],
    action: form.getAttribute('action'),
    jsonp: options.jsonp || false
  } 

  form.onsubmit = (e) => {
    e.preventDefault()

    instance.fields = getFormFields(form)

    runValidation(instance.fields, instance.tests)

    isValid(instance.fields) ?
      !!instance.jsonp ? 
        jsonpSend(instance.action, instance.fields, instance.success, instance.error)
        : send(instance.method, instance.action, instance.fields, instance.success, instance.error)
      : instance.error(fields)
  }

  return instance
}
