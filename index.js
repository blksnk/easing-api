const _letterNumberEx = /([0-9]+)([a-z%]{1,3})|([0-9]+)/i
const _hexToRgbEx = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i

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
      duration: options.duration || 0,
      from: options.from || 0,
      to: options.to || 0,
      value: options.value || 0,
      node: options.node || null,
      property: options.property || null,
      style: options.style || false,
      transition: options.transition || null,
    }
    this.options = _realOptions
    this._currentTime = 0
    this._increment = this.options.duration / 1000 * 30
    this._converted = false
    this._options = {
      _from: 0,
      _to: 0,
    }
  }

  _getOptions() {
    return this.options
  }

  _setOption(f, v) {
    this.options[f] = v
  }

  _alterOption(f, v) {
    return {...this._getOptions(),
      [f]: v
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

  _splitValue(str) {
    return str.split(' ').map(item => {
      const [match, number, unit, aloneNumber] = item.match(_letterNumberEx)
      if (match) {
        if (number) {
          return [parseInt(number, 10), unit.toLowerCase()]
        } else {
          return [parseInt(aloneNumber, 10)]
        }
      } else {
        throw 'error splitvalue'
      }
    })
  }

  _convertToPixel(val) {
    const {
      node
    } = this._getOptions()
    let [number, unit] = val
    if (node) {
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
    } else {
      throw `can't use css units without node and style methods`
    }
  }

  _handleRem(n) {
    const baseline = this._convertToPixel(this._splitValue(window.getComputedStyle(document.body).fontSize)[0])
    return n * baseline
  }

  _handleEm(n) {
    const {
      node
    } = this._getOptions()
    const parent = node.parentNode
    const baseline = this._convertToPixel(this._splitValue(window.getComputedStyle(parent).fontSize)[0])
    return n * baseline
  }

  _handlePercentage(n) {
    const {
      node,
      property
    } = this._getOptions()
    if (property) {
      const parent = node.parentNode
      return this._convertToPixel(this._splitValue(window.getComputedStyle(parent)[property])[0]) / 100 * n
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

  _applyHtmlProperty(val) {
    const { node, style } = this._getOptions()
    if(options.style) {
      options.node.style[options.property] = val + 'px'
    } else {
      options.node[options.property] = val
    }
  }

  _sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis))
  }

  _animate(change) {
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
      setTimeout(() => requestAnimationFrame(() => this._animate(change)), this._increment)
    } else {
      this._setImmediate(options.to)
    }
  }

  _exec() {
    const options = this._getOptions()
    const _options = this._getPrivateOptions()
      this._setImmediate(options)
    } else if(options.to) {
      this._animate(change, options)
    if (!options.duration || !options.transition || !options.from) {
      this._setImmediate()
    } else if (options.to) {
      const change = _options._to[0] - _options._from[0]
      this._animate(change)
    } else {
      throw 'must specify "to" property'
    }
  }

  _compareUnits() {
    const options = this._getOptions()
    const [fromValue, fromUnit] = options.from
    const [toValue, toUnit] = options.to

    if (!fromUnit && !toUnit) {
      console.log('same unit or no unit')
      this._setPrivateOption('from', [fromValue, 'px'])
      this._setPrivateOption('to', [toValue, 'px'])
      this._setConverted(false)
    } else if (!fromUnit || !toUnit) {
      const populatedProp = fromUnit ? 'from' : toUnit ? 'to' : null
      console.log(populatedProp)
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
    }
  }

  delay(millis) {
    return this._generateAltered('delay', millis)
  }

  node(param) {
    return this._generateAltered('node', this._selectNode(param))
  }

  duration(param) {
    return this._generateNew({ ...this._getOptions(), duration: param })
  }

  from(param) {
    if(typeof param === 'number') {
      return this._generateAltered('from', [ param ])
    } else {
      return this._generateAltered('from', this._splitValue(param)[0])
    }
  }

  to(param) {
    if(typeof param === 'number') {
      return this._generateAltered('to', [ param ])
    } else {
      return this._generateAltered('to', this._splitValue(param)[0])
    }
  }

  style() {
    return this._generateAltered('style', true)
  }

  property(param) {
    if(typeof param === 'string') {
      if(this._getOptions().style) {
        return this._generateAltered('property', this._formatStyleProperty(param))
      } else {
        return this._generateAltered('property', (param))
      }
    } else {
      throw 'property must be a string'
    }
  }

  async start() {
    const options = this._getOptions()
    if(options.delay) {
      await this._sleep(options.delay)
    }
    this._exec(options)
  }

  easeInOut() {
    const options = this._getOptions()
    return this._generateAltered('transition', 'ease-in-out')
  }
}

const easer = new Easer({})

// easer.node('.div').style().property('width').easeInOut().duration(500).from('20px').to(500).start()
// easer.node('.p').style().property('margin-top').easeInOut().from(-10).to(200).delay(1000).start()
easer.node('.p').property('height')._handlePercentage(14)