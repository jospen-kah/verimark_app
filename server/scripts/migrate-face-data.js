// Migration script to fix existing face data in database
// Run this once to clean up any inconsistent data

const FaceData = require('../models/FaceData');
const { validateFaceDescriptor } = require('../services/face.service');

async function migrateFaceData() {
  try {
    console.log('=== STARTING FACE DATA MIGRATION ===');
    
    const allFaceData = await FaceData.find({});
    console.log(`Found ${allFaceData.length} face data records`);
    
    let fixed = 0;
    let errors = 0;
    
    for (const doc of allFaceData) {
      try {
        console.log(`\nProcessing user ${doc.studentId}...`);
        
        // Validate current face data
        const validation = validateFaceDescriptor(doc.faceData);
        
        if (!validation.valid) {
          console.log(`❌ Invalid face data for user ${doc.studentId}: ${validation.error}`);
          
          // Option 1: Delete invalid records
          await FaceData.deleteOne({ _id: doc._id });
          console.log(`🗑️  Deleted invalid record for user ${doc.studentId}`);
          errors++;
          continue;
        }
        
        // Check if it's in old format (just array) vs new format (object with metadata)
        if (Array.isArray(doc.faceData) && doc.faceData.length === 128) {
          // Update to ensure consistency
          doc.faceMetadata = {
            hash: validation.hash,
            timestamp: new Date().toISOString(),
            migrated: true
          };
          
          await doc.save();
          console.log(`✅ Updated metadata for user ${doc.studentId}`);
          fixed++;
        } else {
          console.log(`✅ User ${doc.studentId} already has valid format`);
        }
        
      } catch (err) {
        console.error(`❌ Error processing user ${doc.studentId}:`, err.message);
        errors++;
      }
    }
    
    console.log('\n=== MIGRATION COMPLETE ===');
    console.log(`Records processed: ${allFaceData.length}`);
    console.log(`Fixed: ${fixed}`);
    console.log(`Errors: ${errors}`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Export for use in your application
module.exports = { migrateFaceData };

// Uncomment to run immediately:
// migrateFaceData();cd