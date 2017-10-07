# Ob2SS: The Google Sheets Database
"Ob2SS (**Ob**ject **To** **S**pread**S**heet) is an Apps Script library that lets you use a Google Spreadsheet as a database for your small projects. There's no setup required, works on any JavaScript object, and lets you create hybrid spreadsheet applications more easily."

The content in this document is pretty focused on the technical details of the library.  Please visit the project page for implementation details, caveats, and examples.

http://artofthesmart.com/projects/ob2ss-the-google-sheets-database

## Members

<dl>
<dt><a href="#TableWrapper">TableWrapper</a></dt>
<dd><h2 id="table-functions">TABLE FUNCTIONS</h2>
<hr>
<p>Functions that interpret or manipulate a Google Sheet.</p>
<p>These functions are time-intensive and can be costly to test.</p>
</dd>
<dt><a href="#DataManager">DataManager</a></dt>
<dd><h2 id="data-manager">DATA MANAGER</h2>
<hr>
<p>Functions that manipulate objects or perform important checks.</p>
<p>These are functions that support the interpretation of data from and to the tables.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#initialize">initialize(options)</a> ⇒ <code>bool</code></dt>
<dd><p>Initialize Ob2SS with options.</p>
<p>This initialization takes an <code>options</code> object. Options include:</p>
<ul>
<li><code>sheetKey</code>: [string] This is the key to a spreadsheet you want to use.</li>
<li><code>headerOffset</code>: [int] What header offset to use.  Default is <code>0</code>.</li>
</ul>
<p>Examples:</p>
<ul>
<li><code>Ob2SS.initialize()</code> Creates a companion spreadsheet for this script. Uses it every time.</li>
<li><code>Ob2SS.initialize({ sheetKey: &#39;YOUR_SHEET_KEY&#39; })</code> Reads/writes data on that spreadsheet.</li>
</ul>
<p>You get the idea.</p>
</dd>
<dt><a href="#getTable">getTable(type)</a> ⇒ <code><a href="#Ob2SSTable">Ob2SSTable</a></code></dt>
<dd><p>Returns a table from Ob2SS for read/write operations.</p>
<p>Each table is a sheet in the Spreadsheet provided or set up during initialization.</p>
<ul>
<li>If a table doesn&#39;t exist, one will be created for you.</li>
<li>If a table does exist, Ob2SS will connect to it for reading/writing.</li>
</ul>
</dd>
<dt><a href="#Ob2SSTable">Ob2SSTable(options)</a></dt>
<dd><p>Constructs a new table as part of Ob2SS.</p>
<p>This is a constructor function for an Ob2SS &quot;table&quot;.  It&#39;s a wrapper around a
sheet in Google Spreadsheets that includes create/read/update/delete
functionality.</p>
</dd>
</dl>

<a name="initialize"></a>

## initialize(options) ⇒ <code>bool</code>
Initialize Ob2SS with options.

This initialization takes an `options` object. Options include:
- `sheetKey`: [string] This is the key to a spreadsheet you want to use.
- `headerOffset`: [int] What header offset to use.  Default is `0`.

Examples:
- `Ob2SS.initialize()` Creates a companion spreadsheet for this script. Uses it every time.
- `Ob2SS.initialize({ sheetKey: 'YOUR_SHEET_KEY' })` Reads/writes data on that spreadsheet.

You get the idea.

**Kind**: global function  
**Returns**: <code>bool</code> - Whether initialization was successful.  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | An options object to control library use. |

<a name="getTable"></a>

## getTable(type) ⇒ [<code>Ob2SSTable</code>](#Ob2SSTable)
Returns a table from Ob2SS for read/write operations.

Each table is a sheet in the Spreadsheet provided or set up during initialization.
- If a table doesn't exist, one will be created for you.
- If a table does exist, Ob2SS will connect to it for reading/writing.

**Kind**: global function  
**Returns**: [<code>Ob2SSTable</code>](#Ob2SSTable) - A table you can perform operations on.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | The type of data you want to read/write (think table or class). |

<a name="Ob2SSTable"></a>

## Ob2SSTable(options)
Constructs a new table as part of Ob2SS.

This is a constructor function for an Ob2SS "table".  It's a wrapper around a
sheet in Google Spreadsheets that includes create/read/update/delete
functionality.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | An options object to control library use. |


* [Ob2SSTable(options)](#Ob2SSTable)
    * [.toArray()](#Ob2SSTable+toArray) ⇒ <code>array</code>
    * [.getColumnAsArray(columnName)](#Ob2SSTable+getColumnAsArray) ⇒ <code>array</code>
    * [.count()](#Ob2SSTable+count) ⇒ <code>number</code>

<a name="Ob2SSTable+toArray"></a>

### ob2SSTable.toArray() ⇒ <code>array</code>
Reads all objects from the table into an array.

**Kind**: instance method of [<code>Ob2SSTable</code>](#Ob2SSTable)  
**Returns**: <code>array</code> - An array of all objects in the database.  
<a name="Ob2SSTable+getColumnAsArray"></a>

### ob2SSTable.getColumnAsArray(columnName) ⇒ <code>array</code>
Gets a column of the table as an array.

Note that this is transposed such that it returns a horizontal array
representing the vertical values of a column.

**Kind**: instance method of [<code>Ob2SSTable</code>](#Ob2SSTable)  
**Returns**: <code>array</code> - An array of values stored in this column.  

| Param | Type | Description |
| --- | --- | --- |
| columnName | <code>string</code> | The name of the column to fetch. |

<a name="Ob2SSTable+count"></a>

### ob2SSTable.count() ⇒ <code>number</code>
Returns the number of items in the table.

**Kind**: instance method of [<code>Ob2SSTable</code>](#Ob2SSTable)  
**Returns**: <code>number</code> - The number of items in the table.

<a name="TableWrapper"></a>

## TableWrapper
## TABLE FUNCTIONS
----------------------------------
Functions that interpret or manipulate a Google Sheet.

These functions are time-intensive and can be costly to test.

**Kind**: global variable  

* [TableWrapper](#TableWrapper)
    * [.getDataRange(sheet)](#TableWrapper.getDataRange) ⇒ <code>range</code>
    * [.getHeaderRange(sheet, options)](#TableWrapper.getHeaderRange) ⇒ <code>range</code>
    * [.getColumnRange(sheet, columnNumber)](#TableWrapper.getColumnRange) ⇒ <code>range</code>
    * [.getHeadersAsArray(range)](#TableWrapper.getHeadersAsArray) ⇒ <code>array</code>
    * [.getColumnAsArray(sheet, headerRange)](#TableWrapper.getColumnAsArray) ⇒ <code>array</code>
    * [.getDataAsArray(sheet)](#TableWrapper.getDataAsArray) ⇒ <code>array</code>
    * [.getDefaultSheetKey()](#TableWrapper.getDefaultSheetKey) ⇒ <code>range</code>

<a name="TableWrapper.getDataRange"></a>

### TableWrapper.getDataRange(sheet) ⇒ <code>range</code>
Gets the data range of the sheet.

Basically this is the cell range that ISN'T headers.

**Kind**: static method of [<code>TableWrapper</code>](#TableWrapper)  
**Returns**: <code>range</code> - A range that represents all the data after the header zone.  

| Param | Type | Description |
| --- | --- | --- |
| sheet | <code>sheet</code> | The sheet to fetch from. |

<a name="TableWrapper.getHeaderRange"></a>

### TableWrapper.getHeaderRange(sheet, options) ⇒ <code>range</code>
Gets the header range.

This is everything either
 + within the frozen rows section, or
 + above the headerOffset area.

**Kind**: static method of [<code>TableWrapper</code>](#TableWrapper)  
**Returns**: <code>range</code> - The range of the header area.  

| Param | Type | Description |
| --- | --- | --- |
| sheet | <code>sheet</code> | The sheet to fetch from. |
| options | <code>object</code> | The options object used by Ob2ss. |

<a name="TableWrapper.getColumnRange"></a>

### TableWrapper.getColumnRange(sheet, columnNumber) ⇒ <code>range</code>
Gets the range of a column.

**Kind**: static method of [<code>TableWrapper</code>](#TableWrapper)  
**Returns**: <code>range</code> - The range of the target column.  

| Param | Type | Description |
| --- | --- | --- |
| sheet | <code>sheet</code> | The sheet to fetch from. |
| columnNumber | <code>number</code> | The 1-based index of the column to fetch. |

<a name="TableWrapper.getHeadersAsArray"></a>

### TableWrapper.getHeadersAsArray(range) ⇒ <code>array</code>
Gets the header range as an array of data.

**Kind**: static method of [<code>TableWrapper</code>](#TableWrapper)  
**Returns**: <code>array</code> - The 1-dimensional array of headers.  

| Param | Type | Description |
| --- | --- | --- |
| range | <code>range</code> | The range to get headers from. |

<a name="TableWrapper.getColumnAsArray"></a>

### TableWrapper.getColumnAsArray(sheet, headerRange) ⇒ <code>array</code>
Gets the column as an array.

**Kind**: static method of [<code>TableWrapper</code>](#TableWrapper)  
**Returns**: <code>array</code> - The column as a 1-dimensional array.  

| Param | Type | Description |
| --- | --- | --- |
| sheet | <code>sheet</code> | The sheet to fetch from. |
| headerRange | <code>range</code> | The range of the headers of this sheet. |

<a name="TableWrapper.getDataAsArray"></a>

### TableWrapper.getDataAsArray(sheet) ⇒ <code>array</code>
Gets the DATA from the sheet.

**Kind**: static method of [<code>TableWrapper</code>](#TableWrapper)  
**Returns**: <code>array</code> - The 2-dimensional array of values.  

| Param | Type | Description |
| --- | --- | --- |
| sheet | <code>sheet</code> | The sheet to fetch from. |

<a name="TableWrapper.getDefaultSheetKey"></a>

### TableWrapper.getDefaultSheetKey() ⇒ <code>range</code>
Gets the default sheet key.

Right now this is only useful for testing, but in the long-run it can be used
to get zero-config tables for prototyping.

**Kind**: static method of [<code>TableWrapper</code>](#TableWrapper)  
**Returns**: <code>range</code> - The range of the target column.  
<a name="DataManager"></a>

## DataManager
## DATA MANAGER
----------------------------------
Functions that manipulate objects or perform important checks.

These are functions that support the interpretation of data from and to the tables.

**Kind**: global variable  

* [DataManager](#DataManager)
    * [.objectToRow(flatObj, headers)](#DataManager.objectToRow) ⇒ <code>array</code>
    * [.isNoWrite(value, header)](#DataManager.isNoWrite) ⇒ <code>boolean</code>
    * [.isNoRead(header)](#DataManager.isNoRead) ⇒ <code>boolean</code>
    * [.objectsToRows(flatObjs, headers)](#DataManager.objectsToRows) ⇒ <code>array</code>
    * [.rowToObject(row, headers)](#DataManager.rowToObject) ⇒ <code>object</code>
    * [.rowsToObjects(rows, headers)](#DataManager.rowsToObjects) ⇒ <code>array</code>
    * [.flattenObject(obj)](#DataManager.flattenObject) ⇒ <code>object</code>
    * [.unflattenObject(flatObj)](#DataManager.unflattenObject) ⇒ <code>object</code>
    * [.trimObject(obj)](#DataManager.trimObject) ⇒ <code>object</code>
    * [.sanitize(value)](#DataManager.sanitize) ⇒ <code>string</code>
    * [.isEmpty(obj)](#DataManager.isEmpty) ⇒ <code>boolean</code>
    * [.removeDupes(arr)](#DataManager.removeDupes) ⇒ <code>array</code>

<a name="DataManager.objectToRow"></a>

### DataManager.objectToRow(flatObj, headers) ⇒ <code>array</code>
Converts a *flat* object into a row.

**Kind**: static method of [<code>DataManager</code>](#DataManager)  
**Returns**: <code>array</code> - The 1-dimensional, ordered array of object properties.  

| Param | Type | Description |
| --- | --- | --- |
| flatObj | <code>object</code> | A flattened object to convert. |
| headers | <code>array</code> | The array of headers to key against. |

<a name="DataManager.isNoWrite"></a>

### DataManager.isNoWrite(value, header) ⇒ <code>boolean</code>
Determines if a value or field type should not be written.

**Kind**: static method of [<code>DataManager</code>](#DataManager)  
**Returns**: <code>boolean</code> - Whether the situation is a no-write.  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>primitive</code> | The number or string to be written. |
| header | <code>string</code> | The header name. |

<a name="DataManager.isNoRead"></a>

### DataManager.isNoRead(header) ⇒ <code>boolean</code>
Determines if a value or field type should not be read.

**Kind**: static method of [<code>DataManager</code>](#DataManager)  
**Returns**: <code>boolean</code> - Whether the situation is a no-read.  

| Param | Type | Description |
| --- | --- | --- |
| header | <code>string</code> | The header name. |

<a name="DataManager.objectsToRows"></a>

### DataManager.objectsToRows(flatObjs, headers) ⇒ <code>array</code>
Converts an array of *flat* objects into an array of row arrays.

**Kind**: static method of [<code>DataManager</code>](#DataManager)  
**Returns**: <code>array</code> - An array of arrays of ordered of object properties.  

| Param | Type | Description |
| --- | --- | --- |
| flatObjs | <code>array</code> | An array of flattened objects to convert. |
| headers | <code>array</code> | The array of headers to key against. |

<a name="DataManager.rowToObject"></a>

### DataManager.rowToObject(row, headers) ⇒ <code>object</code>
Converts a row into an object.

**Kind**: static method of [<code>DataManager</code>](#DataManager)  
**Returns**: <code>object</code> - The *unflattened* object.  

| Param | Type | Description |
| --- | --- | --- |
| row | <code>array</code> | The row array to convert. |
| headers | <code>array</code> | The array of headers to key against. |

<a name="DataManager.rowsToObjects"></a>

### DataManager.rowsToObjects(rows, headers) ⇒ <code>array</code>
Multiple property arrays into an array of *unflattened* objects.

**Kind**: static method of [<code>DataManager</code>](#DataManager)  
**Returns**: <code>array</code> - An array of unflattened objects.  

| Param | Type | Description |
| --- | --- | --- |
| rows | <code>array</code> | The array of property arrays to convert. |
| headers | <code>array</code> | The array of headers to key against. |

<a name="DataManager.flattenObject"></a>

### DataManager.flattenObject(obj) ⇒ <code>object</code>
Unfolds arrays and objects into a flattened object.

Objects often have nested values like arrays and objects. This process
"unfolds" those objects into flattened versions that can be written to a
row of data in a spreadsheet.  See tests for examples.

**Kind**: static method of [<code>DataManager</code>](#DataManager)  
**Returns**: <code>object</code> - The flattened object.  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>object</code> | The object to flatten. |

<a name="DataManager.unflattenObject"></a>

### DataManager.unflattenObject(flatObj) ⇒ <code>object</code>
Reverses the flattening process.

This process un-nests the data in a row into a "reconstituted" object.

**Kind**: static method of [<code>DataManager</code>](#DataManager)  
**Returns**: <code>object</code> - The unflattened object.  

| Param | Type | Description |
| --- | --- | --- |
| flatObj | <code>object</code> | The object to unflatten. |

<a name="DataManager.trimObject"></a>

### DataManager.trimObject(obj) ⇒ <code>object</code>
Recurses through an object's properties and trims away undefined 
or null values.

**Kind**: static method of [<code>DataManager</code>](#DataManager)  
**Returns**: <code>object</code> - The trimmed object.  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>object</code> | The object to trim. |

<a name="DataManager.sanitize"></a>

### DataManager.sanitize(value) ⇒ <code>string</code>
Sanitizes strings to be written to spreadsheets.

TODO: This is currently unused, but works.

**Kind**: static method of [<code>DataManager</code>](#DataManager)  
**Returns**: <code>string</code> - The sanitized version of the input.  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>string</code> | The string or value to sanitize |

<a name="DataManager.isEmpty"></a>

### DataManager.isEmpty(obj) ⇒ <code>boolean</code>
Determines if an object is empty.

**Kind**: static method of [<code>DataManager</code>](#DataManager)  
**Returns**: <code>boolean</code> - Whether the object is indeed empty.  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>object</code> | The object to evaluate. |

<a name="DataManager.removeDupes"></a>

### DataManager.removeDupes(arr) ⇒ <code>array</code>
Removes duplicates from an array.

TODO: This is unused, but will be an important part of extending
headers when adding new objects to an Ob2SS table.

**Kind**: static method of [<code>DataManager</code>](#DataManager)  
**Returns**: <code>array</code> - The deduplicated array.  

| Param | Type | Description |
| --- | --- | --- |
| arr | <code>array</code> | The array to deduplicate. |
