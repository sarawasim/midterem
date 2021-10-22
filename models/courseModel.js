const mongoose = require("mongoose");

const {Schema} = mongoose;

const courseModel = new Schema({
    day: {type: String},
    title: {type: String},
    time: { type: String },
    location: {type: String},
});

module.exports = mongoose.model("Course", courseModel);
