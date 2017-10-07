/**
 * 
 * ## DATA MANAGER
 * ----------------------------------
 * Functions that manipulate objects or perform important checks.
 * 
 * These are functions that support the interpretation of data from and to the tables.  
 * 
 */

var DataManager = {};

/**
 * Converts a *flat* object into a row.
 * 
 * @param {object} flatObj A flattened object to convert.
 * @param {array} headers The array of headers to key against.
 * @returns {array} The 1-dimensional, ordered array of object properties.
 */
DataManager.objectToRow = function(flatObj, headers) {
  var newRow = [];
  //var formulas = this.getObjectRange(obj.id).getFormulas()[0];

  for (var i = 0; i < headers.length; i++) {
    var header = headers[i];
    var value = DataManager.sanitize(flatObj[headers[i]]);

    if (DataManager.isNoWrite(value, headers)) {
      newRow.push('');
    } else {
      if (typeof value == 'string') {
        newRow.push(DataManager.sanitize(value));
      } else {
        newRow.push(value);
      }
    }
  }

  return newRow;
}

/**
 * Determines if a value or field type should not be written.
 * 
 * @param {primitive} value The number or string to be written.
 * @param {string} header The header name.
 * @returns {boolean} Whether the situation is a no-write.
 */
DataManager.isNoWrite = function(value, header) {
  return  header.indexOf('#NOWRITE') != -1 ||
          header.indexOf('#IGNORE') != -1 ||
          value == undefined || value == null
}

/**
 * Determines if a value or field type should not be read.
 * 
 * @param {string} header The header name.
 * @returns {boolean} Whether the situation is a no-read.
 */
DataManager.isNoRead = function(header) {
return  header.indexOf('#NOREAD') != -1 ||
        header.indexOf('#IGNORE') != -1;
}

/**
 * Converts an array of *flat* objects into an array of row arrays.
 * 
 * @param {array} flatObjs An array of flattened objects to convert.
 * @param {array} headers The array of headers to key against.
 * @returns {array} An array of arrays of ordered of object properties.
 */
DataManager.objectsToRows = function(flatObjs, headers) {
  var returnValue = [];
  for (var i = 0; i < flatObjs.length; i++) {
    returnValue.push(DataManager.objectToRow(flatObjs[i], headers));
  }
  return returnValue;
}

/**
 * Converts a row into an object.
 * 
 * @param {array} row The row array to convert.
 * @param {array} headers The array of headers to key against.
 * @returns {object} The *unflattened* object.
 */
DataManager.rowToObject = function(row, headers) {
  if (row.length != headers.length) 
    throw 'Header and Row data mismatch while unpacking object.';

  // TODO: discard empty fields.

  var flatObj = {};
  for (var col = 0; col < headers.length; col++) {
    var value = row[col];
    var header = headers[col];

    if (DataManager.isNoRead(header)) continue;

    // TODO: Trim other tag types.
    if (header.indexOf('#NOWRITE') != -1) {
      header = header.slice(0, -8).trim();
    }

    flatObj[header] = value;
  }

  return DataManager.unflattenObject(flatObj);
}

/**
 * Multiple property arrays into an array of *unflattened* objects.
 * 
 * @param {array} rows The array of property arrays to convert.
 * @param {array} headers The array of headers to key against.
 * @returns {array} An array of unflattened objects.
 */
DataManager.rowsToObjects = function(rows, headers) {
  var returnValue = [];
  for (var i = 0; i < rows.length; i++) {    
    if (rows[i].every(function(field){ return field == ''; })) continue;
    returnValue.push(DataManager.rowToObject(rows[i], headers));
  }
  return returnValue;
}

/**
 * Unfolds arrays and objects into a flattened object.
 * 
 * Objects often have nested values like arrays and objects. This process
 * "unfolds" those objects into flattened versions that can be written to a
 * row of data in a spreadsheet.  See tests for examples.
 * 
 * @param {object} obj The object to flatten.
 * @returns {object} The flattened object.
 */
DataManager.flattenObject = function(obj) {
  var result = {};
  DataManager.trimObject(obj);
  if (DataManager.isEmpty(obj)) return obj;

  function recurse(current, property) {
    if (Object(current) !== current) { // Non-object types.
      result[property] = current;
    }
    else if (Array.isArray(current)) { // Arrays.
      for (var i = 0, l = current.length; i < l; i++)
        recurse(current[i], property ? property + "." + i : "" + i);
      if (l == 0)
        result[property] = [];
    }
    else if (Object.prototype.toString.call(current) === '[object Date]') { // Dates.
      result[property] = current;
    }
    else { // Nested content.
      var isEmpty = true;
      for (var localProperty in current) {
        isEmpty = false;
        recurse(current[localProperty], property ? property + "." + localProperty : localProperty);
      }
      if (isEmpty)
        result[property] = {};
    }
  }
  recurse(obj, "");
  return result;
}

/**
 * Reverses the flattening process.
 * 
 * This process un-nests the data in a row into a "reconstituted" object.
 * 
 * @param {object} flatObj The object to unflatten.
 * @returns {object} The unflattened object.
 */
DataManager.unflattenObject = function(flatObj) {
  if (Object(flatObj) !== flatObj || 
      Array.isArray(flatObj)   ||
      DataManager.isEmpty(flatObj)) {
    return flatObj;
  }

  var result = {}, current, innerProperty, parts, index;

  for (var property in flatObj) {
    current = result, innerProperty = '';
    parts = property.split('.');
    for (var i = 0; i < parts.length; i++) {
      index = !isNaN(parseInt(parts[i]));
      current = current[innerProperty] || (current[innerProperty] = (index ? [] : {}));
      innerProperty = parts[i];
    }
    if (flatObj[property] !== '') {
      current[innerProperty] = flatObj[property];
    }
  }

  if (!result) return {};
  DataManager.trimObject(result['']);
  return result[''];
}

/**
 * Recurses through an object's properties and trims away undefined 
 * or null values.
 * 
 * @param {object} obj The object to trim.
 * @returns {object} The trimmed object.
 */
DataManager.trimObject = function(obj) {
  function dropItem(parent, child, key) {
    if (parent == null) return;
    if (Array.isArray(parent))
      parent.splice(-1, 1);
    else delete parent[key];
  }
  
  function recurse(parent, child, key) {
    // We have to iterate until all children come back clean.
    var done = true;

    do {
      // Drop null children.
      if (child == null || child == undefined) {
        dropItem(parent, child, key);
        done = false;
        return;
      }
      
      // Ignore basic types.
      if (Object(child) !== child) {
        return;
      }
      
      // Recurse for all sub-children.
      Object.keys(child).forEach(function(item) {
        recurse(child, child[item], item);
      });
      
      // One last emptiness check in case we need to self-destruct this child.
      if (Object.keys(child).length === 0 && child.constructor === Object) {
        dropItem(parent, child, key); // Drop empty objects.
        done = false;
        return;
      } else if (Array.isArray(child) && child.length == 0) {
        dropItem(parent, child, key); // Drop empty arrays.
        done = false;
        return;
      }
    } while (!done);
  }

  if (DataManager.isEmpty(obj)) return obj;
  recurse(null, obj, null);
  return obj;
}

/**
 * Sanitizes strings to be written to spreadsheets.
 * 
 * TODO: This is currently unused, but works.
 * 
 * @param {string} value The string or value to sanitize
 * @returns {string} The sanitized version of the input.
 */
DataManager.sanitize = function(value) {
  // Prepend problematic strings with a quote symbol.
  // It gets removed automatically when read.
  if (typeof value == 'string')
    if (value.match(/^[=+]/) || value.match(/"/))
      value = "'" + value;

  if (value == null || value == undefined)
    value = '';

  return value;
}

/**
 * Determines if an object is empty.
 * 
 * @param {object} obj The object to evaluate.
 * @returns {boolean} Whether the object is indeed empty.
 */
DataManager.isEmpty = function(obj) {
  for(var prop in obj) {
    if(obj.hasOwnProperty(prop))
        return false;
  }

  return JSON.stringify(obj) === JSON.stringify({});
}

/**
 * Removes duplicates from an array.
 * 
 * TODO: This is unused, but will be an important part of extending
 * headers when adding new objects to an Ob2SS table.
 * 
 * @param {array} arr The array to deduplicate.
 * @returns {array} The deduplicated array.
 */
DataManager.removeDupes = function(arr) {
  arr = arr.concat();
  for(var i = 0; i < arr.length; i++) {
    for(var j = i + 1; j < arr.length; j++) {
      if(arr[i] === arr[j])
        arr.splice(j--, 1);
      }
  }

  return arr;
};
