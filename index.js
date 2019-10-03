const _letterNumberRegex = /([0-9]+)([a-z%]{1,3})|([0-9]+)/i

const _hexToRgbRegex = /^#?(([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})|([a-f\d]{1})([a-f\d]{1})([a-f\d]{1}))$/i

const _hslMatchRegex = /^hsl\(\s*(\d+)\s*,\s*(\d*(?:\.\d+)?%)\s*,\s*(\d*(?:\.\d+)?%)\)$/i
const _hslaMatchRegex = /^hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*(\d*(?:\.\d+)?)\)$/i
const _rgbMatchRegex = /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/i
const _rgbaMatchRegex = /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d*(?:\.\d+)?)\)$/i
const _hexMatchRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i

Math.easeInOutQuad = function(t, b, c, d) {
  t /= d / 2
  if (t < 1) return (c / 2) * t * t + b
  t--
  return (-c / 2) * (t * (t - 2) - 1) + b
}

class Easer {
  constructor(options) {
    const _realOptions = {
      delay: options.delay || 0,
      duration: options.duration || [0],
      from: options.from || [0],
      to: options.to || [0],
      value: options.value || [0],
      node: options.node || null,
      property: options.property || null,
      style: options.style || false,
      transition: options.transition || null,
      color: options.color || false,
      chainMaster: options.chainMaster || false,
      chained: options.chained || false,
      instances: options.instances || [],
    }
    this.options = _realOptions
    this._currentTime = 0
    this._increment = 15
    this._converted = false
    this._options = {
      _from: [0], //px
      _to: [0], //px
      _color: {
        _from: [0, 0, 0, 0, 0], //rgba
        _to: [255, 255, 255, 1], //rgba
      }
    }
  }

  _getOptions() {
    return this.options
  }

  _setOption(f, v) {
    this.options[f] = v
  }

  _alterOption(f, v) {
    if(typeof f === 'object') {
      return {...this._getOptions(),
        ...f}
    } else if(typeof f === 'string' && v) {
      return {...this._getOptions(),
        [f]: v
      }
    }
  }

  _printOptions(param) {
    const options = this._getOptions()
    if (param && typeof param === 'string') {
      console.log(options[param])
    } else {
      console.log(options)
    }
    return this._generateNew(this._getOptions())
  }

  _getPrivateOptions() {
    return this._options
  }

  _setPrivateOption(f, v) {
    this._options[`_${f}`] = v
  }

  _printPrivateOptions() {
    console.log(this._getPrivateOptions())
  }

  _setConverted(bool) {
    this._converted = bool
  }

  _generateNew(options) {
    return new Easer(options)
  }

  _generateCopy() {
    return this._generateNew(this._getOptions())
  }

  _generateAltered(f, v) {
    return this._generateNew(this._alterOption(f, v))
  }

  _selectNode(param) {
    const el = typeof param === "string" ? document.querySelector(param) : param
    return el
  }

  _testColorProp(str) {
    return (
      _hexMatchRegex.test(str)
      || _hslMatchRegex.test(str)
      || _hslaMatchRegex.test(str)
      || _rgbMatchRegex.test(str)
      || _rgbaMatchRegex.test(str)
    )
  }

  _convertColorToRgba(str) {
    if(_rgbMatchRegex.test(str)) {
      const [ match, r, g, b ] = _rgbMatchRegex.exec(str)
      return [ parseInt(r), parseInt(g), parseInt(b), 1 ]
    } else if(_rgbaMatchRegex.test(str)) {
      const [ match, r, g, b, a ] = _rgbaMatchRegex.exec(str)
      return [ parseInt(r), parseInt(g), parseInt(b), Number(a) ]
    } if(_hexMatchRegex.test(str)) {
      return this._hexToRgb(str)
    } else if(_hslMatchRegex.test(str)) {
      const [ match, h, s, l ] = _hslMatchRegex.exec(str)
      return [ ...this._hslToRgb(h, s, l), 1 ]
    } else if(_hslaMatchRegex.test(str)) {
      const [ match, h, s, l, a ] = _hslaMatchRegex.exec(str)
      return [ ...this._hslToRgb(h, s, l), Number(a) ]
    }
  }

  _hslToRgb(h, s, l) {
    h = parseInt(h)
    s = parseInt(s) / 100
    l = parseInt(l) / 100
    let r, g, b
    if (s == 0) {
      r = g = b = l // achromatic
    } else {
      let q = l < 0.5 ? l * (1 + s) : l + s - l * s
      let p = 2 * l - q
      r = this._hueToRgb(p, q, h + 1 / 3)
      g = this._hueToRgb(p, q, h)
      b = this._hueToRgb(p, q, h - 1 / 3)
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
  }

  _hueToRgb(p, q, t) {
    if (t < 0) {
      t += 1
    }
    if (t > 1) {
      t -= 1
    }
    if (t < 1 / 6) {
      return p + (q - p) * 6 * t
    }
    if (t < 1 / 2) {
      return q
    }
    if (t < 2 / 3) {
      return p + (q - p) * (2 / 3 - t) * 6
    }
    return p
  }

  _hexToRgb(hex) {
    const result = _hexToRgbRegex.exec(hex)
    if(hex.length > 4) { 
      return [
        parseInt(result[2], 16),// r
        parseInt(result[3], 16),// g
        parseInt(result[4], 16),// b
        1 // a
      ]
    } else {
      return [
        parseInt(result[5], 16) * 16,
        parseInt(result[6], 16) * 16,
        parseInt(result[7], 16) * 16,
        1
      ]
    }
  }

  _evalInput(param, propToChange) {
    if (typeof param === 'number' || param === 0) {
      this._setOption(propToChange, this._splitValue(String(param)))
      // return this._generateAltered(propToChange, this._splitValue(String(param)))
    } else if (typeof param == 'string') {
      if (this._testColorProp(param)) {
        this._setOption(propToChange, param)
        this._setOption('color', true)
        // return this._generateAltered({ [propToChange]: param, color: true })
      } else {
        this._alterOption({})
        this._setOption(propToChange, this._splitValue(param))
        // return this._generateAltered(propToChange, this._splitValue(param))
      }
    } else {
      throw 'from property must be string or number'
    }
  }

  _splitValue(str) {
    return str.split(' ').map(item => {
      const [match, number, unit, aloneNumber] = item.match(_letterNumberRegex)
      if (match) {
        if (number) {
          return [parseInt(number, 10), String(unit).toLowerCase()]
        } else {
          return [parseInt(aloneNumber, 10)]
        }
      } else {
        throw 'error splitvalue'
      }
    })[0]
  }

  _convertToPixel(val) {
    const {
      node
    } = this._getOptions()
    let [number, unit] = val
    if (node) {
      if (!unit) {
        return number
      } else {
        switch (unit) {
          case 'px':
            return number
          case 'rem':
            return this._handleRem(number)
          case 'em':
            return this._handleEm(number)
          case '%':
            return this._handlePercentage(number)
          case 'vh':
            return this._handleViewportHeight(number)
          case 'vw':
            return this._handleViewportWidth(number)
          default:
            throw 'unknown unit used'
        }
      }
    } else {
      throw `can't use css units without node and style methods`
    }
  }

  _handleRem(n) {
    const baseline = this._convertToPixel(this._splitValue(window.getComputedStyle(document.body).fontSize))
    return n * baseline
  }

  _handleEm(n) {
    const {
      node
    } = this._getOptions()
    const parent = node.parentNode
    const baseline = this._convertToPixel(this._splitValue(window.getComputedStyle(parent).fontSize))
    return n * baseline
  }

  _handlePercentage(n) {
    const {
      node,
      property
    } = this._getOptions()
    if (property) {
      const parent = node.parentNode
      return this._convertToPixel(this._splitValue(window.getComputedStyle(parent)[property])) / 100 * n
    } else {
      throw 'must provide property to use percentage'
    }
  }

  _handleViewportHeight(n) {
    return window.innerHeight / 100 * n
  }

  _handleViewportWidth(n) {
    return window.innerWidth / 100 * n
  }

  _formatStyleProperty(prop) {
    if (prop.includes('-')) {
      const formated = prop.split('-').map((str, index) => {
        if (index > 0) {
          return str.charAt(0).toUpperCase() + str.slice(1)
        } else {
          return str
        }
      }).join('')
      return formated
    } else {
      return prop
    }
  }

  _sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis))
  }

  _easeValue(change) {
    const options = this._getOptions()
    const {
      _from,
      _to
    } = this._getPrivateOptions()
    this._currentTime += this._increment
    const val = Math.easeInOutQuad(this._currentTime, _from[0], change, options.duration)
    if (options.style) {
      options.node.style[options.property] = `${Math.ceil(val * 10) / 10}${this._converted ? 'px' : _from[1]}`
    } else {
      options.node[options.property] = val
    }
    if (this._currentTime <= options.duration) {
      setTimeout(() => requestAnimationFrame(() => this._easeValue(change)), this._increment)
    } else {
      this._setImmediate(options.to)
    }
  }

  _calcEaseInOut(start, change) {
    const { duration } = this._getOptions()
    return Math.easeInOutQuad(this._currentTime, start, change, duration)
  }

  _easeColor(change) {
    const { _from, _to } = this._getPrivateOptions()._color
    const { duration } = this._getOptions()
    this._currentTime += this._increment
    const rgbaToApply = []
    _from.forEach((item, index)=> {
      rgbaToApply.push(this._calcEaseInOut(item, change[index]))
    })

    this._applyProperty(rgbaToApply)

    if (this._currentTime <= duration) {
      setTimeout(() => requestAnimationFrame(() => this._easeColor(change)), this._increment)
    } 
    // else {
    //   this._setImmediate(rgbaToApply)
    // }
  }

  _calcChange(start, end) {
    return start - end
  }

  _execChain() {
    const { instances } = this._getOptions()
    instances.forEach(instance => {
      instance.start()
    })
  }

  _execColorEase() {
    const options = this._getOptions()
    this._setPrivateOption('color', {
      _from: this._convertColorToRgba(options.from),
      _to: this._convertColorToRgba(options.to),
    })
    let changeRgba = []
    const { _from, _to, _color } = this._getPrivateOptions()
    _color._from.forEach((item, index) => {
      changeRgba.push(-this._calcChange(_color._from[index], _color._to[index]))
    })
    this._easeColor(changeRgba)
    
  }

  _exec() {
    const options = this._getOptions()
    const _options = this._getPrivateOptions()
    this._evalInput(options.from, 'from')
    this._evalInput(options.to, 'to')
    this._printOptions()
    if (!options.duration || !options.transition || !options.from) {
      console.log('immediate triggered in _exec')
      this._setImmediate()
    } else if (options.to) {
      if(options.color) {
        console.log('color triggered in _exec')
        this._execColorEase()
      } else {
        console.log('value triggered in _exec')
        this._compareUnits()
        const change = this._calcChange(_options._to[0], _options._from[0])
        console.log('change', change)
        requestAnimationFrame(() => this._easeValue(change))
      }
    } else {
      throw 'must specify "to" property'
    }
  }

  _compareUnits() {
    const options = this._getOptions()
    const [fromValue, fromUnit] = options.from
    const [toValue, toUnit] = options.to

    if (!fromUnit && !toUnit) {
      this._setPrivateOption('from', [fromValue, 'px'])
      this._setPrivateOption('to', [toValue, 'px'])
      this._setConverted(false)
    } else if (!fromUnit || !toUnit) {
      const populatedProp = fromUnit ? 'from' : toUnit ? 'to' : null
      if (populatedProp) {
        const unpopulatedProp = populatedProp === 'from' ? 'to' : 'from'
        this._setPrivateOption(populatedProp, [this._convertToPixel(options[populatedProp]), 'px'])
        this._setPrivateOption(unpopulatedProp, [options[unpopulatedProp], 'px'])
        this._setConverted(true)
      }
    } else if (fromUnit !== toUnit) {
      [options.from, options.to].forEach((prop, index) => {
        this._setPrivateOption(index === 0 ? 'from' : 'to', [this._convertToPixel(prop), 'px'])
        this._setConverted(true)
      })
    } else if (fromUnit === toUnit) {
      this._setPrivateOption('from', options.from)
      this._setPrivateOption('to', options.to)
      this._setConverted(false)
    } else {
      throw 'error compare units'
    }
  }

  _setImmediate() {
    const {
      node,
      to
    } = this._getOptions()
    if (node) {
      this._applyProperty(to)
    } else {
      throw 'no node provided to setImmediate'
    }
  }

  _setNodeProperty(v1, v2) {
    const { node, style, property } = this._getOptions()
    // by default, set same value whether style === true or not, but can feed a second value if want something else when no style
    if(style) {
      node.style[property] = v1
    } else {
      node[property] = v2 ? v2 : v1
    }
  }

  _applyProperty(toApply) {
    const { color, node } = this._getOptions()
    if(color) {
      if(node) {
        this._applyColor(toApply)
      } else {
        throw 'color set only supported on node'
      }
    } else {
      if(node) {
        const [value, unit] = toApply
        const str = `${value}${unit}`
        this._setNodeProperty(str, value)
      } else {
        throw 'css props only applicable to nodes'
      }
    }
  }

  _applyColor(rgba) {
    const { node, style, property } = this._getOptions()
    const [ r, g, b, a ] = rgba
    const str = `rgba(${r},${g},${b},${a})`
    this._setNodeProperty(str)
  }

  parallel(items) {
    const options = this._getOptions()
    const instances = items.map((item, index) => {
      return new Easer({
        ...item,
        style: item.style || options.style,
        delay: item.delay || options.delay,
        node: this._selectNode(item.node) || options.node,
        transition: item.transition || options.transition,
        duration: item.duration || options.duration,
        chained: true,
      })
    })
    return this._generateAltered({ instances, chainMaster: true })
  }

  delay(millis) {
    return this._generateAltered('delay', millis)
  }

  node(param) {
    return this._generateAltered('node', this._selectNode(param))
  }

  duration(millis) {
    return this._generateAltered('duration', millis)
  }

  color() {
    return this._generateAltered('color', true)
  }

  from(param) {
    return this._generateAltered('from', param)
  }

  to(param) {
    return this._generateAltered('to', param)
  }

  style() {
    return this._generateAltered('style', true)
  }

  property(param) {
    if (typeof param === 'string') {
      if (this._getOptions().style) {
        return this._generateAltered('property', this._formatStyleProperty(param))
      } else {
        return this._generateAltered('property', (param))
      }
    } else {
      throw 'property must be a string'
    }
  }

  async start() {
    const { delay, chainMaster } = this._getOptions()
    if (delay) {
      await this._sleep(delay)
    }
    if(chainMaster) {
      this._execChain()
    } else {
      this._exec()
    }
  }

  easeInOut() {
    const options = this._getOptions()
    return this._generateAltered('transition', 'ease-in-out')
  }
}

class Transition {
  constructor(options) {
    if(options) {
      const _realOptions = {
        from: options.from || null,
        to: options.to || null,
        property: options.property || null,
        duration: options.duration || 1000,
      }
      this.options = _realOptions
    } else {
      this.options = {
        from: null,
        to: null,
        property: null,
        duration: 1000,
      }
    }
  }

  _getOptions() {
    return this.options
  }

  _generateNew(options) {
    return new Transition(options)
  }

  _generateAltered(f, v) {
    return new Transition({
      ...this._getOptions(),
      [f]: v
    })
  }

  to(param) {
    return this._generateAltered('to', param)
  }

  from(param) {
    return this._generateAltered('from', param)
  }

  property(param) {
    return this._generateAltered('property', param)
  }

  duration(param) {
    return this._generateAltered('duration', param)
  }

  Delay(millis) {
    return this._generateNew({ duration: millis })
  }
}



class Runnable {
  constructor(input) {
    this.options = {
      from: null,
      to: null,
      duration: 1000,
      property: null,
      mode: null, // color || style || value || delay
      originalOptions: {}
    }
    this._converter = new _Converter()
    this._formatter = new _Formatter()
    this._formatSingle(input)
  }

  _getOptions() {
    return this.options
  }

  _setOption(f, v) {
    this.options[f] = v
  }

  _setMode(mode) {
    this._setOption('mode', mode)
  }

  _formatSingle(transition) {
    const { options } = transition
    this._setOption('originalOptions', options)
    if(!options.from && !options.to && !options.property && options.duration) {
      this._setMode('delay')
    } else {
      this._setOption('from', this._evalInput(options.from))
      this._setOption('to', this._evalInput(options.to))
      if(this.options.mode === 'style') {
        console.log('style')
      }
    }
    if(options.property) {
      this._setOption('property', this._formatter._formatStyleProperty(options.property))
    }
    this._setOption('duration', options.duration)
  }

  _evalInput(input) {
    if (typeof input === 'number' || input === 0) {
      return this._splitValue(String(input))
    } else if (typeof input == 'string') {
      if (this._testColorProp(input)) {
        this._setMode('color')
        return this._converter.convertColorToRgba(input)
      } else {
        return this._splitValue(input)
      }
    } else {
      throw new Error('"from" and "to" must be string or number')
    }
  }

  _splitValue(str) {
    const [match, number, unit, aloneNumber] = str.match(_letterNumberRegex)
    if (match) {
      if (number) {
        this._setMode('style')
        return [parseInt(number, 10), String(unit).toLowerCase()]
      } else {
        this._setMode('value')
        return [parseInt(aloneNumber, 10)]
      }
    } else {
      throw 'error splitvalue'
    }
  }

  _testColorProp(str) {
    return (
      _hexMatchRegex.test(str)
      || _hslMatchRegex.test(str)
      || _hslaMatchRegex.test(str)
      || _rgbMatchRegex.test(str)
      || _rgbaMatchRegex.test(str)
    )
  }
}

class _Converter {

  convertColorToRgba(str) {
    if(_rgbMatchRegex.test(str)) {
      const [ match, r, g, b ] = _rgbMatchRegex.exec(str)
      return [ parseInt(r), parseInt(g), parseInt(b), 1 ]
    } else if(_rgbaMatchRegex.test(str)) {
      const [ match, r, g, b, a ] = _rgbaMatchRegex.exec(str)
      return [ parseInt(r), parseInt(g), parseInt(b), Number(a) ]
    } if(_hexMatchRegex.test(str)) {
      return this._hexToRgb(str)
    } else if(_hslMatchRegex.test(str)) {
      const [ match, h, s, l ] = _hslMatchRegex.exec(str)
      return [ ...this._hslToRgb(h, s, l), 1 ]
    } else if(_hslaMatchRegex.test(str)) {
      const [ match, h, s, l, a ] = _hslaMatchRegex.exec(str)
      return [ ...this._hslToRgb(h, s, l), Number(a) ]
    }
  }

  _hslToRgb(h, s, l) {
    h = parseInt(h)
    s = parseInt(s) / 100
    l = parseInt(l) / 100
    let r, g, b
    if (s == 0) {
      r = g = b = l // achromatic
    } else {
      let q = l < 0.5 ? l * (1 + s) : l + s - l * s
      let p = 2 * l - q
      r = this._hueToRgb(p, q, h + 1 / 3)
      g = this._hueToRgb(p, q, h)
      b = this._hueToRgb(p, q, h - 1 / 3)
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
  }

  _hueToRgb(p, q, t) {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  _hexToRgb(hex) {
    const result = _hexToRgbRegex.exec(hex)
    if(hex.length > 4) return [
      parseInt(result[2], 16),// r
      parseInt(result[3], 16),// g
      parseInt(result[4], 16),// b
      1 //                       a
    ]
    else return [
      parseInt(result[5], 16) * 17,
      parseInt(result[6], 16) * 17,
      parseInt(result[7], 16) * 17,
      1
    ]
  }

  convertToPixel(val) {
    const {
      node
    } = this._getOptions()
    let [number, unit] = val
    if (node) {
      if (!unit) {
        return number
      } else {
        switch (unit) {
          case 'px':
            return number
          case 'rem':
            return this._handleRem(number)
          case 'em':
            return this._handleEm(number)
          case '%':
            return this._handlePercentage(number)
          case 'vh':
            return this._handleViewportHeight(number)
          case 'vw':
            return this._handleViewportWidth(number)
          default:
            throw 'unknown unit used'
        }
      }
    } else {
      throw `can't use css units without node and style methods`
    }
  }

  _handleRem(n) {
    const baseline = this._convertToPixel(this._splitValue(window.getComputedStyle(document.body).fontSize))
    return n * baseline
  }

  _handleEm(n, node) {
    const baseline = this._convertToPixel(this._splitValue(window.getComputedStyle(node.parentNode).fontSize))
    return n * baseline
  }

  _handlePercentage(n, node, property) {
    const baseline = this._convertToPixel(this._splitValue(window.getComputedStyle(node.parentNode)[property]))
    return baseline / 100 * n
  }

  _handleViewportHeight(n) {
    return window.innerHeight / 100 * n
  }

  _handleViewportWidth(n) {
    return window.innerWidth / 100 * n
  }
}

class _Formatter {

  _formatStyleProperty(prop) {
    if (prop.includes('-')) {
      const formated = prop.split('-').map((str, index) => {
        if (index > 0) {
          return str.charAt(0).toUpperCase() + str.slice(1)
        } else {
          return str
        }
      }).join('')
      return formated
    } else {
      return prop
    }
  }

  _formatNode(node) {
    return typeof node === 'string' ? document.querySelector(node) : node
  }
}

class Runtime {
  constructor(options, queue) {
    this.options = {
      use: options.use || 'DOM',
      node: options.node || null,
      value: options.value || null,
    }
    this.queue = queue || [ ]
    this._formatter = new _Formatter()
  }

  _getOptions() {
    return this.options
  }

  _alterOption(f, v) {
    if(typeof f === 'object') {
      return {...this._getOptions(),
        ...f}
    } else if(typeof f === 'string' && v) {
      return {...this._getOptions(),
        [f]: v
      }
    }
  }

  _generateNew(options) {
    return new Runtime(options)
  }

  _generateAltered(f, v) {
    return this._generateNew(this._alterOption(f, v))
  }

  _getQueue() {
    return this.queue
  }

  _setQueue(param) {
    this.queue = param
  }

  _addToQueue(param) {
    const queue = this._getQueue()
    if(queue.length === 0) { //queue has no transitions and is not yet defined as sequence or parallel
      if(Array.isArray(param) && (param[0] === 'p' || param[0] === 's')) {
        console.log('available to add to queue', param)
        this._setQueue(param)
      }
    } else { //queue is either sequence or parallel

    }
  }

  _convertToRunnableIfNeeded(param) {
    if(param instanceof Transition) {
      return new Runnable(param)
    } else if (param instanceof Runnable) {
      return param
    } else {
      throw new Error('invalid param supplied to _convertToRunnableIfNeeded: ', param)
    }
  }

  _getListType(list) {
    return list[0]
  }

  _handleNestedList(list) {
    if(this._getListType(list) === 'p') {
      return this.parallel(list.filter(item => this._getListType(item) === 'p' ? false : true))
    } else if (this._getListType(list) === 's') {
      return this.sequence(list.filter(item => this._getListType(item) === 's' ? false : true))
    }
  }

  parallel(list) {
    //this takes a list of runnables or transitions and returns a formatted array
    if(Array.isArray(list)) {
      const runnables = list.map(item => {
        if(Array.isArray(item)) {
          return this._handleNestedList(item)
        } else if(item instanceof Transition || item instanceof Runnable) {
          return this._convertToRunnableIfNeeded(item)
        }
      })
      runnables.unshift('p')
      console.log(runnables)
      return runnables

    } else {
      throw new Error('parallel method takes an array of Transitions')
    }
  }

  sequence(list) {
    //this takes a list of runnables or transitions and returns a formatted array
    if(Array.isArray(list)) {
      const runnables = list.map(item => {
        if(Array.isArray(item)) {
          return this._handleNestedList(item)
        } else if(item instanceof Transition || item instanceof Runnable) {
          return this._convertToRunnableIfNeeded(item)
        }
      })
      runnables.unshift('s')
      console.log(runnables)
      return runnables

    } else {
      throw new Error('parallel method takes an array of Transitions')
    }
  }

  use(engine) {
    return this._generateAltered('use', String(engine).toUpperCase())
  }

  node(el) {
    return this._generateAltered('node', this._formatter._formatNode(el))
  }


}


const height = new Transition().to('120px').from('100vw').property('height').duration(300)
const delay = new Transition().Delay(500)
const backgroundColor = new Transition({
  from: '#AF6B98',
  to: '#FFF',
  property: 'backgroundColor',
  duration: 3000,
})

const runnableTransition = new Runnable(height)
// const runnnableDelay = new Runnable(delay)
const runnableBackgroundColor = new Runnable(backgroundColor)

const rt = new Runtime({}).use('ENGINE').node('.div')
rt.sequence([
  backgroundColor,
  height,
  rt.parallel([
    backgroundColor,
    height,
    rt.sequence([
      delay,
      runnableBackgroundColor
    ])
  ]),
  runnableTransition
])