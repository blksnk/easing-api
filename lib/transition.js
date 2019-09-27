const ease = (el, duration, property, start, to, style) => {
  const change = to - start
  let currentTime = 0
  let increment = 15

  if (typeof el === 'string') {
    el = document.querySelector(el)
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
  requestAnimationFrame(animate)
}

//t = current time
//b = start value
//c = change in value
//d = duration
Math.easeInOutQuad = function(t, b, c, d) {
  t /= d / 2
  if (t < 1) return (c / 2) * t * t + b
  t--
  return (-c / 2) * (t * (t - 2) - 1) + b
}