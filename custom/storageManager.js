require("dotenv").config();

const azure = require("azure-storage");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
var getStream = require('into-stream')
class AzStorageManager {
  generateSasToken(blobName) {
    var container = process.env.AZURE_STORAGE_CONTAINER_NAME;
    var blobService = azure.createBlobService(process.env.AZURE_STORAGE_CONNECTION_STRING);

    // Create a SAS token that expires in an hour
    // Set start time to five minutes ago to avoid clock skew.
    var startDate = new Date();
    startDate.setMinutes(startDate.getMinutes() - 5);
    var expiryDate = new Date(startDate);
    expiryDate.setMinutes(startDate.getMinutes() + 60);

    var sharedAccessPolicy = {
      AccessPolicy: {
        Permissions: azure.BlobUtilities.SharedAccessPermissions.READ,
        Start: startDate,
        Expiry: expiryDate,
      },
    };

    var sasToken = blobService.generateSharedAccessSignature(container, blobName, sharedAccessPolicy);

    return { uri: blobService.getUrl(container, blobName, sasToken, true) };
  }
  getBlobName(originalName) {
    var dotextension = path.extname(originalName);
    const identifier = uuidv4();
    return `${identifier}${dotextension}`;
  }

  uploadfile(file) {
    return new Promise((resolve, reject) => {
      var blobService = azure.createBlobService(process.env.AZURE_STORAGE_CONNECTION_STRING);
      var container = process.env.AZURE_STORAGE_CONTAINER_NAME;
      var filename = "abc/" + this.getBlobName(file.originalname);
      const blobName = filename,
        stream = getStream(file.buffer),
        streamLength = file.buffer.length;
      blobService.createBlockBlobFromStream(container, blobName, stream, streamLength, (err) => {
        if (err) {
          handleError(err);
          return;
        }
        resolve(filename)
      });
    });
  }
}
module.exports = new AzStorageManager();
