/**
 * 
 * ## LIBRARY GLOBALS AND CONSTRUCTORS
 * ----------------------------------
 * These elements are going to be the "headline items" a user can access
 * from their script.  They're meant to be visible via intellisense.
 * 
 * Visit artofthesmart.com for details.
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
  
  this.sheetKey = this.options.sheetKey;
  this.tables = {};

  // Try to load the target spreadsheet.
  try {
    this.spreadsheet = SpreadsheetApp.openById(this.sheetKey);
  } catch (e) {
    throw 'Could not open the specified spreadsheet: ' + this.sheetKey; 
  }

  return this.initialized = true;
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
  if (!this.initialized) throw 'Cannot access a table if Ob2SS is not yet initialized.';
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
