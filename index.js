module.exports = cftemplate

var plaintemplate = require('plaintemplate')
var fs = require('fs')

var INDENT = /^ {4}/
var EMPTY_LINE = /^(\s*)$/

function cftemplate(template, context) {
  return plaintemplate(
    template,
    context,
    function handler(token, context, stringify) {
      var key
      var directive = token.tag.trim()

      if (directive.startsWith('include')) {
        return read(fileName(directive.split(' ')[1]))
          // split lines
          .split('\n')
          .map(function(line, index) {
            return (
              EMPTY_LINE.test(line) ?
                // If the line is empty, leave it empty.
                line :
                ( index === 0 ?
                  // On the first line, replace all indentation with spaces
                  // reflectnig the indentation of the template tag in the
                  // template.
                  line.replace(/^ +/, '') :
                  // On subsequent lines with indentation, add spaces to
                  // existing indentation.
                  line.replace(INDENT, ' '.repeat(token.position.column - 1) )) ) })
          .join('\n') }
      else if (directive.startsWith('if ')) {
        key = directive.substring(3)
        if (context.hasOwnProperty(key)) {
          return (
            !context[key] ?
              '' : stringify(token.content, context, handler) ) }
        else {
          return '' } }
      else if (directive.startsWith('unless ')) {
        key = directive.substring(7)
        if (context.hasOwnProperty(key)) {
          return (
            !context[key] ?
              stringify(token.content, context, handler) : '' ) }
        else {
          return '' } } },
    { open: '((', close: '))', start: 'start', end: 'end' }) }

function read(file) {
  return fs.readFileSync(file).toString() }

function fileName(basename) {
  return ( './includes/' + basename + '.cform' ) }
