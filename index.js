module.exports = cftemplate

var plaintemplate = require('plaintemplate')
var resolve = require('resolve')
var stringifyForm = require('commonform-markup-stringify')
var parseForm = require('commonform-markup-parse')
var path = require('path')
var fs = require('fs')

var INDENT = /^ {4}/
var EMPTY_LINE = /^(\s*)$/

function cftemplate(template, base, context) {
  return plaintemplate(
    template,
    context,
    function handler(token, context, stringify) {
      var key
      var directive = token.tag.trim()

      function addPosition(error, message) {
        error.message = (
          message + ' at ' +
          'line ' + token.position.line + ', ' +
          'column ' + token.position.column)
        error.position = token.position
        return error }

      if (directive.startsWith('require ')) {
        var split = directive.split(' ')
        var requireTarget = (
          split.length === 2 ?
            ( './' + split[1] + '.json' ) :
            ( '@' + split[1] + '/' + split[2] ) )
        var markupFile = path.resolve(
          base,
          requireTarget.replace(/.json$/, '.cform'))
        var resolved
        if (fs.existsSync(markupFile)) {
          resolved = parseForm(
            fs.readFileSync(markupFile).toString()).form }
        else {
          resolved = resolve.sync(requireTarget, { basedir: base })
          if (resolved) {
            resolved = require(resolved).form } }

        if (resolved) {
          return formToMarkup(resolved)
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
                    line.replace(
                      INDENT,
                      ' '.repeat(token.position.column - 1) )) ) })
            .join('\n') }
        else {
          throw addPosition(
            new Error(),
            ( 'Could not find package ' + requireTarget )) } }

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

function formToMarkup(form) {
  return stringifyForm(form)
    .replace(/^\n\n/, '') }
