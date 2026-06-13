/**
 * Utility functions for communicating directly with Google Drive REST API.
 * Leverages cached user access tokens inside the browser context securely.
 */

export async function findOrCreateBackupFolder(accessToken: string, folderName: string): Promise<string> {
  const query = encodeURIComponent(`name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
  const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&spaces=drive`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to search folder: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  if (result.files && result.files.length > 0) {
    return result.files[0].id;
  }

  // Folder doesn't exist, create it
  const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    })
  });

  if (!createResponse.ok) {
    throw new Error(`Failed to create backup location: ${createResponse.status} ${createResponse.statusText}`);
  }

  const newFolder = await createResponse.json();
  return newFolder.id;
}

export async function uploadDocumentToDrive(
  accessToken: string,
  folderId: string,
  fileName: string,
  content: string,
  mimeType: string = 'text/markdown'
): Promise<{ id: string; name: string }> {
  const boundary = 'docscraft_multipart_boundary';
  
  const metadata = {
    name: fileName,
    mimeType: mimeType,
    parents: [folderId]
  };

  const multipartBody = 
    `\r\n--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: ${mimeType}\r\n\r\n` +
    `${content}\r\n` +
    `--${boundary}--`;

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartBody
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error(`Drive write failed (HTTP ${response.status}): ${errorDetails || response.statusText}`);
  }

  return await response.json();
}

export async function downloadDriveFileContent(accessToken: string, fileId: string): Promise<string> {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Download file failed (HTTP ${response.status}): ${response.statusText}`);
  }

  return await response.text();
}
