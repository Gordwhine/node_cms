const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create an instance of the schema
const CommentSchema = new Schema({

	user: {
		type: Schema.Types.ObjectId,
		ref: 'users'
	},

	body: {
		type: String,
		require: true
	},

	approveComment: {
		type: Boolean,
		default: false
	},

	date: {
		type: Date,
		default: Date.now()
	}
});

module.exports = mongoose.model('comments', CommentSchema);