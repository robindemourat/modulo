'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _components = require('./../../core/components');

var _componentsFactory = require('./../../core/utils/componentsFactory');

var _componentsFactory2 = _interopRequireDefault(_componentsFactory);

var _radium = require('radium');

var _radium2 = _interopRequireDefault(_radium);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// let styles = {};

/**
 * dumb static-oriented component for displaying an image gallery
 */

var StaticImageGallery = (0, _radium2.default)(_class = function (_React$Component) {
  _inherits(StaticImageGallery, _React$Component);

  function StaticImageGallery() {
    _classCallCheck(this, StaticImageGallery);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(StaticImageGallery).apply(this, arguments));
  }

  _createClass(StaticImageGallery, [{
    key: 'render',


    /**
     * render
     * @return {ReactElement} markup
     */

    /**
     * propTypes
     * @property {string} schematype html schema type of the element
     * @property {array} resources array of resources used
     * @property {string} captionContent what to display as caption
     * @property {number} figureNumber in static mode, the number of the figure
     */
    value: function render() {
      return _react2.default.createElement(
        'figure',
        {
          role: 'group',
          className: 'peritext-static-image-gallery-container peritext-figure-container',
          itemScope: true,
          itemProp: 'citation',
          itemType: 'http://schema.org/' + this.props.schematype,
          'typeof': this.props.schematype,
          resource: this.props.figureNumber ? 'peritext-figure-' + this.props.figureNumber : undefined,
          id: 'peritext-figure-' + this.props.id
        },
        _react2.default.createElement(
          'div',
          { className: 'peritext-static-image-gallery-figures-wrapper' },
          this.props.resources.map(function (resource) {
            return _react2.default.createElement(_components.StaticImageFigure, { resource: resource, key: resource.citeKey });
          })
        ),
        _react2.default.createElement(
          'figcaption',
          {
            itemProp: 'description',
            property: 'description' },
          _react2.default.createElement(
            'span',
            { className: 'peritext-figure-marker' },
            'Figure ',
            _react2.default.createElement(
              'span',
              { className: 'peritext-figure-number' },
              this.props.figureNumber
            )
          ),
          _react2.default.createElement(
            'span',
            null,
            ' – '
          ),
          _react2.default.createElement(
            'span',
            { className: 'peritext-figure-caption-content' },
            (0, _componentsFactory2.default)(this.props.captionContent)
          )
        )
      );
    }
  }]);

  return StaticImageGallery;
}(_react2.default.Component)) || _class;

StaticImageGallery.propTypes = {
  schematype: _react.PropTypes.string,
  resources: _react.PropTypes.array,
  captionContent: _react.PropTypes.array,
  figureNumber: _react.PropTypes.number,
  id: _react.PropTypes.string
};
StaticImageGallery.defaultProps = {
  schematype: 'ImageGallery',
  comment: ''
};
exports.default = StaticImageGallery;
module.exports = exports['default'];