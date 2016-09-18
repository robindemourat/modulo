'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseDocument = exports.serializeDocument = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; /**
                                                                                                                                                                                                                                                   * This module converts an fsTree flatfile abstraction to a peritext document representation
                                                                                                                                                                                                                                                   * And it converts aperitext document representation to an fsTree flatfile abstraction
                                                                                                                                                                                                                                                   * @module converters/documentConverter
                                                                                                                                                                                                                                                   */

var _concatTree2 = require('./concatTree');

var _parseTreeResources2 = require('./parseTreeResources');

var _organizeTree2 = require('./organizeTree');

var _propagateData2 = require('./propagateData');

var _cleanNaiveTree2 = require('./cleanNaiveTree');

var _modelUtils = require('./../../utils/modelUtils');

var _resolveSectionAgainstModels = require('./../../resolvers/resolveSectionAgainstModels');

var _resolveResourcesAgainstModels = require('./../../resolvers/resolveResourcesAgainstModels');

var _resolveContextualizations = require('./../../resolvers/resolveContextualizations');

var _markdownConverter = require('../markdownConverter');

var _bibTexConverter = require('../bibTexConverter');

var sectionListToFsTree = function sectionListToFsTree(inputSectionList, basePath) {
  var sectionList = inputSectionList.map(function (section) {
    var folderTitle = section.id;
    var relPath = section.root ? '' : folderTitle;
    var children = [{
      type: 'file',
      extname: '.md',
      name: 'contents.md',
      path: relPath + '/contents.md',
      'stringContents': section.markdownContent
    }, {
      type: 'file',
      extname: '.bib',
      name: 'resources.bib',
      path: relPath + '/resources.bib',
      'stringContents': section.bibResources
    }
    // todo: customizers
    ];
    var folder = {
      type: 'directory',
      name: section.id,
      extname: '',
      path: relPath + '/',
      root: section.root,
      children: children
    };
    return folder;
  });

  var root = sectionList.find(function (section) {
    return section.root;
  });
  var children = sectionList.filter(function (section) {
    return !section.root;
  });
  delete root.root;
  root.children = root.children.concat(children);
  root.name = basePath.split('/').pop();
  return root;
};

var serializeMetadata = function serializeMetadata(metadata, models) {
  var obj = {};
  Object.keys(metadata).forEach(function (domain) {
    Object.keys(metadata[domain]).forEach(function (gKey) {
      var prop = metadata[domain][gKey];
      if (gKey === 'bibType' || !prop.inheritedVerticallyFrom && !prop.inheritedHorizontallyFrom) {
        // format prop name like twitter_title
        var key = domain === 'general' ? gKey : domain + '_' + gKey;
        var model = models.metadataModels[domain][gKey];
        if (model) {
          obj[key] = (0, _modelUtils.serializePropAgainstType)(prop.value, model.valueType, model);
        } else obj[key] = prop.value;
      }
    });
  });
  obj.bibType = 'peritext' + obj.bibType;
  return (0, _bibTexConverter.serializeBibTexObject)(obj);
};

var concatSection = function concatSection(section, models) {
  var metadataStr = serializeMetadata(section.metadata, models);
  return {
    markdownContent: section.markdownContents,
    bibResources: metadataStr,
    customizers: section.customizers,
    id: section.metadata.general.id.value
  };
};

// from documentSectionsList to fsTree
/**
 * Converts a sections' list to a fsTree representation of the resulting sourcedata
 * @param {Object} param - serializing params
 * @param {array} param.sectionList - the list of sections to serialize
 * @param {Object} param.models - the models to use for serializing
 * @param {string} param.basePath - the path to use as basis for determining serializing output paths
 * @return {Object} - returns the filesystem representation of the data
 */
var serializeDocument = exports.serializeDocument = function serializeDocument(_ref, callback) {
  var document = _ref.document;
  var models = _ref.models;
  var basePath = _ref.basePath;

  var sections = Object.keys(document.sections).map(function (key) {
    return document.sections[key];
  });
  // collect resources and prepare for serialization
  var resources = Object.keys(document.resources).map(function (key) {
    return document.resources[key];
  }).filter(function (resource) {
    return !resource.inheritedVerticallyFrom;
  }).map(function (resource) {
    var modelList = (0, _modelUtils.getResourceModel)(resource.bibType, models.resourceModels);
    if (modelList) {
      var _ret = function () {
        var model = void 0;
        return {
          v: Object.keys(resource).reduce(function (obj, key) {
            if (resource[key] !== undefined) {
              model = modelList.properties.find(function (thatModel) {
                return thatModel.key === key;
              });
              if (model) {
                obj[key] = (0, _modelUtils.serializePropAgainstType)(resource[key], model.valueType, model);
              } else obj[key] = resource[key];
            }

            return obj;
          }, {})
        };
      }();

      if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
    }
    return resource;
  });
  // collect contextualizers and prepare for serialization
  var contextualizers = Object.keys(document.contextualizers).map(function (key) {
    return document.contextualizers[key];
  }).filter(function (contextualizer) {
    return contextualizer && !contextualizer.describedInline;
  }).map(function (contextualizer) {
    var modelList = (0, _modelUtils.getResourceModel)(contextualizer.type, models.contextualizerModels);
    if (modelList) {
      var _ret2 = function () {
        var model = void 0;
        var cont = Object.keys(contextualizer).reduce(function (obj, key) {
          if (contextualizer[key] !== undefined) {
            model = modelList.properties.find(function (thatModel) {
              return thatModel.key === key;
            });

            if (model) {
              obj[key] = (0, _modelUtils.serializePropAgainstType)(contextualizer[key], model.valueType, model);
            } else obj[key] = contextualizer[key];
          }
          return obj;
        }, {});
        cont.bibType = 'contextualizer';
        return {
          v: cont
        };
      }();

      if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
    }
    contextualizer.bibType = 'contextualizer';
    return contextualizer;
  });
  // merge resources and contextualizers in a collection of entities to be rendered as bibTeX
  var bibResources = resources.concat(contextualizers).map(_bibTexConverter.serializeBibTexObject);
  // const globalMetadata = serializeMetadata(document.metadata, models);
  var fsSections = sections.map(function (section) {
    return concatSection(section, models);
  });
  // adding resources and contextualizers to first section / root
  fsSections[0].bibResources += bibResources.join('\n\n');
  fsSections[0].root = true;
  return sectionListToFsTree(fsSections, basePath);
};

// from fsTree (returned by any connector) to a documentSectionsList usable in app
/**
 * Parses an fsTree representation and renders a list of sections to be used with peritext exporters or as is
 * @param {Object} params - parsing params
 * @param {Object} params.tree - the input fsTree representation
 * @param {Object} params.parameters - language-related parameters
 * @param {Object} params.parent - a possible existing parent section - to use for inheritance phases - suitable for partial document parsing/re-rendering use cases (like with an editor app)
 * @param {Object} params.models - models to use for parsing the data
 * @param {function(error:error, results: Object)} callback - RCC representation of the contents and parsing errors list for UI
 */
var parseDocument = exports.parseDocument = function parseDocument(_ref2, callback) {
  var tree = _ref2.tree;
  var parameters = _ref2.parameters;
  var parent = _ref2.parent;
  var models = _ref2.models;

  // concat markdown, resources, styles, templates, components, and resolve includes, producing a clean 'dumb tree'

  var _concatTree = (0, _concatTree2.concatTree)(tree, parameters);

  var dumbTree = _concatTree.dumbTree;
  var dumbTreeErrors = _concatTree.errors;
  // parse bibtext to produce resources and metadata props, producing a 'naive tree' of sections

  var _parseTreeResources = (0, _parseTreeResources2.parseTreeResources)(dumbTree);

  var naiveTree = _parseTreeResources.naiveTree;
  var naiveTreeErrors = _parseTreeResources.errors;
  // validate and resolve metadata against their models for all sections

  var _cleanNaiveTree = (0, _cleanNaiveTree2.cleanNaiveTree)({ validTree: naiveTree }, models);

  var validTree = _cleanNaiveTree.validTree;
  var validTreeErrors = _cleanNaiveTree.errors;
  // bootstrap errors list

  var errors = dumbTreeErrors.concat(naiveTreeErrors).concat(validTreeErrors);
  // format objects, normalize metadata, and resolve organization statements

  var _organizeTree = (0, _organizeTree2.organizeTree)({ errors: errors, validTree: validTree });

  var organizedDocument = _organizeTree.document;
  var documentErrors = _organizeTree.errors;
  // propagate resources, metadata and customizers vertically (from parents to children sections), metadata lateraly (from metadata models propagation data)

  var _propagateData = (0, _propagateData2.propagateData)({ errors: documentErrors, document: organizedDocument, models: models, parent: parent });

  var richDocument = _propagateData.document;
  var richErrors = _propagateData.errors;
  // resolve data against their models

  var _resolveResourcesAgai = (0, _resolveResourcesAgainstModels.resolveResourcesAgainstModels)(richDocument.resources, models);

  var newResources = _resolveResourcesAgai.newResources;
  var resErrors = _resolveResourcesAgai.newErrors;

  richDocument.resources = newResources;
  errors = errors.concat(richErrors).concat(resErrors);
  // resolve sections against models
  for (var id in richDocument.sections) {
    if (richDocument.sections[id]) {
      var section = richDocument.sections[id];

      var _resolveSectionAgains = (0, _resolveSectionAgainstModels.resolveSectionAgainstModels)(section, models);

      var sectionErrors = _resolveSectionAgains.newErrors;
      var newSection = _resolveSectionAgains.newSection;

      errors = errors.concat(sectionErrors);
      delete newSection.resources;
      richDocument.sections[id] = newSection;
    }
  }
  // resolve contextualizers nested values
  for (var _id in richDocument.contextualizers) {
    if (richDocument.contextualizers[_id]) {
      richDocument.contextualizers[_id] = (0, _bibTexConverter.parseBibNestedValues)(richDocument.contextualizers[_id]);
    }
  }
  // parse markdown contents and organize them as blocks lists, and parse+resolve contextualization objects
  richDocument.contextualizations = {};
  for (var _id2 in richDocument.sections) {
    if (richDocument.sections[_id2]) {
      var _markdownToJsAbstract = (0, _markdownConverter.markdownToJsAbstraction)(richDocument.sections[_id2], parameters);

      var _sectionErrors = _markdownToJsAbstract.errors;
      var _section = _markdownToJsAbstract.section;
      var contextualizations = _markdownToJsAbstract.contextualizations;
      var contextualizers = _markdownToJsAbstract.contextualizers;

      errors = errors.concat(_sectionErrors);
      richDocument.sections[_id2] = _section;
      richDocument.contextualizers = Object.assign(richDocument.contextualizers, contextualizers);
      richDocument.contextualizations = Object.assign(richDocument.contextualizations, contextualizations);
    }
  }
  // resolve contextualizers statements against their models

  var _resolveBindings = (0, _resolveContextualizations.resolveBindings)({ document: richDocument, models: models });

  var globalErrors = _resolveBindings.errors;
  var newDocument = _resolveBindings.document;

  var document = newDocument;
  errors = errors.concat(globalErrors).filter(function (error) {
    return error !== null;
  });
  // update summary and document metadata with root
  document.metadata = Object.assign({}, document.sections[document.summary[0]].metadata);
  document.customizers = document.sections[document.summary[0]].customizers;
  document.forewords = document.sections[document.summary[0]];
  document.summary = document.summary.slice(1);
  callback(null, {
    errors: errors,
    document: document
  });
};