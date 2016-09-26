import nanoajax from 'nanoajax'
import jsonp from 'micro-jsonp'
import events from 'loop.js'

const merge = (target, ...args) => {
  args.forEach(a => Object.keys(a).forEach(k => target[k] = a[k]))
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
  let fields = [].slice.call(form.querySelectorAll('[name]')) || false

  if (!fields){ return }

  return fields.map(f => ({
    name: f.getAttribute('name'),
    value: f.value || undefined,
    valid: true,
    node: f
  }))
} 

const runValidation = (fields, tests) => tests.forEach((test => {
  let field = fields.filter(f => test.name instanceof RegExp ? test.name.test(f.name) : test.name === f.name)[0]

  if (!field){ return }

  if (test.validate(field)){
    if (test.success) { test.success(field) }
    field.valid = true
  } else {
    if (test.error) { test.error(field) }
    field.valid = false 
  }
}))

const scrubAction = (base, data) => {
  const query = base.match(/\?/) ? true : false
  return `${base}${query ? '&' : '?'}${toQueryString(data)}`
}

export default (root, options = {}) => {
  const form = root.getAttribute('action') ? root : root.getElementsByTagName('form')[0]
  let fields = getFormFields(form) 
  const instance = Object.create(events({
    getFields: () => fields
  }))
  
  merge(instance, {
    method: 'POST',
    tests: [],
    action: form.getAttribute('action'),
    jsonp: false 
  }, options)

  function jsonpSend(){
    jsonp(scrubAction(instance.action, fields), {
      param: instance.jsonp,
      response: (err, data) => {
        let o = { fields, res: err ? err : data, req: null }
        err ? instance.emit('error', o) : instance.emit('success', o)
      }
    })
  } 

  function send(){
    return nanoajax.ajax({
      url: instance.action,
      body: toQueryString(fields),
      method: instance.method
    }, (status, res, req) => {
      let success = status >= 200 && status <= 300
      let o = { fields, res, req }
      success ? instance.emit('success', o) : instance.emit('error', o)
    })
  }

  form.onsubmit = e => {
    e.preventDefault()

    instance.emit('submit')

    fields = getFormFields(form)

    runValidation(fields, instance.tests)

    if (isValid(fields)){
      !!instance.jsonp ? jsonpSend() : send()
    }
  }

  return instance
}
