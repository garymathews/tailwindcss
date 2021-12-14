/**
 * Parse a path string into an array of path segments.
 *
 * Square bracket notation `a[b]` may be used to "escape" dots that would otherwise be interpreted as path separators.
 *
 * Axample:
 * a -> ['a]
 * a.b.c -> ['a', 'b', 'c']
 * a[b].c -> ['a', 'b', 'c']
 * a[b.c].e.f -> ['a', 'b.c', 'e', 'f']
 * a[b][c][d] -> ['a', 'b', 'c', 'd']
 *
 * @param {string|string[]} path
 **/
export function toPath(path) {
  if (Array.isArray(path)) return path

  /** @type {'start' | 'in_property' | 'in_brackets' | 'end'} */
  let state = 'start'

  let parts = []
  let partStart = 0
  let partEnd = 0

  for (let i = 0, len = path.length; i < len; i++) {
    let c = path[i]
    let previousState = state

    if (c === '[') {
      if (previousState === 'in_brackets') {
        throw new Error(`Invalid path: ${path}\n` + `${' '.repeat(14 + i)}^`)
      }

      // Append the current part to the parts if non-empty (would be in the case of concesutive brackets e.g. a[b][c])
      partEnd = i

      if (partStart !== partEnd) {
        parts.push(path.slice(partStart, partEnd))
      }

      state = 'in_brackets'
      partStart = i + 1
    } else if (c === ']') {
      if (previousState !== 'in_brackets') {
        throw new Error(`Invalid path: ${path}\n` + `${' '.repeat(14 + i)}^`)
      }

      // Append the part between brackets
      partEnd = i
      parts.push(path.slice(partStart, partEnd))

      state = 'in_property'
      partStart = i + 1
    } else if (c === '.' && previousState !== 'in_brackets') {
      // Append the current part to the parts if non-empty (would be in the case of concesutive brackets e.g. a[b][c])
      // The exception is the start of the path
      partEnd = i

      if (partStart !== partEnd || previousState === 'start') {
        parts.push(path.slice(partStart, partEnd))
      }

      state = 'in_property'
      partStart = i + 1
    } else {
      // Keep collecting this part of the path
      partEnd = i + 1

      // We've hit the end of the path
      // Append the last part
      if (partEnd === len) {
        parts.push(path.slice(partStart, partEnd))
      }
    }
  }

  if (state === 'in_brackets') {
    throw new Error(`Unclosed path: ${path}`)
  }

  return parts
}
