/**
 * This module parses and serializes bibTex objects
 * @module converters/bibTexConverter
 */

/**
 * homemade bibTeX syntax parser (performance could be improved I guess)
 * it needs a second pass to parse {} in values and analyze them against a model - that should be done elsewhere, as this converter just deals with syntax-to-object conversion
 */
class bibTexParser {
  /**
   * constructor
   */
  constructor() {
    this.STATES = ['bibType', 'id', 'properties'];
    this.testing = false;
  }

  /**
   * Adds a key+value prop to the resource's javascript representation object
   * @param {object} obj - the resource representation
   * @param {string} key - the key to populate
   * @param {string} value - the value to set
   * @return {object} newObj - the updated resource representation
   */
  addValue(obj, key, value) {
    if (obj[key]) {

      if (Array.isArray(obj[key])) {
        obj[key].push(value);
      }else obj[key] = [obj[key], value];

    }else obj[key] = value;

    return obj;
  }

  /**
   * Consumes a string (stored in this.consumable) representation of a bibTeX expression
   * @return {boolean} exit - a simple exit trigger (but internal props will have been mutated)
   */
  consume() {
    const matchBibType = /^@([^{]+)/;
    const matchId = /^{([^,]+),/;
    const wrappers = [
      ['{', '}'],
      ['"', '"']
    ];

    if (this.testing) {
      console.log('current state: ', this.currentState);
    }

    let match;
    if (this.currentState === 'bibType') {
      match = matchBibType.exec(this.consumable);
      if (match) {
        this.currentObject.bibType = match[1];
        this.consumable = this.consumable.substr(match[1].length + 1);
        this.currentState = this.STATES[1];
        return true;
      }
      this.error = {
        type: 'error',
        preciseType: 'bibParsingError',
        message: 'could not find bibType',
        initialString: this.initialStr
      };
      return true;

    } else if (this.currentState === 'id') {
      match = matchId.exec(this.consumable);
      if (match) {
        this.currentObject.id = match[1];
        this.consumable = this.consumable.substr(match[1].length + 2);
        this.currentState = this.STATES[2];
        return true;
      }
      this.error = {
        type: 'error',
        preciseType: 'bibParsingError',
        message: 'could not find citekey',
        initialString: this.initialStr
      };
      return true;

    /*
     * ``key = value`` structure
     * value is always wrapped inside character couples that vary depending on bibtex implementation (" { ')
     * possibility of nested wrapping (eg {Name {{S}urname}})
     */
    }else if (this.currentState === 'properties') {
      const wrapped = [wrappers[0]];
      let index = 0;
      let mode = 'key';
      let temp = '';
      let tempKey = '';
      let trespassing;
      let character;
      let entering;

      if (this.testing) {
        console.log('initial parser mode: ', mode, ' || stored wrapped pairs : ', wrapped);
      }

      while (wrapped.length > 0) {

        trespassing = index > this.consumable.length - 1;
        character = this.consumable.charAt(index);
        if (this.testing) {
          console.log('===\nNEW PARSING STATE \n===');
          console.log('actual char', character);
          console.log('actual mode: ', mode);
          console.log('actual wrapped pairs: ', wrapped);
        }

        if (trespassing) {
          this.error = {
            type: 'error',
            preciseType: 'bibParsingError',
            message: 'finished to parse bibtex string without finding closing character ' + wrapped[wrapped.length - 1][1],
            initialString: this.initialStr
          };
          if (this.testing)console.log('trespassing');
          return true;
        // end of wrapped expression - if matches with last recorded wrapper's closing character
        } else if (character === wrapped[wrapped.length - 1][1]) {
          wrapped.pop();
          if (wrapped.length > 1) {
            temp += character;
          }
          index = 1;
          if (this.testing)console.log('poped a wrapping level');
        // end of key specification, record tempkey and wait to have found value
        } else if (mode === 'key' && character === '=') {
          tempKey = temp.trim();
          if (this.testing)console.log('encountered a = in key mode, storing key ', tempKey);
          temp = '';
          mode = 'value';
          index = 1;
        // end of value specification - add value and reboot temp
        }else if (mode === 'value' && wrapped.length < 2 && character === ',') {
          if (this.testing)console.log('end of line, storing prop');
          this.addValue(this.currentObject, tempKey, temp.trim());
          temp = '';
          mode = 'key';
          index = 1;
        // in the middle of some key or value = continue
        } else if (mode === 'value') {
          entering = false;
          // catch wrapper char
          wrappers.some((wrapper) => {
            if (this.consumable.charAt(index) === wrapper[0]) {
              entering = true;
              return wrapped.push(wrapper);
            }
          });
          if (!(entering && wrapped.length <= 2)) {
            temp += character;
          }
          if (this.testing)console.log('continuing in value ', temp);
          index = 1;
        // default, by security
        } else {
          if (this.testing)console.log('default exit doing nothing');
          // if(this.testing)console.log('current string: ', this. consumable.substr(index));
          temp += character;
          index = 1;
        }
        this.consumable = this.consumable.substr(index);
        if (this.testing)console.log(this.currentObject);

      }
      this.addValue(this.currentObject, tempKey.trim(), temp.trim());

      // add if not empty
      if (Object.keys(this.currentObject).length) {
        this.results.push(Object.assign({}, this.currentObject));
      }
      this.currentObject = {};
      this.consumable = this.consumable.substr(index).trim();
      this.currentState = this.STATES[0];
      return true;
    }
  }


  /**
   * Parses a bibTeX string and callbacks a javascript objet
   * @param {string} str - the string to parse
   * @param {function(error:error, results:Object)} callback
   */
  parse(str, callback) {
    this.currentObject = {};
    this.currentState = this.STATES[0];
    this.results = [];
    this.consumable = str.trim();
    this.initialStr = str.trim();
    this.error = null;
    while (this.error === null && this.consumable.trim().length > 0) {
      this.consume();
    }
    return callback(this.error, this.results);
  }

}

const parser = new bibTexParser();


/**
 * Parses a bibTeX string and returns an object
 * @param {string} str - the bibTeX string to parse
 * @return {function(error: error, result: Object)} callback - error and the resulting object
 */
export const parseBibTexStr = (str, callback) => {
  if (typeof str === 'string') {
    return parser.parse(str, callback);
  }
  return callback(new Error('must input a string'), undefined);
};

const validateBibObject = function(bibObject) {
  if (bibObject.id === undefined) {
    return {
      type: 'error',
      preciseType: 'bibObjectValidationError',
      message: 'bibObject must have a id property',
      bibObject: bibObject
    };
  } else if (bibObject.bibType === undefined) {
    return {
      type: 'error',
      preciseType: 'bibObjectValidationError',
      message: 'bibObject must have a bibType property',
      bibObject: bibObject
    };
  }

  for (const key in bibObject) {
    if (typeof bibObject[key] === 'object' && !Array.isArray(bibObject[key])) {
      return {
        type: 'error',
        preciseType: 'bibObjectValidationError',
        message: 'bibObject cannot contain nested objects',
        bibObject: bibObject
      };
    }
  }

  return true;
};

/**
 * Serializes a javascript object representing a resource or a contextualizer, to a bibTeX-formatted string
 * @param {object} bibObject - the resource/contextualizer representation
 * @return {string} bibStr - the bibTeX mention as a string
 */
export const serializeBibTexObject = (bibObject) => {
  const validated = validateBibObject(bibObject);
  if (validated.type === 'error') {
    return validated;
  }
  let str = '';
  let val;
  for (const key in bibObject) {
    if (bibObject[key]) {
      val = bibObject[key];
      if (Array.isArray(val)) {
        val.forEach((value)=>{
          str += '\t' + key + ' = {' + value + '},\n';
        });
        //  val = val.join(',');
      }else if (key !== 'id' && key !== 'bibType') {
        str += '\t' + key + ' = {' + val + '},\n';
      }
    }
  }
  // removing the last coma
  if (str.length > 1) {
    str = str.substr(0, str.length - 2);
  }
  return `@${bibObject.bibType}{${bibObject.id},
    ${str}
}`;
};

/**
Accepted inputs for authors and persons (to add in doc/spec):
{Martin}, Julia; Coleman
{Jakubowicz}, Andrew
{Charalambos}, D. Aliprantis and Kim C. {Border}
{Martin}, Julia; Coleman
{Jakubowicz}, Andrew
{Charalambos}, D. Aliprantis and Kim C. {Border}
Maskin, Eric S.
{Martin}, Julia; Coleman
{Jakubowicz}, Andrew
{Charalambos}, D. Aliprantis and Kim C. {Border}
Maskin, Eric S.
{Martin}, Julia; Coleman
{Jakubowicz}, Andrew
{Charalambos}, D. Aliprantis and Kim C. {Border}
*/

/**
 * Parses a list of authors as they are formatted in bbiTeX statements
 * @param {string} str - the bibTeX string to parse
 * @return {array} authors - the javascript representation of authors as an array
 */
export const parseBibAuthors = (str) => {
  const authors = str.split(/;|and|et/);
  const additionalInfo = /\(([^)]*)?\)?\(?([^)]*)?\)?/;
  let match;
  return authors.filter((inputStr) =>{
    return inputStr.trim().length > 0;
  }).map((inputAuthorStr) =>{
    let workingStr = inputAuthorStr;
    let authorStr = '';
    let firstName;
    let lastName;
    let role = 'author';
    let information;
    match = inputAuthorStr.match(additionalInfo);
    if (match) {
      workingStr = workingStr.replace(match[0], '');
      if (match[1]) {
        role = match[1].trim();
      }
      if (match[2]) {
        information = match[2];
        information = information.trim();
      }
    }
    const lastNameMatch = workingStr.match(/{([^}]*)}/);
    if (lastNameMatch) {
      lastName = lastNameMatch[1].trim();
      authorStr = [workingStr.substr(0, lastNameMatch.index), workingStr.substr(lastNameMatch.index + lastNameMatch[0].length)].join('');
      firstName = authorStr.replace(',', '').trim();
    } else {
      let vals = workingStr.split(',');
      if (vals.length > 1) {
        firstName = vals[1].trim();
        lastName = vals[0].trim();
      } else if (workingStr.trim().indexOf(' ') > -1) {
        vals = workingStr.trim().split(' ');
        firstName = vals.shift().trim();
        lastName = vals.join(' ').trim();
      } else {
        lastName = workingStr.trim();
        firstName = '';
      }
    }
    const id = (role + '-' + firstName + lastName).toLowerCase().replace(' ', '-');
    return {firstName, lastName, role, information, id};
  });
};

/**
 * Parses a bibTeX-like contextualization statement given as string and returns an object
 * @param {string} inputStr - the bibTeX string to parse
 * @return {Object} contextualization - the contextualization object
 */
export const parseBibContextualization = (inputStr) => {
  const bracketsRE = /([^=^,]+)=(?:{)([^}]*)(?:}),?/g;
  const quoteRE = /([^=^,]+)="([^"]*)",?/g;
  const paramsObject = {};


  const str = inputStr.substr(1, inputStr.length - 2).replace(/&quot;/g, '"');
  let match;
  let key;
  let expression;
  let subObject;
  let newObj;

  while ((match = bracketsRE.exec(str)) !== null) {
    key = match[1].trim();
    expression = match[2].trim().split(',');
    // simple
    if (expression.length === 1) {
      paramsObject[key] = expression[0];
    // nested
    } else {
      subObject = {};

      let isArray;

      expression = expression.map((exp) =>{
        const split = exp.split('=');
        if (split.length === 2) {
          isArray = false;
          return {
            key: split[0],
            value: split[1]
          };
        }
        isArray = true;
        return exp;
      });

      if (!isArray) {
        subObject = expression.reduce((obj, exp)=>{
          obj[exp.key] = exp.value;
          return obj;
        }, subObject);
      }

      newObj = Object.assign({}, subObject);

      if (paramsObject[key] === undefined) {
        paramsObject[key] = newObj;
      } else if (Array.isArray(paramsObject[key])) {
        paramsObject[key].push(newObj);
      } else paramsObject[key] = [paramsObject[key], newObj];
    }

  }

  while ((match = quoteRE.exec(str)) !== null) {
    key = match[1].trim();
    expression = match[2].trim();
    paramsObject[key] = expression;
  }

  return paramsObject;
};


const resolveNested = (subVal) => {
  if (typeof subVal !== 'string') {
    return subVal;
  }
  let expression = subVal.split(',');
  let subObject;
  let newObj;
  // simple
  if (expression.length === 1) {
    return subVal;
  // nested
  }
  subObject = {};
  let isArray;
  expression = expression.map((exp) =>{
    const split = exp.split('=');
    if (split.length === 2) {
      isArray = false;
      return {
        key: split[0],
        value: split[1]
      };
    }
    isArray = true;
    return exp;
  });

  if (!isArray) {
    subObject = expression.reduce((obj, exp)=>{
      obj[exp.key] = exp.value;
      return obj;
    }, subObject);
  }

  newObj = Object.assign({}, subObject);
  return newObj;
};

/**
 * Parses bibTeX nested values inside a bibObject
 * @param {Object} bibObject - the object to parse
 * @return {Object} newObject - the resulting updated object
 */
export const parseBibNestedValues = (bibObject) => {
  const newObject = Object.assign({}, bibObject);
  let subVal;
  for (const index in newObject) {
    if (newObject[index]) {
      subVal = newObject[index];
      if (Array.isArray(subVal)) {
        newObject[index] = bibObject[index].map(resolveNested);
      }else {
        newObject[index] = resolveNested(newObject[index]);
      }
    }
  }
  return newObject;
};
