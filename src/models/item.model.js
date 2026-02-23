const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    title: { type: String, index: true },
    link: { type: String },
    description: { type: String },
    pubDate: { type: Date, index: true },
    category: { type: String },
}, {
    timestamps: true
});

module.exports = mongoose.model('Item', itemSchema);