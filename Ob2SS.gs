//  //  //  //  //
// LIBRARY GLOBALS AND CONSTRUCTORS
//  //  //  //  //
/**
 * Initialize Ob2SS with options.  Details at artofthesmart.com/projects/ob2ss
 * 
 * sheetKey: This is the key to a spreadsheet you want to use. Default is one is created for you.
 * headerOffset: What header offset to use.  Default 0.
 *
 * @param {object} options An options object to control library use.
 * @returns {bool} Whether initialization was successful.
 */
function initialize(options) {
  if (!options) {
    options = {};
  }
  this.options = options;
  this.tables = {};

  if (!options.sheetKey) {
    this.spreadsheet = SpreadsheetApp.create('Ob2SS Unnamed Database', 1, 1)
  } else try {
    this.spreadsheet = SpreadsheetApp.openById(options.sheetKey);
  } catch (e) { 
    throw 'Could not open the specified spreadsheet: ' + options.sheetKey; 
  }

  this.initialized = true;
  return true;
}

/**
 * Returns a table from Ob2SS for read/write operations.
 * 
 * Each table is a sheet in the Spreadsheet set up during initialization.
 * If a table doesn't exist, one will be created for you.  If one exists,
 * this will hook it up so you can begin reading/writing.
 *
 * @param {string} type The type of data you want to read/write (think table or class).
 * @returns {Ob2SSTable_} A table you can perform operations on.
 */
function getTable(type) {
  if (!this.initialized) throw 'Cannot access a table if Ob2SS is not yet initialized.';
  
  if (!tables[type]) {
    if (this.spreadsheet.getSheetByName(type)) {
      tables[type] = new Ob2SSTable_({
        spreadsheet: this.spreadsheet,
        sheet: this.spreadsheet.getSheetByName(type),
        type: type,
        headerOffset: this.options.headerOffset
      });
    } else {
      tables[type] = new Ob2SSTable_({
        spreadsheet: this.spreadsheet,
        type: type,
        headerOffset: this.options.headerOffset
      });
    }
  }

  return tables[type];
}

/**
 * INTERNAL: Sets up a new table as part of Ob2SS.
 * 
 * This is a constructor function for an Ob2SS "table".  It's a wrapper around a
 * sheet object in Google Spreadsheets that includes insert/read/write/delete
 * functionality.
 *
 * @param {object} options An options object to control library use.
 */
var Ob2SSTable_ = function (options) {
  if (!options) throw 'Must include an options parameter to set up a table.';
  if (!options.spreadsheet) throw 'Must have a parent spreadsheet.';

  this.options = options;

  this.spreadsheet = options.spreadsheet;

  if (options.sheet) {
    this.sheet = options.sheet;
    this.type = options.sheet.getSheetName();
    return;
  }
  
  if (options.type) {
    this.type = options.type;
    this.sheet = options.spreadsheet.insertSheet(this.type);
    this.sheet.deleteRows(2, this.sheet.getMaxRows() - 1);
    this.sheet.deleteColumns(2, this.sheet.getMaxColumns() - 1);
    this.sheet.getRange(1,1,1,1).setValues([['id']]); //setValues requires 2D array.
    return;
  }

  throw 'Must have a type or a sheet in the options parameter.';
}


//  //  //  //  //
// CREATE OR WRITE
//  //  //  //  //
/**
 * Writes an object into the table.
 * 
 * Every object *MUST* have an 'id' parameter. If you don't set one, one
 * will be automatically assigned and added to your objects. Automatic IDs
 * are unique, but deleted object ids are re-used.  Insertion checks
 * for repeat IDs and throws an error if an ID is repeated.
 *
 * @param {object} obj The object to write.
 * @returns {boolean} True if written, false if it couldn't be written.
 */
Ob2SSTable_.prototype.add = function(obj) {
  if (!obj) return false;
  if (typeof obj !== 'object') return false;

  var flatObj = this.flattenObject(obj);

  // Make sure there's a unique ID.
  if (!obj.id) obj.id = this.getNextId();
  if (this.getColumnAsArray('id').indexOf(obj.id) != -1) {
    throw 'Cannot insert object with duplicate id. Use update instead.';
  }

  this.extendHeaders(Object.getOwnPropertyNames(flatObj));
  this.insertObject(flatObj);
}

/**
 * Updates an object in the table.
 * 
 * Both the `target` and the `source` of the update *MUST* have an identical
 * 'id' parameter.  This throws errors if things aren't in place properly.
 *
 * @param {object} source The object you want to source changes from.
 * @returns {boolean} True if update successful, false if not.
 */
Ob2SSTable_.prototype.update = function(source) {
  if (!source) throw 'Update(source): Object is undefined.';
  if (typeof source !== 'object') throw 'Update(source): Cannot update using a non-object.';
  if (typeof source.id == 'undefined') throw 'Update(source): Cannot update without an id on the object.';

  var target = this.getObject(source.id);
  var flatTarget = this.flattenObject(target);
  var flatSource = this.flattenObject(source);

  for (var prop in flatSource) {
    if (flatSource.hasOwnProperty(prop)) flatTarget[prop] = flatSource[prop];
  }

  // Extend headers in case this object has new properties, then update.
  this.extendHeaders(Object.getOwnPropertyNames(flatSource));
  this.updateObject(flatTarget);
}

// -- // -- // -- // -- // -- // -- // -- //
/**
 * Flattens an object for writing.
 */
Ob2SSTable_.prototype.flattenObject = function(data) {
  var result = {};
  function recurse(cur, prop) {
    if (Object(cur) !== cur) {
      result[prop] = cur;
    } else if (Array.isArray(cur)) {
      for (var i = 0, l = cur.length; i < l; i++)
        recurse(cur[i], prop ? prop + "." + i : "" + i);
      if (l == 0)
        result[prop] = [];
    } else {
      var isEmpty = true;
      for (var p in cur) {
        isEmpty = false;
        recurse(cur[p], prop ? prop + "." + p : p);
      }
      if (isEmpty)
        result[prop] = {};
    }
  }
  recurse(data, "");
  return result;
}
/**
 * Unflattens an object for reading.
 */
Ob2SSTable_.prototype.unflattenObject = function(data) {
  if (Object(data) !== data || Array.isArray(data))
    return data;
  var result = {}, cur, prop, parts, idx;
  for (var p in data) {
    cur = result, prop = "";
    parts = p.split(".");
    for (var i = 0; i < parts.length; i++) {
      idx = !isNaN(parseInt(parts[i]));
      cur = cur[prop] || (cur[prop] = (idx ? [] : {}));
      prop = parts[i];
    }
    cur[prop] = data[p];
  }
  return result[""];
}
/**
 * Sanitizes a string for writing into a spreadsheet.
 * 
 * @param {string} value The value to sanitize.
 * @returns {string} A string that is safe to write to spreadsheets.
 */
Ob2SSTable_.prototype.sanitize = function(value) {
  if (typeof value === 'string')
    if (value.match(/^=/) || value.match(/"/))
      value = "'" + value; // Prepend with a quote if this string would break Sheets.
  
  return value;
}

/**
 * When an object is inserted into a table, its headers are checked against the
 * headers already in place.  If they're different, the table's headers are 
 * extended to accommodate the new object of the same type.
 * 
 * @param {array} flatObjProps The property names of the object to be inserted.
 */
Ob2SSTable_.prototype.extendHeaders = function(flatObjProps) {
  var headers = this.getHeaders();

  // If not every property has a place in the sheet, add cols and setup the new header row.
  var missingProperties = flatObjProps.filter(function (property) {
    return headers.indexOf(property) == -1;
  });

  if (missingProperties.length > 0) {
    headers = headers.concat(missingProperties);
    for (var i = 0; i < headers.length; i++)
      headers[i] = this.sanitize(headers[i]);
    this.sheet.insertColumnsAfter(this.sheet.getMaxColumns(), missingProperties.length);
    this.getHeadersRange().setValues([headers]);
  }
}
/**
 * Inserts an object into the Google sheet.
 * 
 * @param {object} flatObj The flattened object to be inserted into the prepared sheet.
 */
Ob2SSTable_.prototype.insertObject = function(flatObj) {
  var newRow = [];
  var headers = this.getHeaders();
  for (var i = 0; i < headers.length; i++) {
    var value = flatObj[headers[i]] || '';
    value = this.sanitize(value);

    newRow.push(value);
  }
  this.sheet.appendRow(newRow);
}

/**
 * Updates an object in the Google Sheet.
 * 
 * @param {object} flatObj The flattened object (with id) to be updated in the table to match.
 */
Ob2SSTable_.prototype.updateObject = function(flatObj) {
  var newRow = [];
  var headers = this.getHeaders();
  for (var i = 0; i < headers.length; i++) {
    var value = flatObj[headers[i]] || '';
    value = this.sanitize(value);

    newRow.push(value);
  }

  var objectRange = this.getObjectRange(flatObj.id);
  objectRange.setValues([newRow]);
}


//  //  //  //  //
// READ
//  //  //  //  //
/**
 * Reads all objects fromt he table into an array.
 * 
 * @returns {array} An array of all objects in the database.
 */
Ob2SSTable_.prototype.toArray = function() {
  var data = this.getData();
  var objects = [];

  for (var row = 0; row < data.length; row++) {
    objects.push(this.rowToObject(data[row]));
  }

  return objects;
}
/**
 * Returns the number of items in the table.
 * 
 * @returns {number} The number of items in the table.
 */
Ob2SSTable_.prototype.count = function() {
  var headerRows = Math.max(this.sheet.getFrozenRows(), 1);
  var totalRows = this.sheet.getMaxRows();
  return totalRows - headerRows;
}
/**
 * Gets an object by its ID.
 * 
 * Note that while Ob2SS prevents you from writing an object with
 * a duplicate ID value, nothing will prevent one of your users from 
 * writing duplicate values by hand.  This returns the FIRST object
 * with the ID you're looking for.
 * 
 * @returns {object} The FIRST object with this id value.
 */
Ob2SSTable_.prototype.getObject = function(id) {
  var objectRange = this.getObjectRange(id);
  if (!objectRange) return null;

  var row = objectRange.getValues()[0];
  return this.rowToObject(row);
}

// -- // -- // -- // -- // -- // -- // -- //
/**
 * Converts a row of data into an object.
 * 
 * @param {array} row A row of field contents from the sheet that match the sheets headers.
 * @returns {object} A flattened object with contents equal to the passed array.
 */
Ob2SSTable_.prototype.rowToObject = function(row) {
  var headers = this.getHeaders();
  var flatObj = {};

  if (row.length != headers.length) 
    throw 'Header and Row data mismatch while unpacking object.';

  for (var col = 0; col < headers.length; col++) {
    var value = row[col]; /*
    if (typeof value === 'string')
      if (value.match(/^'=/) || value.match(/^'[.+]"[.+]/))
        value = value.slice(1); // Prepend with a quote if this string would break Sheets.
    */
    flatObj[headers[col]] = row[col];
  }

  return this.unflattenObject(flatObj);
}
/**
 * Gets the headers for this table.
 * 
 * @returns {array} An array of strings that are the headers of this table.
 */
Ob2SSTable_.prototype.getHeaders = function() {
  return this.getHeadersRange().getValues()[0];
}
/**
 * Gets the range for the headers for this table.
 * 
 * This function is important. We need to know which row is the header row
 * in order to insert and get objects, but it's variable. Some folks will never look at it
 * and use the built-in java-script-y titles, while other users will want to write their own
 * custom "pretty" headers.
 * 
 * If **headerOffset** is set, the header row will offset by that amount (usually -1).
 * 
 * @returns {Range} A Google Apps Script Range object where the headers are stored.
 */
Ob2SSTable_.prototype.getHeadersRange = function() {
  var headerRow = this.sheet.getFrozenRows();

  if (this.options.headerOffset) {
    headerRow += this.options.headerOffset;
  }

  // Use either the last frozen row, the offset-modified row, or the default of 1.
  var rowIndex = Math.max(headerRow, 1);

  return this.sheet.getRange(rowIndex, 1, 1, this.sheet.getMaxColumns());
}
/**
 * Gets a column of the table as an array.
 * 
 * Note that this is transposed such that it returns a horizontal array
 * representing the vertical values of a column.
 * 
 * @returns {array} An array of values stored in this column.
 */
Ob2SSTable_.prototype.getColumnAsArray = function(property) {
  if (this.count() == 0) return [];

  var columnIndex = this.getHeaders().indexOf(property);
  Logger.log(columnIndex);
  if (columnIndex == -1) 
    throw 'Column (' + property + ') is not present for this type (' + this.type + ').';

  // The first row is the row AFTER the header row and its offset.
  var rowIndex = this.getHeadersRange().getRow() - (this.options.headerOffset || 0) + 1;
  var dataTable = this.sheet.getRange(rowIndex, columnIndex + 1,
                                      this.count(), 1).getValues();
  var columnValues = [];
  for (var row = 0; row < dataTable.length; row++) {
    columnValues.push(dataTable[row][0]);
  }

  return columnValues;
}
/**
 * Gets a 2D array of all the object values of this table.
 * 
 * This follows the convention of [Range].getValues(), so this array is indexed
 * first by row, then by column.
 * 
 * @returns {array} A 2D array representing the table of objects.
 */
Ob2SSTable_.prototype.getData = function() {
  return this.getDataRange().getValues();
}
/**
 * Gets the range for all the objects in this table.
 * 
 * @returns {Range} A Google Apps Script Range object where the objects are stored.
 */
Ob2SSTable_.prototype.getDataRange = function() {
  var firstDataRow = this.getHeadersRange().getRow() - (this.options.headerOffset || 0) + 1;
  return this.sheet.getRange(firstDataRow, 1, this.count(), this.sheet.getMaxColumns());
}
/**
 * Gets the next ID for the table.
 * 
 * Currently it's based on the current count of objects, guaranteeing
 * uniqueness at the expense of re-using IDs.
 * 
 * @returns {number} The next Id value to use.
 */
Ob2SSTable_.prototype.getNextId = function() {
  var idColumn = this.getColumnAsArray('id');
  Logger.log(idColumn);
  var maxid = 1;
  for (var i = 0; i < idColumn.length; i++) {
    if (idColumn[i] >= maxid)
      maxid = idColumn[i] + 1;
  }
  Logger.log(maxid);
  return maxid;
}
/**
 * Gets the range for a specific object in the table.
 * 
 * @param {number} id The ID of the object to get the row for.
 * @returns {Range} A Google Apps Script Range object where the object is stored.
 */
Ob2SSTable_.prototype.getObjectRange = function(id) {
  // Get the transposed id column, then add back in header rows.
  var position = this.getColumnAsArray('id').indexOf(id);
  if (position == -1) return null;

  position += this.getHeadersRange().getRow() + 1 - this.options.headerOffset;

  return this.sheet.getRange(position, 1, 1, this.sheet.getMaxColumns());
}


//  //  //  //  //
// DELETE
//  //  //  //  //
/**
 * Removes an object from the database based on its id.
 * 
 * The object must have an ID in order to find it in the sheet.
 * Returns false if the object is not found.
 * 
 * @param {object} obj The object to remove.
 * @returns {bool} True if object was present and successfully removed.
 */
Ob2SSTable_.prototype.remove = function(obj) {
  if (!obj.id) throw 'Cannot remove an object without an id field.';

  var range = this.getObjectRange(obj.id);
  if (!range) return false;

  this.sheet.deleteRow(range.getRow());
  return true;
}
/**
 * WARNING: Deletes all the objects in a table.  Good for some cases.
 */
Ob2SSTable_.prototype.clear = function() {
  var ids = getColumnAsArray('id');
  for (var i = 0; i < ids.length; i++){
    this.remove(ids[i]);
  }
}
/**
 * WARNING: Deletes the *entire table sheet* in the spreadsheet.
 */
Ob2SSTable_.prototype.destroy = function() {
  this.spreadsheet.deleteSheet(this.sheet);
  this.spreadsheet = null;
  tables[this.type] = null;
  this.type = null;
}