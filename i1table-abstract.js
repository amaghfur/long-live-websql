/* globals 
	SQLUTILS
*/

function ITableAbstract(db, tableName, opts) {
	var self = this
	if (!opts) opts = {}

	// private properties
	var idCol
	var idCols
	if (opts.idCols)
		idCols = opts.idCols
	else
		idCol = opts.idCol ? opts.idCol : 'id'
	var arrayColumns = opts.arrayColumns ? opts.arrayColumns : []
	var objectColumns = opts.objectColumns ? opts.objectColumns : []
	var complexColumns = arrayColumns.concat(objectColumns)
	var booleanColumns = opts.booleanColumns ? opts.booleanColumns : []
	var currentColumns = opts.currentColumns ? opts.currentColumns : []

	// public methods
	self.getComplexColumnsNames = function(){
		return complexColumns
	}
	self.parseComplexColumns = function(rec){
		self.getComplexColumnsNames().forEach(function(c){
			if (rec[c] && typeof rec[c] === 'string')
				rec[c] = JSON.parse(rec[c])
		})
		return rec
	}
	self.getArrayColumnsNames = function(){
		return arrayColumns
	}
	self.getObjectColumnsNames = function(){
		return objectColumns
	}
	self.getBooleanColumnsNames = function(){
		return booleanColumns
	}
	self.getCurrentColumnsNames = function(){
		return currentColumns
	}
	self.getTableName = function(){
		return tableName
	}
	self.getDb = function(){
		return db
	}
	self.getIdCol = function(){
		return idCol
	}
	self.getIdCols = function(){
		return idCols
	}
}
ITableAbstract.prototype = {
	get: function(id) {
		var self = this,
			db = self.getDb()

		return SQLUTILS.get({
			db: db,
			table: self.getTableName(),
			where: self.getIdCol(),
			value: id
		}).then(function(res) {
			self.getComplexColumnsNames().forEach(function(col){
				if (res[col])
					res[col] = JSON.parse(res[col])
			})
			return res
		})	
	},
	insert: function(rec) {
		var self = this,
			db = self.getDb()

		var temp = {}
		self.getCurrentColumnsNames().forEach(function(col){
			if (rec.hasOwnProperty(col))
				temp[col] = rec[col]
		})
		rec = temp

		rec = _.extend({}, rec)

		self.getComplexColumnsNames().forEach(function(col){
			if (rec[col])
				rec[col] = JSON.stringify(rec[col])
		})
		self.getBooleanColumnsNames().forEach(function(col){
			if (rec.hasOwnProperty(col) && rec[col] !== null && typeof rec[col] !== 'undefined')
				rec[col] = rec[col] ? 1 : 0
		})

		return SQLUTILS.insert({
			record: rec,
			table: self.getTableName(),
			db: db
		})
	},
	update: function(rec) {
		var self = this,
			db = self.getDb()

		var temp = {}
		self.getCurrentColumnsNames().forEach(function(col){
			if (rec.hasOwnProperty(col))
				temp[col] = rec[col]
		})
		rec = temp

		rec = _.extend({}, rec)

		self.getComplexColumnsNames().forEach(function(col){
			if (rec[col])
				rec[col] = JSON.stringify(rec[col])
		})
		self.getBooleanColumnsNames().forEach(function(col){
			if (rec.hasOwnProperty(col) && rec[col] !== null && typeof rec[col] !== 'undefined')
				rec[col] = rec[col] ? 1 : 0
		})

		return SQLUTILS.update({
			record: rec,
			where: self.getIdCol(),
			table: self.getTableName(),
			db: db
		})
	},
	upsert: function(rec) {
		var self = this,
			db = self.getDb()

		var temp = {}
		self.getCurrentColumnsNames().forEach(function(col){
			if (rec.hasOwnProperty(col))
				temp[col] = rec[col]
		})
		rec = temp

		rec = _.extend({}, rec)

		self.getComplexColumnsNames().forEach(function(col){
			if (rec[col])
				rec[col] = JSON.stringify(rec[col])
		})
		self.getBooleanColumnsNames().forEach(function(col){
			if (rec.hasOwnProperty(col) && rec[col] !== null && typeof rec[col] !== 'undefined')
				rec[col] = rec[col] ? 1 : 0
		})

		return SQLUTILS.upsert({
			record: rec,
			where: self.getIdCol(),
			wheres: self.getIdCols(),
			table: self.getTableName(),
			db: db
		})
	},
	delete: function(id) {
		var self = this,
			db = self.getDb()

		return SQLUTILS.delete({
			where: self.getIdCol(),
			value: id,
			table: self.getTableName(),
			db: db
		})
	},
	bulkGet: function(ids){
		var self = this

		return SQLUTILS.bulkGet({
			db: self.getDb(),
			where: self.getIdCol(),
	        table: self.getTableName(),
	        inn: ids
		})
	}
}