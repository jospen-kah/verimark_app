const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
    action: { type: String, required: true }, // Action performed (e.g., 'create', 'update', 'delete')  
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user who performed the action
    details: { type: String, required: true }, // Details of the action performed
    timestamp: { type: Date, default: Date.now } // Timestamp for when the action was performed
}
);

module.exports = mongoose.model('Audit', auditSchema);  