import {expect} from 'chai';
import {waterfall} from 'async';

import * as connector from './../../../src/connectors/filesystem';
import {exists} from 'fs';
import * as lib from './../../../src/core/controllers/contentsController';

import * as models from './../../../src/core/models/'
import defaultParameters from './../../../src/config/defaultParameters'
import {sample_output_path, sample_folder_path, crud_cobaye_path} from "./../../test_settings";
const base_path = __dirname + '/../../' + sample_folder_path;
const base_output = __dirname + '/../../' + sample_output_path;

const inputParams = {
  basePath: base_path,
  connector: 'filesystem'
};

const outputParams = {
  basePath: base_output,
  connector: 'filesystem'
};
/*
let params;

describe('contentController:updateFromSource', () =>{
  it('should update unfaulted data from source without processing errors', function(done){
    lib.updateFromSource(inputParams, models, defaultParameters, function(err, results){
      expect(err).to.be.null;
      expect(results).to.be.defined;
      done();
    });
  });
});

describe('contentController:updateToSource', () => {
  params = outputParams;
  it('should update unfaulted data from one source to another without breaking', function(done){
    let inputFsTree, document;
    waterfall([
      //delete test folder
      (cb) => {
        exists(base_output, function(isThere){
          if (isThere) {
            connector.deleteFromPath({params}, cb);
          } else {
            cb();
          }
        });
      },
      //recreate test folder
      (cb) => {
        connector.createFromPath({params, type: 'directory', overwrite: true}, function(err, response){
          cb();
        });
      },
      //make a fs representation of the test folder
      (cb) => {
        connector.readFromPath({params, depth: true, parseFiles: true}, function(err, results) {
          inputFsTree = results;
          cb();
        });
      },
      //fill the data to update
      (cb) => {
        lib.updateFromSource(inputParams, models, defaultParameters, function(err, results){
          document = results.document;
          cb();
        });
      },
      // update the data (fs tree changes)
      (cb) => {
        lib.updateToSource(outputParams, document, models, inputFsTree, function(err, newFsTree){
          cb(err, newFsTree);
        });
      },
    ],
    (err, results) => {
      expect(err).to.be.null;
      expect(results).to.be.defined;
      done();
    });
  });
});
*/
