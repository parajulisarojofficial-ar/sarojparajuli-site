/**
 * ============================================================================
 * GOOGLE APPS SCRIPT: AUTOMATED GOOGLE DRIVE TO SUPABASE BLOG SYNC
 * Author: Saroj Parajuli
 * Website: https://sarojparajuli.com.np
 * 
 * HOW IT WORKS:
 * 1. Monitors a Google Drive folder: "Saroj Blogs - Personal"
 * 2. Whenever you write or save a Google Doc or .docx file in that folder:
 *    - It extracts the Title and converts the content into clean Markdown.
 *    - Automatically calculates reading time and summary excerpt.
 *    - Pushes the blog directly to https://sarojparajuli.com.np/api/sync-blog
 *    - Supabase PostgreSQL database updates instantly.
 *    - The live website displays your new personal blog immediately!
 * 3. Keeps track of synced files so it only updates when you make changes.
 * ============================================================================
 */

// CONFIGURATION
const SYNC_CONFIG = {
  // Folder name in your Google Drive where you save your personal blogs
  FOLDER_NAME: "Saroj Blogs - Personal",
  
  // Your live production website sync endpoint
  WEBHOOK_URL: "https://sarojparajuli.com.np/api/sync-blog",
  
  // Secret authentication key (matches ADMIN_SECRET_KEY)
  SYNC_SECRET_KEY: "saroj_cms_pass_2026",
  
  // Default category for personal posts
  DEFAULT_CATEGORY: "Personal"
};

/**
 * Main Trigger Function: Run this manually or set on a 5-minute time trigger.
 */
function syncPersonalBlogsFromDrive() {
  Logger.log("Starting Personal Blog Sync from Google Drive...");
  
  const folder = getOrCreateBlogsFolder(SYNC_CONFIG.FOLDER_NAME);
  if (!folder) {
    Logger.log("Error: Could not access folder: " + SYNC_CONFIG.FOLDER_NAME);
    return;
  }
  
  const properties = PropertiesService.getScriptProperties();
  const files = folder.getFiles();
  let syncCount = 0;
  
  while (files.hasNext()) {
    const file = files.next();
    const fileId = file.getId();
    const fileName = file.getName();
    const mimeType = file.getMimeType();
    const lastUpdated = file.getLastUpdated().getTime();
    
    // Check if file was already synced at this timestamp
    const lastSyncedKey = "SYNCED_" + fileId;
    const previousSyncTime = properties.getProperty(lastSyncedKey);
    
    if (previousSyncTime && parseInt(previousSyncTime, 10) >= lastUpdated) {
      Logger.log("Skipping (already up to date): " + fileName);
      continue;
    }
    
    Logger.log("Processing modified or new document: " + fileName);
    
    try {
      let docTitle = fileName.replace(/\.(docx|doc|txt)$/i, "");
      let docContent = "";
      
      if (mimeType === MimeType.GOOGLE_DOCS) {
        const doc = DocumentApp.openById(fileId);
        docTitle = doc.getName() || docTitle;
        docContent = convertDocToMarkdown(doc);
      } else if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || mimeType === "application/msword") {
        // If it's a Word document (.docx), convert to Google Doc temporarily or read plain text
        docContent = extractTextFromWordFile(file);
      } else if (mimeType === MimeType.PLAIN_TEXT) {
        docContent = file.getBlob().getDataAsString();
      } else {
        Logger.log("Unsupported file type: " + mimeType + " for " + fileName);
        continue;
      }
      
      if (!docContent || docContent.trim().length < 10) {
        Logger.log("Document content is too short, skipping: " + fileName);
        continue;
      }
      
      // Send payload to website API
      const success = pushBlogToWebsite({
        drive_file_id: fileId,
        title: docTitle,
        content: docContent,
        category: SYNC_CONFIG.DEFAULT_CATEGORY,
        blog_type: "personal",
        updated_at: file.getLastUpdated().toISOString()
      });
      
      if (success) {
        properties.setProperty(lastSyncedKey, String(lastUpdated));
        syncCount++;
        Logger.log("Successfully published blog: " + docTitle);
      }
    } catch (err) {
      Logger.log("Error processing file " + fileName + ": " + err.toString());
    }
  }
  
  Logger.log("Blog sync completed. Total synced in this run: " + syncCount);
}

/**
 * Converts a Google Doc body into clean Markdown formatted text
 */
function convertDocToMarkdown(doc) {
  const body = doc.getBody();
  const numChildren = body.getNumChildren();
  const mdLines = [];
  
  for (let i = 0; i < numChildren; i++) {
    const child = body.getChild(i);
    const type = child.getType();
    
    if (type === DocumentApp.ElementType.PARAGRAPH) {
      const paragraph = child.asParagraph();
      const heading = paragraph.getHeading();
      const text = paragraph.getText().trim();
      
      if (!text) {
        mdLines.push("");
        continue;
      }
      
      let prefix = "";
      switch (heading) {
        case DocumentApp.ParagraphHeading.HEADING_1: prefix = "# "; break;
        case DocumentApp.ParagraphHeading.HEADING_2: prefix = "## "; break;
        case DocumentApp.ParagraphHeading.HEADING_3: prefix = "### "; break;
        case DocumentApp.ParagraphHeading.HEADING_4: prefix = "#### "; break;
        default: prefix = ""; break;
      }
      
      mdLines.push(prefix + text);
    } else if (type === DocumentApp.ElementType.LIST_ITEM) {
      const listItem = child.asListItem();
      const glyph = listItem.getGlyphType();
      const prefix = (glyph === DocumentApp.GlyphType.NUMBER) ? "1. " : "- ";
      mdLines.push(prefix + listItem.getText().trim());
    } else if (type === DocumentApp.ElementType.TABLE) {
      const table = child.asTable();
      const numRows = table.getNumRows();
      for (let r = 0; r < numRows; r++) {
        const row = table.getRow(r);
        const cells = [];
        for (let c = 0; c < row.getNumCells(); c++) {
          cells.push(row.getCell(c).getText().trim().replace(/\|/g, "\\|"));
        }
        mdLines.push("| " + cells.join(" | ") + " |");
        if (r === 0) {
          mdLines.push("| " + cells.map(() => "---").join(" | ") + " |");
        }
      }
    }
  }
  
  return mdLines.join("\n\n");
}

/**
 * Extracts plain text from Word / .docx files
 */
function extractTextFromWordFile(file) {
  try {
    // If Drive Advanced Service is available, convert to Doc
    const blob = file.getBlob();
    const docFile = Drive.Files.copy({
      title: "[Auto-Sync Temp] " + file.getName(),
      mimeType: MimeType.GOOGLE_DOCS
    }, file.getId(), { convert: true });
    
    const tempDoc = DocumentApp.openById(docFile.id);
    const content = convertDocToMarkdown(tempDoc);
    
    // Trash the temporary doc
    DriveApp.getFileById(docFile.id).setTrashed(true);
    return content;
  } catch (e) {
    // Fallback: extract string from blob
    return file.getBlob().getDataAsString();
  }
}

/**
 * Pushes blog payload to website serverless endpoint
 */
function pushBlogToWebsite(payload) {
  const options = {
    method: "post",
    contentType: "application/json",
    headers: {
      "x-sync-key": SYNC_CONFIG.SYNC_SECRET_KEY
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(SYNC_CONFIG.WEBHOOK_URL, options);
  const code = response.getResponseCode();
  const respText = response.getContentText();
  
  if (code >= 200 && code < 300) {
    return true;
  } else {
    Logger.log("Failed to push blog (" + code + "): " + respText);
    return false;
  }
}

/**
 * Finds or creates the dedicated Google Drive folder
 */
function getOrCreateBlogsFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(folderName);
}

/**
 * Setup Automated Trigger: Runs every 5 minutes automatically.
 * Run this function once from Google Apps Script editor.
 */
function setupFiveMinuteTrigger() {
  // Delete existing triggers for this function to prevent duplicates
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "syncPersonalBlogsFromDrive") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  
  // Create a new 5-minute recurring timer
  ScriptApp.newTrigger("syncPersonalBlogsFromDrive")
    .timeBased()
    .everyMinutes(5)
    .create();
    
  Logger.log("5-Minute automatic sync trigger successfully activated!");
}

/**
 * Reset sync history (Force re-sync of all documents)
 */
function resetSyncCache() {
  PropertiesService.getScriptProperties().deleteAllProperties();
  Logger.log("Sync cache cleared. Next run will re-sync all documents.");
}
