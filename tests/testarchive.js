var fs = require('fs');
var path = require('path');
var archiver = require('archiver');

// create a file to stream archive data to.
var output = fs.createWriteStream(path.resolve(__dirname,"..", "output") + "/zips/831bc2ea-a43b-46f7-9ad2-d843cb9c4764.zip");
var archive = archiver('zip', {
    store: true // Sets the compression method to STORE.
});

// listen for all archive data to be written
output.on('close', function() {
  console.log(archive.pointer() + ' total bytes');
  console.log('archiver has been finalized and the output file descriptor has closed.');
});

// good practice to catch this error explicitly
archive.on('error', function(err) {
  throw err;
});

// pipe archive data to the file
archive.pipe(output);

// append files from a directory
archive.directory('../output/831bc2ea-a43b-46f7-9ad2-d843cb9c4764','831bc2ea-a43b-46f7-9ad2-d843cb9c4764');

// finalize the archive (ie we are done appending files but streams have to finish yet)
archive.finalize();