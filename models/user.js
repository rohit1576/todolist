var mongoose = require('mongoose');

var Todo = require(./models/todo.js);


var userSchema = new mongoose.Schema({
	name: String,
	todo:[
	{
		type : mongoose.Schema.Types.ObjectId,
		ref: "Todo"
	}
	]
});

module.exports = mongoose.model("User",userSchema);