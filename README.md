# Ob2SS: The Google Sheets Database
The content in this document is pretty focused on the technical details of the library.  Please visit the project page for implementation details, caveats, and examples.

http://artofthesmart.com/projects/ob2ss-the-google-sheets-database

## Functions

<dl>
<dt><a href="#initialize">initialize(options)</a> ⇒ <code>bool</code></dt>
<dd><p>Initialize Ob2SS with options.  Details at artofthesmart.com/projects/ob2ss</p>
<p>sheetKey: This is the key to a spreadsheet you want to use. Default is one is created for you.
headerOffset: What header offset to use.  Default 0.</p>
</dd>
<dt><a href="#getTable">getTable(type)</a> ⇒ <code><a href="#Ob2SSTable_">Ob2SSTable_</a></code></dt>
<dd><p>Returns a table from Ob2SS for read/write operations.</p>
<p>Each table is a sheet in the Spreadsheet set up during initialization.
If a table doesn&#39;t exist, one will be created for you.  If one exists,
this will hook it up so you can begin reading/writing.</p>
</dd>
<dt><a href="#Ob2SSTable_">Ob2SSTable_(options)</a></dt>
<dd><p>INTERNAL: Sets up a new table as part of Ob2SS.</p>
<p>This is a constructor function for an Ob2SS &quot;table&quot;.  It&#39;s a wrapper around a
sheet object in Google Spreadsheets that includes insert/read/write/delete
functionality.</p>
</dd>
</dl>

<a name="initialize"></a>

## initialize(options) ⇒ <code>bool</code>
Initialize Ob2SS with options.  Details at artofthesmart.com/projects/ob2ss

sheetKey: This is the key to a spreadsheet you want to use. Default is one is created for you.
headerOffset: What header offset to use.  Default 0.

**Kind**: global function  
**Returns**: <code>bool</code> - Whether initialization was successful.  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | An options object to control library use. |

<a name="getTable"></a>

## getTable(type) ⇒ [<code>Ob2SSTable_</code>](#Ob2SSTable_)
Returns a table from Ob2SS for read/write operations.

Each table is a sheet in the Spreadsheet set up during initialization.
If a table doesn't exist, one will be created for you.  If one exists,
this will hook it up so you can begin reading/writing.

**Kind**: global function  
**Returns**: [<code>Ob2SSTable_</code>](#Ob2SSTable_) - A table you can perform operations on.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | The type of data you want to read/write (think table or class). |

<a name="Ob2SSTable_"></a>

## Ob2SSTable_(options)
INTERNAL: Sets up a new table as part of Ob2SS.

This is a constructor function for an Ob2SS "table".  It's a wrapper around a
sheet object in Google Spreadsheets that includes insert/read/write/delete
functionality.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | An options object to control library use. |


* [Ob2SSTable_(options)](#Ob2SSTable_)
    * [.add(obj)](#Ob2SSTable_+add) ⇒ <code>boolean</code>
    * [.flattenObject()](#Ob2SSTable_+flattenObject)
    * [.unflattenObject()](#Ob2SSTable_+unflattenObject)
    * [.sanitize(value)](#Ob2SSTable_+sanitize) ⇒ <code>string</code>
    * [.extendHeaders(flatObjProps)](#Ob2SSTable_+extendHeaders)
    * [.insertObject(flatObj)](#Ob2SSTable_+insertObject)
    * [.toArray()](#Ob2SSTable_+toArray) ⇒ <code>array</code>
    * [.count()](#Ob2SSTable_+count) ⇒ <code>number</code>
    * [.getObject()](#Ob2SSTable_+getObject) ⇒ <code>object</code>
    * [.rowToObject(row)](#Ob2SSTable_+rowToObject) ⇒ <code>object</code>
    * [.getHeaders()](#Ob2SSTable_+getHeaders) ⇒ <code>array</code>
    * [.getHeadersRange()](#Ob2SSTable_+getHeadersRange) ⇒ <code>Range</code>
    * [.getColumnAsArray()](#Ob2SSTable_+getColumnAsArray) ⇒ <code>array</code>
    * [.getData()](#Ob2SSTable_+getData) ⇒ <code>array</code>
    * [.getDataRange()](#Ob2SSTable_+getDataRange) ⇒ <code>Range</code>
    * [.getNextId()](#Ob2SSTable_+getNextId) ⇒ <code>number</code>
    * [.getObjectRange(id)](#Ob2SSTable_+getObjectRange) ⇒ <code>Range</code>
    * [.remove(obj)](#Ob2SSTable_+remove) ⇒ <code>bool</code>
    * [.clear()](#Ob2SSTable_+clear)
    * [.destroy()](#Ob2SSTable_+destroy)

<a name="Ob2SSTable_+add"></a>

### ob2SSTable_.add(obj) ⇒ <code>boolean</code>
Writes an object into the table.

Every object *MUST* have an 'id' parameter. If you don't set one, one
will be automatically assigned and added to your objects. Automatic IDs
are unique, but deleted object ids are re-used.  Insertion checks
for repeat IDs and throws an error if an ID is repeated.

**Kind**: instance method of [<code>Ob2SSTable_</code>](#Ob2SSTable_)  
**Returns**: <code>boolean</code> - True if written, false if it couldn't be written.  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>object</code> | The object to write. |

<a name="Ob2SSTable_+flattenObject"></a>

### ob2SSTable_.flattenObject()
Flattens an object for writing.

**Kind**: instance method of [<code>Ob2SSTable_</code>](#Ob2SSTable_)  
<a name="Ob2SSTable_+unflattenObject"></a>

### ob2SSTable_.unflattenObject()
Unflattens an object for reading.

**Kind**: instance method of [<code>Ob2SSTable_</code>](#Ob2SSTable_)  
<a name="Ob2SSTable_+sanitize"></a>

### ob2SSTable_.sanitize(value) ⇒ <code>string</code>
Sanitizes a string for writing into a spreadsheet.

**Kind**: instance method of [<code>Ob2SSTable_</code>](#Ob2SSTable_)  
**Returns**: <code>string</code> - A string that is safe to write to spreadsheets.  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>string</code> | The value to sanitize. |

<a name="Ob2SSTable_+extendHeaders"></a>

### ob2SSTable_.extendHeaders(flatObjProps)
When an object is inserted into a table, its headers are checked against the
headers already in place.  If they're different, the table's headers are 
extended to accommodate the new object of the same type.

**Kind**: instance method of [<code>Ob2SSTable_</code>](#Ob2SSTable_)  

| Param | Type | Description |
| --- | --- | --- |
| flatObjProps | <code>array</code> | The property names of the object to be inserted. |

<a name="Ob2SSTable_+insertObject"></a>

### ob2SSTable_.insertObject(flatObj)
Inserts an object into the Google sheet.

**Kind**: instance method of [<code>Ob2SSTable_</code>](#Ob2SSTable_)  

| Param | Type | Description |
| --- | --- | --- |
| flatObj | <code>object</code> | The flattened object to be inserted into the prepared sheet. |

<a name="Ob2SSTable_+toArray"></a>

### ob2SSTable_.toArray() ⇒ <code>array</code>
Reads all objects fromt he table into an array.

**Kind**: instance method of [<code>Ob2SSTable_</code>](#Ob2SSTable_)  
**Returns**: <code>array</code> - An array of all objects in the database.  
<a name="Ob2SSTable_+count"></a>

### ob2SSTable_.count() ⇒ <code>number</code>
Returns the number of items in the table.

**Kind**: instance method of [<code>Ob2SSTable_</code>](#Ob2SSTable_)  
**Returns**: <code>number</code> - The number of items in the table.  
<a name="Ob2SSTable_+getObject"></a>

### ob2SSTable_.getObject() ⇒ <code>object</code>
Gets an object by its ID.

Note that while Ob2SS prevents you from writing an object with
a duplicate ID value, nothing will prevent one of your users from 
writing duplicate values by hand.  This returns the FIRST object
with the ID you're looking for.

**Kind**: instance method of [<code>Ob2SSTable_</code>](#Ob2SSTable_)  
**Returns**: <code>object</code> - The FIRST object with this id value.  
<a name="Ob2SSTable_+rowToObject"></a>

### ob2SSTable_.rowToObject(row) ⇒ <code>object</code>
Converts a row of data into an object.

**Kind**: instance method of [<code>Ob2SSTable_</code>](#Ob2SSTable_)  
**Returns**: <code>object</code> - A flattened object with contents equal to the passed array.  

| Param | Type | Description |
| --- | --- | --- |
| row | <code>array</code> | A row of field contents from the sheet that match the sheets headers. |

<a name="Ob2SSTable_+getHeaders"></a>

### ob2SSTable_.getHeaders() ⇒ <code>array</code>
Gets the headers for this table.

**Kind**: instance method of [<code>Ob2SSTable_</code>](#Ob2SSTable_)  
**Returns**: <code>array</code> - An array of strings that are the headers of this table.  
<a name="Ob2SSTable_+getHeadersRange"></a>

### ob2SSTable_.getHeadersRange() ⇒ <code>Range</code>
Gets the range for the headers for this table.

This function is important. We need to know which row is the header row
in order to insert and get objects, but it's variable. Some folks will never look at it
and use the built-in java-script-y titles, while other users will want to write their own
custom "pretty" headers.

If **headerOffset** is set, the header row will offset by that amount (usually -1).

**Kind**: instance method of [<code>Ob2SSTable_</code>](#Ob2SSTable_)  
**Returns**: <code>Range</code> - A Google Apps Script Range object where the headers are stored.  
<a name="Ob2SSTable_+getColumnAsArray"></a>

### ob2SSTable_.getColumnAsArray() ⇒ <code>array</code>
Gets a column of the table as an array.

Note that this is transposed such that it returns a horizontal array
representing the vertical values of a column.

**Kind**: instance method of [<code>Ob2SSTable_</code>](#Ob2SSTable_)  
**Returns**: <code>array</code> - An array of values stored in this column.  
<a name="Ob2SSTable_+getData"></a>

### ob2SSTable_.getData() ⇒ <code>array</code>
Gets a 2D array of all the object values of this table.

This follows the convention of [Range].getValues(), so this array is indexed
first by row, then by column.

**Kind**: instance method of [<code>Ob2SSTable_</code>](#Ob2SSTable_)  
**Returns**: <code>array</code> - A 2D array representing the table of objects.  
<a name="Ob2SSTable_+getDataRange"></a>

### ob2SSTable_.getDataRange() ⇒ <code>Range</code>
Gets the range for all the objects in this table.

**Kind**: instance method of [<code>Ob2SSTable_</code>](#Ob2SSTable_)  
**Returns**: <code>Range</code> - A Google Apps Script Range object where the objects are stored.  
<a name="Ob2SSTable_+getNextId"></a>

### ob2SSTable_.getNextId() ⇒ <code>number</code>
Gets the next ID for the table.

Currently it's based on the current count of objects, guaranteeing
uniqueness at the expense of re-using IDs.

**Kind**: instance method of [<code>Ob2SSTable_</code>](#Ob2SSTable_)  
**Returns**: <code>number</code> - The next Id value to use.  
<a name="Ob2SSTable_+getObjectRange"></a>

### ob2SSTable_.getObjectRange(id) ⇒ <code>Range</code>
Gets the range for a specific object in the table.

**Kind**: instance method of [<code>Ob2SSTable_</code>](#Ob2SSTable_)  
**Returns**: <code>Range</code> - A Google Apps Script Range object where the object is stored.  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> | The ID of the object to get the row for. |

<a name="Ob2SSTable_+remove"></a>

### ob2SSTable_.remove(obj) ⇒ <code>bool</code>
Removes an object from the database based on its id.

The object must have an ID in order to find it in the sheet.
Returns false if the object is not found.

**Kind**: instance method of [<code>Ob2SSTable_</code>](#Ob2SSTable_)  
**Returns**: <code>bool</code> - True if object was present and successfully removed.  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>object</code> | The object to remove. |

<a name="Ob2SSTable_+clear"></a>

### ob2SSTable_.clear()
WARNING: Deletes all the objects in a table.  Good for some cases.

**Kind**: instance method of [<code>Ob2SSTable_</code>](#Ob2SSTable_)  
<a name="Ob2SSTable_+destroy"></a>

### ob2SSTable_.destroy()
WARNING: Deletes the *entire table sheet* in the spreadsheet.

**Kind**: instance method of [<code>Ob2SSTable_</code>](#Ob2SSTable_)  
