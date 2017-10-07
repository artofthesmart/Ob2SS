// Extends & sets the headers in the range to handle the new header array.
// `targetProps` MUST BE THE SUPERSET OF EXISTING AND NEW HEADERS.
TableWrapper.extendHeaders = function(sheet, headerRange, targetProps) {
  if (targetProps.length < headerRange.getNumColumns()) throw 'Cannot shrink columns.';

  var numColsNeeded = targetProps.length - headerRange.getNumColumns();

  if (numColsNeeded > 0) {
    sheet.insertColumnsAfter(headerRange.getNumColumns(), numColsNeeded);
    headerRange = headerRange.offset(0, 0, 1, sheet.getMaxColumns());
  }
  
  headerRange.setValues([targetProps]); // 2d array
  SpreadsheetApp.flush();
}

TableWrapper.addRows = function(sheet, rows) {
  // Append each remaining row, and it'll inherit the prior row's formatting.
  rows.forEach(function(item) {
    sheet.appendRow(item);
    /*var lastRow = sheet.getRange(sheet.getMaxRows(), 1, 1, sheet.getMaxColumns());
    var aboveRow = lastRow.offset(-1, 0);
    lastRow.setNumberFormats(aboveRow.getNumberFormats());*/
  });
}

Ob2SSTable.prototype.remove = function(objs) {

}
Ob2SSTable.prototype.clear = function() {

}
Ob2SSTable.prototype.destroy = function() {
  this.spreadsheet.deleteSheet(this.sheet);
  this.sheet = null;
  this.spreadsheet = null;
  tables[this.type] = null;
  this.type = null;
}

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
  TableWrapper.addRows(this.sheet, rows);
}
Ob2SSTable.prototype.updateUnary = function(objs) {

}
