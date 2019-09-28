const _letterNumberEx = /([0-9]+)([a-z%]{1,3})|([0-9]+)/i
const _hexToRgbEx = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i

Math.easeInOutQuad = function(t, b, c, d) {
  t /= d / 2
  if (t < 1) return (c / 2) * t * t + b
  t--
  return (-c / 2) * (t * (t - 2) - 1) + b
}

const animate = function(timestamp) {
    currentTime += increment
    const val = Math.easeInOutQuad(currentTime, start, change, duration)
    if (style) {
      el.style[property] = String(val)
    } else {
      el[property] = val
    }
    if (currentTime < duration) {
      setTimeout(() => requestAnimationFrame(animate), increment)
    }
  }

class Easer {
  constructor(options) {
    const _realOptions = {
      delay: options.delay || 0,
      duration: options.duration || 0,
      from: options.from || 0,
      to: options.to || 100,
      value: options.value || 0,
      node: options.node || null,
      property: options.property || null,
      style: options.style || false,
      transition: options.transition || null,
    }
    this.options = _realOptions
    this._currentTime = 0
    this._increment = this.options.duration / 1000 * 30
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

  _printOptions(param) {
    const options = this._getOptions()
    if (param && typeof param === 'string') {
      console.log(options[param])
    } else {
      console.log(options)
    }
    return this._generateNew(this._getOptions())
  }

  _splitValue(str) {
    return str.split(' ').map(item => {
      const [match, number, unit, aloneNumber] = item.match(_letterNumberEx)
      if (match) {
        if (number) {
          return [ parseInt(number, 10), unit.toLowerCase() ]
        } else {
          return [ parseInt(aloneNumber, 10) ]
        }
      } else {
        throw 'error splitvalue'
      }
    })
  }

  _convertUnitToPixel(val) {
    const { node } = this._getOptions()
    let [ number, style, unit ] = val
    if(!unit) {
      return number
    } else if(node) {
      switch(unit) {
        case 'px':
          return number
        case 'rem':
          return this._handleRem(number)
        case 'em':
          return this._handleEm(number)
        case '%':
          return this._handlePercentage(number)
        case 'vh':
          return this._handleViewportUnit(number, true)
        case 'vh':
          return this._handleViewportUnit(number, false)
        default:
          throw 'unknown unit used'
      }
    } else {
      throw `can't use css units without node and style methods`
    }
  }

  _handleRem(n) {
    const baseline = this._convertUnitToPixel(this._splitValue(window.getComputedStyle(document.body).fontSize)[0])
    return n * baseline
  }

  _handleEm(n) {
    const { node } = this._getOptions() 
    const parent = node.parentNode
    const baseline = this._convertUnitToPixel(this._splitValue(window.getComputedStyle(parent).fontSize)[0])
    return n * baseline
  }

  _handlePercentage(n) {
    const { node, property } = this._getOptions() 
    if(property) {
      const parent = node.parentNode
      return this._convertUnitToPixel(this._splitValue(window.getComputedStyle(parent)[property])[0]) / 100 * n
    } else {
      throw 'must provide property to use percentage'
    }
  }

  _handleViewportUnit(n, isHeight) {
    const baseline = isHeight ? window.innerHeight : window.innerWidth
    return baseline / 100 * n
  }

  _formatStyleProperty(prop) {
    if(prop.includes('-')) {
      const formated = prop.split('-').map((str, index) => {
        if(index > 0) {
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

  _animate(change, options) {
    this._currentTime += this._increment
    const val = Math.easeInOutQuad(this._currentTime, options.from[0], change, options.duration)
    if (options.style) {
        options.node.style[options.property] = Math.ceil(val * 10) / 10 + 'px'
    } else {
      options.node[options.property] = val
    }
    if (this._currentTime <= options.duration) {
      setTimeout(() => requestAnimationFrame(() => this._animate(change, options)), this._increment)
    }
  }

  _exec(options) {
    const change = options.to[0] - options.from[0]
    if(!options.duration || !options.transition || !options.from) {
      this._setImmediate(options)
    } else if(options.to) {
      this._animate(change, options)
    } else {
      throw 'must specify "to" property'
    }
  }

  _setImmediate(options) {
    console.log('set immediate')
    if(options.node) {
      this._applyHtmlProperty(options.to[0])
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