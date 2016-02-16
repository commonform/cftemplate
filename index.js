module.exports = cftemplate

var plaintemplate = require('plaintemplate')
var resolve = require('resolve')
var stringifyForm = require('commonform-markup-stringify')
var parseForm = require('commonform-markup-parse')
var path = require('path')
var fs = require('fs')
var request = require('sync-request')
var isDigest = require('is-sha-256-hex-digest')

var EMPTY_LINE = /^( *)$/

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
            ( isDigest(split[1]) ?
                split[1] :
                ( './' + split[1] + '.json' ) ) :
            ( '@' + split[1] + '/' + split[2] ) )

        var resolved
        if (isDigest(requireTarget)) {
          var url = ( 'https://api.commonform.org/forms/' + requireTarget )
          var response = request('GET', url)
          resolved = JSON.parse(response.getBody()) }
        else {
          var markup = path.resolve(
            base, requireTarget.replace(/.json$/, '.cform'))
          var template = path.resolve(
            base, requireTarget.replace(/.json$/, '.cftemplate'))
          var directory = path.dirname(markup)
          if (canRead(markup)) {
            resolved = parseForm(readSync(markup)).form }
          else if (canRead(template)) {
            resolved = parseForm(
              cftemplate(readSync(template), directory, context)).form }
          else {
            resolved = resolve.sync(requireTarget, { basedir: base })
            if (resolved) {
              resolved = require(resolved).form } } }

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
                      line :
                      // On subsequent lines with indentation, add spaces to
                      // existing indentation.
                      ( ' '.repeat(token.position.column - 1) + line) ) ) })
            .join('\n') }
        else {
          throw addPosition(
            new Error(),
            ( 'Could not require ' + requireTarget )) } }

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
        if (!context.hasOwnProperty(key) || !context[key]) {
          return stringify(token.content, context, handler) }
        else {
          return '' } } },

    { open: '((', close: '))', start: 'begin', end: 'end' }) }

function canRead(path) {
  try {
    fs.accessSync(path, fs.R_OK)
    return true }
  catch (error) {
    return false } }

function readSync(path) {
  return fs.readFileSync(path).toString() }

function formToMarkup(form) {
  return stringifyForm(form)
    .replace(/^\n\n/, '') }
