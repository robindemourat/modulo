import React, {PropTypes} from 'react';
import { intlShape, defineMessages } from 'react-intl';

const translate = defineMessages({
  tableofcontents: {
    id: 'table_of_contents',
    description: 'Table of contents title',
    defaultMessage: 'Table of contents',
  }
});

/**
 * dumb component for rendering a static table of contents
 */
class StaticTableOfContents extends React.Component {

  /**
   * propTypes
   */
  static propTypes = {
    contents: PropTypes.array,
    level: PropTypes.number,
    id: PropTypes.string
  };

  static defaultProps = {
    title: 'Table of contents',
    level: 1
  };


  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    const { formatMessage } = this.context.intl;
    return (
      <section
        id={this.props.id}
        className="peritext-static-table-of-contents-container"
      >
        <h2>{ formatMessage(translate.tableofcontents, {}) }</h2>
        <section className="peritext-static-table-of-contents-elements-container">
          {this.props.contents.map((element) =>{
            return <StaticTableOfContentsElement id={element.id} key={element.id} title={element.title} level={element.level} levelDisplacement={this.props.level}/>;
          })}
        </section>
      </section>
    );
  }
}

StaticTableOfContents.contextTypes = { intl: intlShape };

export default StaticTableOfContents;

class StaticTableOfContentsElement extends React.Component {

  /**
   * propTypes
   */
  static propTypes = {
    title: PropTypes.string,
    level: PropTypes.number,
    id: PropTypes.string,
    paddingDisplacement: PropTypes.number,
    levelDisplacement: PropTypes.number
  };

  static defaultProps = {
    level: 0,
    paddingDisplacement: 0.5,
    levelDisplacement: 0
  };

  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    return (
      <section
        className="peritext-static-table-of-contents-element-container"
        style={{paddingLeft: (this.props.level - this.props.levelDisplacement - 1) * this.props.paddingDisplacement + 'cm'}}
      >
        <a
          href={'#' + this.props.id}
        >
          {this.props.title}
        </a>
      </section>
    );
  }
}
