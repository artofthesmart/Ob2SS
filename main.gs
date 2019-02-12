/**
 * 
 * ## LIBRARY GLOBALS AND CONSTRUCTORS
 * ----------------------------------
 * These elements are going to be the "headline items" a user can access
 * from their script.  They're meant to be visible via intellisense.
 * 
 * Visit ob2ss.com for details.
 */

'use strict';

/**
 * Initialize Ob2SS with options.
 * 
 * This initialization takes an `options` object. Options include:
 * - `sheetKey`: [string] This is the key to a spreadsheet you want to use.
 * - `headerOffset`: [int] What header offset to use.  Default is `0`.
 * 
 * Examples:
 * - `Ob2SS.initialize()` Creates a companion spreadsheet for this script. Uses it every time.
 * - `Ob2SS.initialize({ sheetKey: 'YOUR_SHEET_KEY' })` Reads/writes data on that spreadsheet.
 * 
 * You get the idea.
 *
 * @param {object} options An options object to control library use.
 * @returns {bool} Whether initialization was successful.
 */
function initialize(options) {
  if (!options) { options = {}; }
  
  // Set defaults.
  options.headerOffset = options.headerOffset || 0;
  options.sheetKey = options.sheetKey || TableWrapper.getDefaultSheetKey();
  this.options = options;
  this.editTriggers = [];
  
  this.sheetKey = this.options.sheetKey;
  this.tables = {};

  // Try to load the target spreadsheet.
  try {
    this.spreadsheet = SpreadsheetApp.openById(this.sheetKey);
  } catch (e) {
    throw 'Could not open the specified spreadsheet: ' + this.sheetKey; 
  }
  
  this.initialized = true;
}

/**
 * Returns a table from Ob2SS for read/write operations.
 * 
 * Each table is a sheet in the Spreadsheet provided or set up during initialization.
 * - If a table doesn't exist, one will be created for you.
 * - If a table does exist, Ob2SS will connect to it for reading/writing.
 *
 * @param {string} type The type of data you want to read/write (think table or class).
 * @returns {Ob2SSTable} A table you can perform operations on.
 */
function getTable(type) {
  if (!this.initialized) initialize({}); //throw 'Cannot access a table if Ob2SS is not yet initialized.';
  if (!this.spreadsheet) throw 'Spreadsheet not found: ' + this.spreadsheet;
  
  if (!tables[type]) {
    tables[type] = new Ob2SSTable({
      spreadsheet: this.spreadsheet,
      sheet: this.spreadsheet.getSheetByName(type), // OK if null, corrected in constructor.
      type: type,
      headerOffset: this.options.headerOffset
    });
  }

  return tables[type];
}

/**
 * An array of functions to execute as callbacks onEdit.
 * 
 * Sometimes you want values to be updated in a row when other row values are edited.
 * This function lets you add a callback function to run in that case.  The function will be passed
 * an `Ob2SSEvent` parameter with lots of useful, object-ified data to make updates easier.
 * 
 * *REMEMBER* You _must_ call `runOnEditTriggers` in your `onEdit()` function for this to work.
 */
var editTriggers = [];

/**
 * Call this from your onEdit function to trigger callbacks.
 * 
 * This cannot be automated.  You must call this from `onEdit(event){ ... }` in your script and pass
 * it the event object.
 *
 * @param {object} event The event object from `onEdit()`.
 */
function runOnEditTriggers(event) {
  // Build an Ob2SS event object with object details.
  var Ob2SSEvent = {
    event: event,   // The original event.
    objects: null,  // The affected objects.
    table: null
  };
  
  for (var i = 0; i < editTriggers.length; i++) {
    editTriggers[i](event);
  }
}

/**
 * Constructs a new table as part of Ob2SS.
 * 
 * This is a constructor function for an Ob2SS "table".  It's a wrapper around a
 * sheet in Google Spreadsheets that includes create/read/update/delete
 * functionality.
 *
 * @param {object} options An options object to control library use.
 */
var Ob2SSTable = function (options) {
  if (!options) throw 'Must include an options parameter to setup a table.';
  if (!options.spreadsheet) throw 'Must have a parent spreadsheet to setup a table.';
  if (!options.type) throw 'Must have a type to setup a table.';
  if (!options.sheet) {
    options.sheet = options.spreadsheet.insertSheet(options.type);
    options.sheet.deleteRows(2, options.sheet.getMaxRows() - 1);
    options.sheet.deleteColumns(2, options.sheet.getMaxColumns() - 1);

    var homeRange = options.sheet.getRange(1,1,1,1);
    homeRange.setNumberFormats([['@']]); // Disable auto-formatting for generated tables.
    homeRange.setValues([['id']]);
  }

  this.options = options;
  this.spreadsheet = options.spreadsheet;
  this.type = options.type;
  this.sheet = options.sheet;
}

//  --  --  --  --  --  --  --  --  --  --  --  --  --  --  --  --  --

//  //  //  //  //
// READ
//  //  //  //  //
/**
 * Reads all objects from the table into an array.
 * 
 * @returns {array} An array of all objects in the database.
 */
Ob2SSTable.prototype.toArray = function() {
  var range, data, headerRange, headers;
  data = TableWrapper.getDataAsArray(this.sheet);
  headerRange = TableWrapper.getHeaderRange(this.sheet, this.options);
  headers = TableWrapper.getHeadersAsArray(headerRange);

  return DataManager.rowsToObjects(data, headers);
}

/**
 * Gets the data from the sheet as an array safe for apps script serving.
 *
 * You cannot pass objects to/from web apps deployed through Google Apps Script.
 * Unfortunately, this includes dates, which are cast to YYYY-MM-DD HH:MM:SS in GMT.
 * 
 * @returns {array} An array of all objects in the database.
 */
Ob2SSTable.prototype.toSafeArray = function() {
  var range, data, headerRange, headers;
  data = TableWrapper.getDataAsArray(this.sheet);
  headerRange = TableWrapper.getHeaderRange(this.sheet, this.options);
  headers = TableWrapper.getHeadersAsArray(headerRange);
  
  // Scrub down the data to basic types.
  for (var r = 0; r < data.length; r++) {
    for (var c = 0; c < data[r].length; c++) {
      if (data[r][c] instanceof Date) {
        data[r][c] = Utilities.formatDate(data[r][c], "GMT", "yyyy-MM-dd HH:mm:ss");
      }
    }
  }

  return DataManager.rowsToObjects(data, headers);
}

/**
 * Gets a column of the table as an array.
 * 
 * Note that this is transposed such that it returns a horizontal array
 * representing the vertical values of a column.
 * 
 * @param {string} columnName The name of the column to fetch.
 * @returns {array} An array of values stored in this column.
 */
Ob2SSTable.prototype.getColumnAsArray = function(columnName) {
  var headerRange = TableWrapper.getHeaderRange(this.sheet, this.options);
  return TableWrapper.getColumnAsArray(this.sheet, headerRange, columnName);
}

/**
 * Returns the number of items in the table.
 * 
 * @returns {number} The number of items in the table.
 */
Ob2SSTable.prototype.count = function() {
  return this.toArray().length;
}

//  --  --  --  --  --  --  --  --  --  --  --  --  --  --  --  --  --

//  //  //  //  //
// WRITE
//  //  //  //  //
/**
 * Write an object or array of objects to the bottom of the table, wherever fields
 * for this object's properties already exist.
 *
 * This will add an object as the last object in the table. It _only_ writes
 * fields that appear in the table. If a field isn't present in the table, but _is_
 * present in the object, it won't get written.
 * 
 * @returns {array} An array of all objects in the database.
 */
Ob2SSTable.prototype.insert = function(objs) {
  // Convert single insertions to an array for easier processing.
  if (!Array.isArray(objs)) objs = [objs];

  var flatObjects = objs.map(function(obj) { return DataManager.flattenObject(obj); });
  var headerRange = TableWrapper.getHeaderRange(this.sheet, this.options);
  var headers = TableWrapper.getHeadersAsArray(headerRange);

  var rows = DataManager.objectsToRows(flatObjects, headers);
  TableWrapper.insertRows(this.sheet, rows);
}

/**
 * Write an object or array of objects to the bottom of the table, and if
 * fields don't exist for the object's properties, extend the table.
 *
 * This will add an object as the last object in the table. It writes _all_ of
 * the fields that appear in the object, even if that means extending the table's
 * schema.
 * 
 * @returns {array} An array of all objects in the database.
 */
Ob2SSTable.prototype.add = function(objs) {
  // Convert single insertions to an array for easier processing.
  if (!Array.isArray(objs)) objs = [objs];

  // Prep the objects for insertion.
  var flatObjects = objs.map(function(obj) { return DataManager.flattenObject(obj); });

  // Get the consolidated headers.
  var headerRange = TableWrapper.getHeaderRange(this.sheet, this.options);
  var headers = TableWrapper.getHeadersAsArray(headerRange);
  var allKeys = flatObjects.map(function(flatObj) { return Object.keys(flatObj); });
  
  allKeys.forEach(function(keys) {
    headers = DataManager.removeDupes(headers.concat(keys));
  });

  // Extend the headers.
  TableWrapper.extendHeaders(this.sheet, headerRange, headers);

  // Reduce to rows.
  var rows = DataManager.objectsToRows(flatObjects, headers);

  // Append the rows.
  TableWrapper.insertRows(this.sheet, rows);
}

//  --  --  --  --  --  --  --  --  --  --  --  --  --  --  --  --  --

//  //  //  //  //
// REMOVE / DELETE
//  //  //  //  //

// TODO: Make a way to remove objects from the table.
Ob2SSTable.prototype.remove = function(objs) {
  throw "Not Yet Implemented";
}

// TODO: Make a way to clear a table of all entries.
Ob2SSTable.prototype.clear = function() {
  throw "Not Yet Implemented";
}

/**
 * Drops an entire table from the spreadsheet.
 * 
 * **WARNING:** Does exactly what it sounds like. Destroys the table and all
 * references to it.  Useful for edge cases and testing.
 * 
 */
Ob2SSTable.prototype.destroy = function() {
  this.spreadsheet.deleteSheet(this.sheet);
  this.sheet = null;
  this.spreadsheet = null;
  tables[this.type] = null;
  this.type = null;
}
