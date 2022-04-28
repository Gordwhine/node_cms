const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create an instance of the schema
const CategorySchema = new Schema({
	name: {
		type: String,
		require: true
	},
});

module.exports = mongoose.model('categories', CategorySchema);