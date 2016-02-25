/* Copyright 2016 Kyle E. Mitchell
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = cftemplate

var detect = require('async.detectseries')
var fs = require('fs')
var getForm = require('commonform-get-form')
var getProject = require('commonform-get-project')
var isDigest = require('is-sha-256-hex-digest')
var parseJSON = require('json-parse-errback')
var parseMarkup = require('commonform-markup-parse')
var path = require('path')
var plaintemplate = require('plaintemplate')
var stringifyForm = require('commonform-markup-stringify')

var EMPTY_LINE = /^( *)$/
// Regular expression for references to projects.
// Example: `test/test-form@1e`
var PROJECT = /^([a-z]+)\/([a-z-]+)@([0-9eucd]+)$/

function cftemplate(
  template, // String of template content to process.
  base, // Directory to search for required files.
  context, // Key-value object holding template variable values.
  callback) {

  // Build a template processor using Plaintemplate.
  var processor = plaintemplate(

    // Provide a custom template tag handler.
    function handler(token, context, stringify, callback) {
      var key
      var directive = token.tag.trim()

      // Add position information to errors.
      function addPosition(error, message) {
        error.message = (
          message + ' at ' +
          'line ' + token.position.line + ', ' +
          'column ' + token.position.column)
        error.position = token.position
        return error }

      // Format markup for insertion at the current position.
      function format(form) {
        return formToMarkup(form)
          // split lines
          .split('\n')
          .map(function(line, index) {
            return (
              EMPTY_LINE.test(line)
                // If the line is empty, leave it empty.
                ? line
                : ( index === 0
                    ? line
                    // On subsequent lines with indentation, add spaces
                    // to existing indentation.
                    : ( ' '.repeat(token.position.column - 1) +
                        line) ) ) })
          .join('\n') }

      // `(( 543cd5e172cfc6b3c20a0d91855fea44b5bf2fd1da7bf6b7c69f... ))`
      // Inserts a form from api.commonform.org, by digest.
      if (isDigest(directive)) {
        getForm(directive, function(error, form) {
          if (error) {
            callback(error) }
          else {
            callback(null, format(form)) } }) }

      // `(( test/test-form@1e ))`
      // Inserts a form referenced by projects.commonform.org.
      else if (PROJECT.test(directive)) {
        var match = PROJECT.exec(directive)
        var publisher = match[1]
        var project = match[2]
        var edition = match[3]
        getProject(
          publisher,
          project,
          edition,
          function(error, project) {
            if (error) {
              addPosition(error)
              callback(error) }
            else {
              getForm(project.form, function(error, form) {
                if (error) {
                  callback(error) }
                else {
                  callback(null, format(form)) } }) } }) }

      // `(( require some-file ))`
      // Inserts a form from a local file.
      else if (directive.startsWith('require ')) {
        var split = directive.split(' ')
        var target = ( './' + split[1] )
        var markup = path.resolve(base, ( target + '.cform' ))
        var template = path.resolve(base, ( target + '.cftemplate' ))
        var json = path.resolve(base, ( target + '.json' ))
        var directory = path.dirname(markup)
        // The file to require may be a template (.cftemplate), Common Form
        // markup (.cform), or a Common Form in native JSON format (.json).
        // Check each of those file extensions, in that order, and process the
        // first matching file.
        detect(
          [ template, markup, json ],
          // Can we read the file?
          function(path, done) {
            fs.access(path, fs.R_OK, function(error) {
              done(error ? false : true) }) },
          function(file) {
            // Couldn't find any matching files.
            if (file === undefined) {
              callback(
                addPosition(
                  new Error(),
                  ( 'Could not require ' + target ))) }
            // Found a matching file.
            else {
              fs.readFile(file, 'utf8', function(error, content) {
                if (error) {
                  callback(error) }
                else {
                  if (file === markup) {
                    callback(null, format(parseMarkup(content).form)) }
                  else if (file === json) {
                    parseJSON(content, function(error, form) {
                      if (error) {
                        callback(error) }
                      else {
                        callback(null, format(form)) } }) }
                  // If the file is a template, recursively apply `cftemplate`
                  // to it.
                  else {
                    cftemplate(
                      content,
                      directory,
                      context,
                      function(error, markup) {
                        if (error) {
                          callback(error) }
                        else {
                          var output = format(parseMarkup(markup).form)
                          callback(null, output) } }) } } }) } }) }

      // `(( if payingInCash begin )) conditional text (( end ))`
      else if (directive.startsWith('if ')) {
        key = directive.substring(3)
        if (context.hasOwnProperty(key)) {
          if (!context[key]) {
            callback(null, '') }
          else {
            stringify(token.content, context, handler, callback) } }
        else {
          callback(null, '') } }

      // `(( unless payingInCash begin )) conditional text (( end ))`
      else if (directive.startsWith('unless ')) {
        key = directive.substring(7)
        if (!context.hasOwnProperty(key) || !context[key]) {
          stringify(token.content, context, handler, callback) }
        else {
          callback(null, '') } } },

    // Plaintemplate directive tokens.
    { open: '((', close: '))', start: 'begin', end: 'end' })

  // Apply the customized Plaintemplate processor to arguments and yield its
  // result, the resulting Common Form markup.
  processor(template, context, callback) }

function formToMarkup(form) {
  return stringifyForm(form)
    .replace(/^\n\n/, '') }
