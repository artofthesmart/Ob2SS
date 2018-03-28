/**
 * 
 * ## TABLE FUNCTIONS
 * ----------------------------------
 * Functions that interpret or manipulate a Google Sheet.
 * 
 * These functions are time-intensive and can be costly to test.
 * 
 */

var TableWrapper = {};

/**
 * Gets the data range of the sheet.
 * 
 * Basically this is the cell range that ISN'T headers.
 * 
 * @param {sheet} sheet The sheet to fetch from.
 * @returns {range} A range that represents all the data after the header zone.
 */
TableWrapper.getDataRange = function(sheet) {
  var firstRow = (sheet.getFrozenRows() || 1) + 1; // 1 based.
  var numRows = sheet.getMaxRows() - (firstRow - 1); // 0 based.
  var numCols = sheet.getMaxColumns();

  if (numRows == 0) return null;
  return sheet.getRange(firstRow, 1, numRows, numCols);
}

/**
 * Gets the header range.
 * 
 * This is everything either
 *  + within the frozen rows section, or
 *  + above the headerOffset area.
 * 
 * @param {sheet} sheet The sheet to fetch from.
 * @param {object} options The options object used by Ob2ss.
 * @returns {range} The range of the header area.
 */
TableWrapper.getHeaderRange = function(sheet, options) {
  var headerRow = sheet.getFrozenRows() || 1; // use 1st row by default.
  headerRow += options.headerOffset;

  return sheet.getRange(headerRow, 1, 1, sheet.getMaxColumns());
}

/**
 * Gets the range of a column.
 * 
 * @param {sheet} sheet The sheet to fetch from.
 * @param {number} columnNumber The 1-based index of the column to fetch.
 * @returns {range} The range of the target column.
 */
TableWrapper.getColumnRange = function(sheet, columnNumber) {
  var firstRow = (sheet.getFrozenRows() || 1) + 1; // 1 based.
  var numRows = sheet.getMaxRows() - (firstRow - 1); // 0 based.
  var numCols = sheet.getMaxColumns();

  if (numRows == 0) return null;
  return sheet.getRange(firstRow, columnNumber, numRows, numCols);
}

/**
 * Gets the header range as an array of data.
 * 
 * @param {range} range The range to get headers from.
 * @returns {array} The 1-dimensional array of headers.
 */
TableWrapper.getHeadersAsArray = function(range) {
  return range.getValues()[0];
}

/**
 * Gets the column as an array.
 * 
 * @param {sheet} sheet The sheet to fetch from.
 * @param {range} headerRange The range of the headers of this sheet.
 * @returns {array} The column as a 1-dimensional array.
 */
TableWrapper.getColumnAsArray = function(sheet, headerRange, columnName) {
  var returnValue = [];
  var headerArray = TableWrapper.getHeadersAsArray(headerRange);
  var columnNumber = headerArray.indexOf(columnName) + 1; // 1-based.

  if (columnNumber == 0) return null;

  var values = TableWrapper.getColumnRange(sheet, columnNumber).getValues();
  for (var row = 0; row < values.length; row++)
    returnValue.push(values[row][0]);

  return returnValue;
}

/**
 * Gets the data from the sheet.
 * 
 * @param {sheet} sheet The sheet to fetch from.
 * @returns {array} The 2-dimensional array of values.
 */
TableWrapper.getDataAsArray = function(sheet) {
  var range = TableWrapper.getDataRange(sheet);
  var values = range.getValues();
  return values;
}

/**
 * Gets the default sheet key.
 *
 * Right now this is only useful for testing, but in the long-run it can be used
 * to get zero-config tables for prototyping.  If this script is BOUND to a spread-
 * sheet that will be returned first.  Otherwise if a spreadsheet was created for
 * this script previously, that will be returned.  Otherwise a new sheet will be
 * created for this script.
 * 
 * @returns string The ID of the spreadsheet to attach to.
 */
TableWrapper.getDefaultSheetKey = function() {
  var defaultFileName = "Ob2SS data: " + ScriptApp.getScriptId();
  var existingFiles = DriveApp.getFilesByName(defaultFileName);
  var boundSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // Return the bound Spreadsheet if it's available.
  if (boundSpreadsheet != null) return boundSpreadsheet.getId();
  
  // Return an existing "default" sheet if possible.
  if (existingFiles.hasNext()) {
    return existingFiles.next().getId();
  }
  
  // Create a new "default" sheet and use that.
  return SpreadsheetApp.create(defaultFileName, 1, 1).getId();
}

/**
 * Extends the columns of a table to match a new set of headers.
 *
 * The headers in a sheet represent the fields of an object. This function will
 * ADD new headers to the sheet to match an array of target properties.  The fields
 * may not be in order of `targetProps`.
 * 
 * **WARNING** This overwrites all headers. If `targetProps` isn't the union of
 * existing headers with new, required headers, you're gonna have a bad time.
 * 
 * @param {sheet} sheet The spreadsheet sheet to operate on.
 * @param {range} headerRange The range of headers in the sheet to operate on.
 * @param {array} targetProps A 2-d array of properties to extend to.
 */
TableWrapper.extendHeaders = function(sheet, headerRange, targetProps) {
  if (targetProps.length < headerRange.getNumColumns()) 
    throw 'Cannot shrink columns.';

  var numColsNeeded = targetProps.length - headerRange.getNumColumns();

  if (numColsNeeded > 0) {
    sheet.insertColumnsAfter(headerRange.getNumColumns(), numColsNeeded);
    headerRange = headerRange.offset(0, 0, 1, sheet.getMaxColumns());
  }
  
  headerRange.setValues([targetProps]); // 2d array
  SpreadsheetApp.flush();
}

/**
 * Adds rows to a sheet.
 *
 * Adds rows to the bottom of a sheet in bulk w/ formatting.
 * 
 * @param {sheet} sheet The spreadsheet sheet to operate on.
 * @param {int} rows The number of rows to append.
 */
TableWrapper.insertRows = function(sheet, rows) {
  var lastRow = sheet.getLastRow();             // e.g. 5
  sheet.insertRowsAfter(lastRow, rows.length);  // e.g. Rows #6 thru 10.
  var blankRange = sheet.getRange(lastRow + 1, 1, rows.length, sheet.getMaxColumns());

  var cellFormats = blankRange.getNumberFormats();
  
  // Set Formatting: if a cell is a string, give it '@';
  for (var row = 0; row < rows.length; row++) {
    for (var cell = 0; cell < row.length; row++) {
      if (typeof row[cell] == 'string') {
        cellFormats[row][cell] = '@';
      }
    }
  }

  blankRange.setNumberFormats(cellFormats);
  blankRange.setValues(rows);
}
