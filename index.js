// Copyright 2016 Kyle E. Mitchell
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

module.exports = cftemplate

var detect = require('async.detectseries')
var getForm = require('commonform-get-form')
var getProject = require('commonform-get-project')
var parseJSON = require('json-parse-errback')
var plaintemplate = require('plaintemplate')
var stringifyForm = require('commonform-markup-stringify')
var parseMarkup = require('commonform-markup-parse')
var path = require('path')
var fs = require('fs')
var isDigest = require('is-sha-256-hex-digest')

var EMPTY_LINE = /^( *)$/
var PROJECT = /^([a-z]+)\/([a-z-]+)@([0-9eucd]+)$/

function cftemplate(template, base, context, callback) {
  var processor = plaintemplate(
    function handler(token, context, stringify, callback) {
      var key
      var directive = token.tag.trim()

      function addPosition(error, message) {
        error.message = (
          message + ' at ' +
          'line ' + token.position.line + ', ' +
          'column ' + token.position.column)
        error.position = token.position
        return error }

      function format(form) {
        return formToMarkup(form)
          // split lines
          .split('\n')
          .map(function(line, index) {
            return (
              EMPTY_LINE.test(line)
                // If the line is empty, leave it empty.
                ? line
                : ( index === 0 ?
                    line :
                    // On subsequent lines with indentation, add spaces to
                    // existing indentation.
                    ( ' '.repeat(token.position.column - 1) + line) ) ) })
          .join('\n') }

      if (isDigest(directive)) {
        getForm(directive, function(error, form) {
          if (error) {
            callback(error) }
          else {
            callback(null, format(form)) } }) }

      else if (PROJECT.test(directive)) {
        var match = PROJECT.exec(directive)
        var publisher = match[1]
        var project = match[2]
        var edition = match[3]
        getProject(publisher, project, edition, function(error, project) {
          if (error) {
            addPosition(error)
            callback(error) }
          else {
            getForm(project.form, function(error, form) {
              if (error) {
                callback(error) }
              else {
                callback(null, format(form)) } }) } }) }

      else if (directive.startsWith('require ')) {
        var split = directive.split(' ')
        var target = ( './' + split[1] )
        var markup = path.resolve(base, ( target + '.cform' ))
        var template = path.resolve(base, ( target + '.cftemplate' ))
        var json = path.resolve(base, ( target + '.json' ))
        var directory = path.dirname(markup)
        detect(
          [ template, markup, json ],
          function(path, done) {
            fs.access(path, fs.R_OK, function(error) {
              done(error ? false : true) }) },
          function(file) {
            if (file === undefined) {
              callback(
                addPosition(
                  new Error(),
                  ( 'Could not require ' + target ))) }
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
                  else {
                    cftemplate(content, directory, context, function(error, markup) {
                      if (error) {
                        callback(error) }
                      else {
                        callback(
                          null,
                          format(parseMarkup(markup).form)) } }) } } }) } }) }

      else if (directive.startsWith('if ')) {
        key = directive.substring(3)
        if (context.hasOwnProperty(key)) {
          if (!context[key]) {
            callback(null, '') }
          else {
            stringify(
              token.content,
              context,
              handler,
              callback) } }
        else {
          callback(null, '') } }

      else if (directive.startsWith('unless ')) {
        key = directive.substring(7)
        if (!context.hasOwnProperty(key) || !context[key]) {
          stringify(token.content, context, handler, callback) }
        else {
          callback(null, '') } }
       },
    { open: '((', close: '))', start: 'begin', end: 'end' })
  processor(template, context, callback) }

function formToMarkup(form) {
  return stringifyForm(form)
    .replace(/^\n\n/, '') }
