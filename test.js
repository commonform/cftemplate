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

var cftemplate = require('./')
var fs = require('fs')
var glob = require('glob')
var path = require('path')
var tape = require('tape')

glob('tests/*', function(error, results) {
  if (error) {
    throw error }
  else {
    results.forEach(function(directory) {
      function read(file) {
        return fs.readFileSync(path.join(directory, file)).toString() }
      tape(path.basename(directory), function(test) {
        test.equal(
          cftemplate(
            read('input.cftemplate'),
            directory,
            JSON.parse(read('context.json'))),
          read('output.cform'))
        test.end() }) }) } })
