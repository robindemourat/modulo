/**
 * Image gallery contextualizer that resolve sections data according to contextualization+settings params
 * @module contextualizers/imagegallery
 */
import { get as getByPath } from 'object-path';

// import StaticImageGallery from './StaticImageGallery';

/**
 * Handle an inline contextualization for static outputs
 * @param {Object} inputDocument - The representation of the peritext document to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newDocument - the updated representation of the peritext document in which the contextualization was made
 */
export const contextualizeInlineStatic = (inputDocument, inputContextualization, settings) => {

  const document = Object.assign({}, inputDocument);
  const contextualization = Object.assign({}, inputContextualization);
  const sectionId = contextualization.nodePath[0];
  const path = ['sections', ...contextualization.nodePath.slice()];
  const node = getByPath(document, path);
  const section = document.sections[sectionId];

  const nodeBlockIndex = path[3];
  let figureId;
  let number;
  const contents = node.children;
  // if figure is not there yet, add it
  if (!contextualization.sectionOpCit) {
    figureId = sectionId + '-' + contextualization.id;
    contextualization.figureId = figureId;
    document.figuresCount = document.figuresCount ? document.figuresCount + 1 : 1;
    contextualization.figureNumber = document.figuresCount;
    contextualization.figureId = figureId;
    const figure = {
      node: 'element',
      special: true,
      tag: 'StaticImageGallery',
      props: {
        resources: contextualization.resources.map(key => document.resources[key]),
        captionContent: [{
          node: 'text',
          text: contextualization.title || document.resources[contextualization.resources[0]].title
        }],
        figureNumber: contextualization.figureNumber,
        id: figureId
      }
    };
    number = contextualization.figureNumber;
    if (settings.figuresPosition === 'inline') {
      // insert contextualization block (could be refactored as an util)
      section.contents = [
        ...section.contents.slice(0, nodeBlockIndex),
        figure,
        ...section.contents.slice(nodeBlockIndex)
      ];
      const newNodePath = [sectionId, 'contents', nodeBlockIndex + 1];
      document.contextualizations[contextualization.id].nodePath = newNodePath;
      // update contextualizations that target subsequent contents blocks
      Object
      .keys(document.contextualizations)
      .map(key => document.contextualizations[key])
      .filter(cont =>
        cont.nodePath.slice(0, 2).join() === newNodePath.slice(0, 2).join()
        && cont.nodePath[2] > nodeBlockIndex
      )
      .forEach(cont => {
        cont.nodePath[2]++;
      });
    } else {
      section.figures = section.figures ? section.figures.concat(figure) : [figure];
    }
  } else {
    figureId = sectionId + '-' + contextualization.precursorId;
    number = document.contextualizations[contextualization.precursorId].figureNumber;
  }
  const displayId = '#peritext-figure-' + figureId;
  const newContents = [
    ...contents.slice(),
    {
      node: 'text',
      text: ' ('
    },
    {
      node: 'element',
      tag: 'a',
      attr: {
        href: displayId
      },
      children: [
        {
          node: 'text',
          text: 'figure ' + number
        }
      ]
    },
    {
      node: 'text',
      text: ') '
    }
  ];
  node.tag = 'span';
  node.children = newContents;
  document.contextualizations[contextualization.id] = contextualization;
  return document;
};

/**
 * Handle a block contextualization for static outputs
 * @param {Object} inputDocument - The representation of the peritext document to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newDocument - the updated representation of the peritext document in which the contextualization was made
 */
export const contextualizeBlockStatic = (inputDocument, inputContextualization, settings) => {
  const document = Object.assign({}, inputDocument);
  const contextualization = Object.assign({}, inputContextualization);
  const sectionId = contextualization.nodePath[0];
  const path = ['sections', ...contextualization.nodePath.slice()];
  const node = getByPath(document, path);
  const section = document.sections[sectionId];

  const nodeBlockIndex = path[3];

  let figureId;
  document.figuresCount = document.figuresCount ? document.figuresCount + 1 : 1;
  figureId = sectionId + '-' + contextualization.id;
  contextualization.figureId = figureId;
  contextualization.figureNumber = document.figuresCount;
  const figure = {
    node: 'element',
    special: true,
    tag: 'StaticImageGallery',
    props: {
      resources: contextualization.resources.map(key => document.resources[key]),
      captionContent: node.children[0].children,
      figureNumber: contextualization.figureNumber,
      id: figureId
    }
  };
  if (settings.figuresPosition === 'inline') {
    section.contents[nodeBlockIndex] = figure;
  } else {
    section.figures = section.figures ? section.figures.concat(figure) : [figure];
  }
  document.contextualizations[contextualization.id] = contextualization;
  return document;
};

/**
 * Handle an inline contextualization for dynamic outputs
 * @param {Object} inputDocument - The representation of the peritext document to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newDocument - the updated representation of the peritext document in which the contextualization was made
 */
export const contextualizeInlineDynamic = (inputDocument, contextualization, settings) => {
  return inputDocument;
};

/**
 * Handle a block contextualization for dynamic outputs
 * @param {Object} inputDocument - The representation of the peritext document to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newDocument - the updated representation of the peritext document in which the contextualization was made
 */
export const contextualizeBlockDynamic = (inputDocument, inputContextualization, settings) => {
  const document = Object.assign({}, inputDocument);
  const contextualization = Object.assign({}, inputContextualization);
  const sectionId = contextualization.nodePath[0];
  const path = ['sections', ...contextualization.nodePath.slice()];
  const node = getByPath(document, path);
  const section = document.sections[sectionId];
  section[path[2]][path[3]] = node;
  return document;
};
