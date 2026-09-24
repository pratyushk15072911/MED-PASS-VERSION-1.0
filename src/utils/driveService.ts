import { getGoogleAccessToken } from './googleAuth';

export interface DriveAccessPermissionOptions {
  email: string;
  role: 'reader' | 'commenter' | 'writer';
  preventCopyPrintDownload?: boolean; // Restrict viewers/commenters from downloading, printing, or copying
  expirationDays?: number; // Optional expiration date for access
}

export interface DriveFileMetadata {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  webContentLink?: string;
  createdTime?: string;
  viewersCanCopyContent?: boolean;
}

/**
 * Creates or uploads a clinical health pass file directly into the user's Google Drive.
 * Supports creating Google Docs / JSON / Markdown files with advanced sharing & access restriction settings.
 */
export async function createDriveFile(
  fileName: string,
  content: string,
  mimeType: string = 'text/plain',
  options?: {
    viewersCanCopyContent?: boolean; // if false, disables download, print, and copy
    description?: string;
  }
): Promise<{ success: boolean; file?: DriveFileMetadata; error?: string }> {
  const token = getGoogleAccessToken();
  if (!token) {
    return {
      success: false,
      error: 'Google account is not connected. Please connect with Google first.',
    };
  }

  try {
    const boundary = 'medpass_drive_multipart_boundary';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadata: any = {
      name: fileName,
      mimeType: mimeType === 'application/vnd.google-apps.document' ? 'application/vnd.google-apps.document' : mimeType,
      description: options?.description || 'MedPass Secure Health Passport',
    };

    if (options?.viewersCanCopyContent !== undefined) {
      metadata.viewersCanCopyContent = options.viewersCanCopyContent;
    }

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${mimeType === 'application/vnd.google-apps.document' ? 'text/plain' : mimeType}; charset=UTF-8\r\n\r\n` +
      content +
      closeDelimiter;

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,webContentLink,createdTime,viewersCanCopyContent',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Google Drive API HTTP ${response.status}`);
    }

    const file = await response.json();
    return { success: true, file };
  } catch (err: any) {
    console.error('Error creating Google Drive file:', err);
    return { success: false, error: err.message || 'Failed to create Google Drive file' };
  }
}

/**
 * Restricts who views or edits a file by granting permissions to specific email addresses.
 * Can also disable "download, print, and copy" options and configure an expiration time.
 */
export async function shareDriveFileWithPermissions(
  fileId: string,
  permission: DriveAccessPermissionOptions
): Promise<{ success: boolean; permissionId?: string; error?: string }> {
  const token = getGoogleAccessToken();
  if (!token) {
    return {
      success: false,
      error: 'Google account is not connected.',
    };
  }

  try {
    // 1. If preventCopyPrintDownload is true, update the file's viewersCanCopyContent metadata
    if (permission.preventCopyPrintDownload !== undefined) {
      await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          viewersCanCopyContent: !permission.preventCopyPrintDownload,
        }),
      });
    }

    // 2. Build Permission object
    const permissionPayload: any = {
      role: permission.role,
      type: 'user',
      emailAddress: permission.email.trim(),
    };

    // If expiration days specified (supported on paid Google Workspace domains)
    if (permission.expirationDays && permission.expirationDays > 0) {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + permission.expirationDays);
      permissionPayload.expirationTime = expirationDate.toISOString();
    }

    // 3. Create permission via Drive API
    const permResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/permissions?sendNotificationEmail=true`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(permissionPayload),
      }
    );

    if (!permResponse.ok) {
      const errData = await permResponse.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Failed to set permission HTTP ${permResponse.status}`);
    }

    const permData = await permResponse.json();
    return { success: true, permissionId: permData.id };
  } catch (err: any) {
    console.error('Error sharing Google Drive file:', err);
    return { success: false, error: err.message || 'Failed to share file' };
  }
}

/**
 * List existing MedPass files in the user's Google Drive
 */
export async function listMedPassDriveFiles(): Promise<{ success: boolean; files?: DriveFileMetadata[]; error?: string }> {
  const token = getGoogleAccessToken();
  if (!token) {
    return {
      success: false,
      error: 'Google account is not connected.',
    };
  }

  try {
    const q = encodeURIComponent("name contains 'MedPass' and trashed = false");
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType,webViewLink,webContentLink,createdTime,viewersCanCopyContent)&pageSize=20`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return { success: true, files: data.files || [] };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to list Drive files' };
  }
}
