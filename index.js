const _letterNumberRegex = /([0-9]+)([a-z%]{1,3})|([0-9]+)/i

const _hexToRgbRegex = /^#?(([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})|([a-f\d]{1})([a-f\d]{1})([a-f\d]{1}))$/i

const _hslMatchRegex = /^hsl\(\s*(\d+)\s*,\s*(\d*(?:\.\d+)?%)\s*,\s*(\d*(?:\.\d+)?%)\)$/i
const _hslaMatchRegex = /^hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*(\d*(?:\.\d+)?)\)$/i
const _rgbMatchRegex = /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/i
const _rgbaMatchRegex = /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d*(?:\.\d+)?)\)$/i
const _hexMatchRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i

const raf = fn => requestAnimationFrame(fn)

Math.easeInOutQuad = function(t, b, c, d) {
  t /= d / 2
  if (t < 1) return (c / 2) * t * t + b
  t--
  return (-c / 2) * (t * (t - 2) - 1) + b
}

class Transition {
  constructor(options) {
    if(!this instanceof Transition) {
      return new Transition(options)
    }

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

class _Converter {

  constructor() {
    if(!this instanceof _Converter) {
      return new _Converter()
    }
  }

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

  _convertToPixel(val) {
    let [number, unit] = val
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

  _splitValue(val) {
    const [match, number, unit, aloneNumber] = val.match(_letterNumberRegex)
    if(match) {
      if(number) {
        return [ this._convertToPixel([parseInt(number, 10), String(unit).toLowerCase()]), 'px' ]
      } else {
        return [ parseInt(aloneNumber, 10) ]
      }
    } else {
      throw 'error converter splitvalue: no match'
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
}

class _Formatter {

  constructor() {
    if(!this instanceof _Formatter) {
      return new _Formatter()
    }
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

  _formatNode(node) {
    return typeof node === 'string' ? document.querySelector(node) : node
  }


}


class Runnable {
  constructor(input) {

    if(!this instanceof Runnable) {
      return new Runnable(input)
    }

    this.options = {
      from: null,
      to: null,
      duration: 1000,
      property: null,
      mode: null, // color || style || value || delay
    }
    this._frames = []
    this._currentFrameIndex = 0
    this.originalOptions = input.options
    this._converter = new _Converter()
    this._formatter = new _Formatter()
    this._finished = false

    this._formatSingle(input)
  }

  _getOptions() {
    return this.options
  }

  _getOriginalOptions() {
    return this.originalOptions
  }

  _setOption(f, v) {
    this.options[f] = v
  }

  _setMode(mode) {
    this._setOption('mode', mode)
  }

  _setFrames(frames) {
    this._frames = frames
  }

  _setFinised(bool) {
    this._finished = bool
  }

  _formatSingle(transition) {
    const { options } = transition
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
    this._createFrames()
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
        console.log(number)
        return [ this._converter._convertToPixel([parseInt(number, 10), String(unit).toLowerCase()]), 'px' ]
      } else {
        this._setMode('value')
        return [parseInt(aloneNumber, 10)]
      }
    } else {
      throw 'error splitvalue'
    }
  }

  _createFrames() {
    // 60 fps
    const frameNumber = 60 / 1000 * this.options.duration // need to be total duration

    let frames = []
    let progress = 0
    while (progress < frameNumber) {
      //only push if runnable.startTime >= progress <= runnable.endTime
      frames.push(this._generateFrame(frameNumber, progress))
      progress ++
    }
    // proof of concept
    // this._frames = frames
    this._setFrames(frames)
    return frames
  }

  _generateFrame(frameNumber, progress) {
    const { options, originalOptions } = this
    let change, value

    const easeRgba = () => {
      return options.from.map((colorValue, index) => {
        const change = options.to[index] - colorValue
        return Math.easeInOutQuad(progress, colorValue, change, frameNumber)
      })
    }
    const easeValue = () => {
      return Math.easeInOutQuad(progress, options.from[0], options.to[0] - options.from[0], frameNumber)
    }
    const ease = () => {
      if(options.mode === 'style') {
        return easeValue()
      } else if(options.mode === 'color') {
        return easeRgba()
      }
    }

    return ease()
  }

  run(node) {
    const currentFrame = this._frames[this._currentFrameIndex]
    this._applyFrame(currentFrame, node)

    const nextFrame = this._frames[this._currentFrameIndex + 1]
    if(nextFrame) {
      this._currentFrameIndex++
      requestAnimationFrame(() => this.run(node))
    } else {
      this._applyOriginalEndValue(node)
    }
  }

  _applyOriginalEndValue(node) {
    const { to } = this._getOriginalOptions()
    const { property } = this._getOptions()
    node.style[property] = to
    this._resetSelf()
  }

  _resetSelf() {
    this._currentFrameIndex = 0
  }

  _applyFrame(frame, node) {
    const { mode, property } = this._getOptions()

    switch(mode) {
      case 'color':
        node.style[property] = `rgba(${frame[0]},${frame[1]},${frame[2]},${frame[3]})`
      default:
        node.style[property] = frame + 'px'
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


class Parallel {
  constructor(items) {
    if(!this instanceof Parallel) {
      return new Parallel(items)
    }

    this.items = items || []
    this.duration = this._getSelfDuration()
  }

  _getItems() {
    return this.items
  }

  _getSelfDuration() {
    const items = this._getItems()
    const dur = items.reduce((acc, item, index) => {
      const itemDur = this._itemDuration(item)
      if(itemDur > acc) {
        return itemDur
      } else {
        return acc
      }
    }, 0)
    return dur
  }

  _itemDuration(item) {
    if(item instanceof Runnable) {
      return item.options.duration
    } else if(item instanceof Sequence) {
      return item.duration
    } else if(item instanceof Parallel) {
      return item.duration
    }
  }

  _execItems(node) {
    const items = this._getItems()
    items.forEach(item => item.run(node))
  }

  run(node) {
    if(this.items.length > 0) {
      this._execItems(node)
    }
  }
}

class Sequence {
  constructor(items) {
    if(!this instanceof Sequence) {
      return new Sequence(items)
    }

    this.items = items || []
    this.currentIndex = 0
    this.duration = this._getSelfDuration()
  }

  _getItems() {
    return this.items
  }

  _incrementCurrentIndex() {
    this.currentIndex ++
  }

  _getSelfDuration() {
    const items = this._getItems()
    const dur = items.reduce((acc, item, index) => {
      return acc + this._itemDuration(item)
    }, 0)
    return dur
  }

  _itemDuration(item) {
    if(item instanceof Runnable) {
      return item.options.duration
    } else if(item instanceof Sequence) {
      return item.duration
    } else if(item instanceof Parallel) {
      return item.duration
    }
  }

  _checkForNext() {
    const next = this.items[this.currentIndex + 1]
    if(next === null || next === undefined) {
      return null
    } else {
      return next
    }
  }

  _execItem(item, node) {
    const timeout = this._itemDuration(item)
    item.run(node)
    const next = this._checkForNext()
    if(next) {
      console.log(next)
      this._incrementCurrentIndex()
      setTimeout(() => this._execItem(next, node), timeout)
    } else {
      console.log('sequence finished')
    }
  }

  printShallowList() {
    console.log(this.items.map(item => {
      if(item instanceof Runnable) {
        return item
      }
    }))
  }

  run(node) {
    console.log(this.items)
    if(this.items.length > 0) {
      this._execItem(this.items[0], node)
    }
  }
}

class Runtime {
  constructor(options, queue, frames) {
    if(!this instanceof Runtime) {
      return new Runtime(options, queue)
    }

    this.options = {
      use: options.use || 'DOM',
      node: options.node || null,
      nodeSelector: options.nodeSelector || null,
      value: options.value || null,
    }
    this.queue = queue || [ ]
    this._frames = frames || [ ]
    this._formatter = new _Formatter()
    this._converter = new _Converter()
    this._currentFrameIndex = 0
    this._increment = 15
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

  _generateNew(options, queue, frames) {
    return new Runtime(options, queue, frames)
  }

  _generateCopy() {
    return this._generateNew(this._getOptions(), this._getQueue(), this._getFrames())
  }

  _generateAltered(f, v) {
    return this._generateNew(this._alterOption(f, v), this._getQueue(), this._getFrames())
  }

  _getFrames() {
    return this._frames
  }

  _getQueue() {
    return this.queue
  }

  _setQueue(list) {
    if(Array.isArray(list.listItems) && (list.type === 'parallel' || list.type === 'sequence')) {
      this.queue = list
    } else {
      throw new Error('invalid param supplied to _setQueue')
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
    return list.type
  }

  _handleNestedList(list) {
    if(this._getListType(list) === 'parallel') {
      return this.parallel(list.listItems.filter(item => this._getListType(item) === 'parallel' ? false : true))
    } else if (this._getListType(list) === 'sequence') {
      return this.sequence(list.listItems.filter(item => this._getListType(item) === 'sequence' ? false : true))
    }
  }

  _formatQueue(transitions, type) {
    //this takes a transtionsArray of runnables or transitions and returns a formatted array
    console.log(transitions)
    const queue = transitions.map((item, index) => {
      if(item instanceof Transition || item instanceof Runnable) {
        return this._convertToRunnableIfNeeded(item)
      } else {
        return this._formatQueue(item.listItems, item.type)
      }
    })

    let finished = { type, listItems: queue }
    finished.duration = this._getTotalDuration(finished)
    this._setQueue(finished)

    return finished
  } 

  _initAnimateDom() {
    const queue = this._getQueue()
  }

  _runSequence(seq) {
    const { listItems } = seq
    let isWaiting = false
    let isRunning = true
    const sequenceDuration = this._getTotalDuration(seq)
    let time = 0 //time in ms
    
    this._runSequenceChain(seq[0], seq)

  }

  _runSequenceChain(item, list) {
    const nextItemIndex = list.indexOf(item) + 1
    this._ifRunnable(item, () => {

    }, () => {
      console.log('item is not runnable in _runRequenceChain')
    })
  }


  _extractDuration(list) {
    return list.map(item => {
      if(Array.isArray(item)) {
        return this._extractDuration(item)
      } else {
        return item.options.duration
      }
    })
  }

  _getRemainingDuration(current, total) {
    return total - current
  }

  _getDuration(runnables) {
    const total = runnables.reduce((acc, item, index) => {
      const { duration } = item.options
      if(type === 'sequence') {
        return acc + duration
      } else if(type === 'parallel') {
        return duration > acc ? duration : acc
      } else {
        throw new Error('unknown type supplied to _getDuration')
      }
    }, 0)
    return total
  }

  _ifRunnable(item, ifDo, elseDo) {
    if(item instanceof Runnable) {
      ifDo()
    } else {
      elseDo()
    }
  }

  _getTotalDuration(queue) {
    const total = queue.listItems.reduce((acc, item, index) => {
      if(item instanceof Runnable) {
        if(queue.type === 'sequence') {
          return acc + item.options.duration
        } else if(queue.type === 'parallel') {
          console.log(item)
          return item.options.duration > acc ? item.options.duration : acc
        }
      } else {
        const listDuration = this._getTotalDuration(item)
        if(queue.type === 'sequence') {
          return acc + listDuration
        } else if(queue.type === 'parallel') {
          return listDuration > acc ? listDuration : acc
        }
      }
    }, 0)
    console.log('total', total)
    return total
  }

  _runRunnable(runnable) {
    const { node } = this._getOptions()
    console.dir(node)
    runnable.run(node)
    return this._generateCopy()
  }

  _runQueue() {
    const queue = this._getQueue()
    console.log(queue)
  }



  _runRunnablesInSequence(seq) {
    
  }

  transition(param) {
    //by default, a single transition is wrapped as a sequence of a single element
    const runnable = this._convertToRunnableIfNeeded(param)
    if(Array.isArray(param)) {
      this._setQueue(this.sequence(param))
    } else {
      this._setQueue(this.sequence([ runnable ]))
    }
  }

  parallel(transtionsArray) {
   return this._formatQueue(transtionsArray, 'parallel')
  }

  sequence(transtionsArray) {
    return this._formatQueue(transtionsArray, 'sequence')
    
  }

  use(engine) {
    return this._generateAltered('use', String(engine).toUpperCase())
  }

  node(el) {
    this.options.nodeSelector = el
    return this._generateAltered('node', this._formatter._formatNode(el))
  }

  value(val) {
    return this._generateAltered('value', val)
  }

  run() {
    const { use } = this._getOptions()
    switch(use) {
      case 'DOM':
        this._initAnimateDom()
        break
      default:
        throw new Error('no engine provided to "use" methode')
        break
    }
  }

  runSequenceClass(seq) {
    seq.run(this.options.node)
  }
}

const height = new Transition().from('50').to('70vh').property('height').duration(1500)

const delay = new Transition().Delay(500)

const backgroundColor = new Transition({
  from: '#39FF3A',
  to: '#BB16E8',
  mode: 'color',
  property: 'backgroundColor',
  duration: 1500,
})

const marginTop = new Transition().property('marginTop').from(1).to('20rem').duration(2000)

const runnableWidth = new Runnable(new Transition({
  from: 50,
  to:'50vw',
  mode: 'style',
  property: 'width',
  duration: 1500,
}))

const runnableTransitionHeight = new Runnable(height)
// const runnnableDelay = new Runnable(delay)
const runnableBackgroundColor = new Runnable(backgroundColor)

const runnableMarginTop = new Runnable(marginTop)

const seq = new Sequence([
  runnableBackgroundColor,
  new Parallel([
    runnableWidth,
    runnableTransitionHeight,
  ]),
  runnableMarginTop,
])

const rt = new Runtime({})
.use('DOM')
.node('.div')
.runSequenceClass(seq)
// rt._runRunnable(runnableTransitionHeight)



// rt._createFrames(runnableTransitionHeight)
