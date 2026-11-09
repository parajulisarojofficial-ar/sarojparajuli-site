/**
 * GOOGLE APPS SCRIPT FILE: Copy and paste this directly into script.google.com
 * Project Name: SarojParajuli-BlogSync
 */

const SYNC_CONFIG = {
  FOLDER_NAME: "Saroj Blogs - Personal",
  WEBHOOK_URL: "https://sarojparajuli.com.np/api/sync-blog",
  SYNC_SECRET_KEY: "saroj_cms_pass_2026",
  DEFAULT_CATEGORY: "Personal"
};

function syncPersonalBlogsFromDrive() {
  Logger.log("Starting Personal Blog Sync from Google Drive...");
  
  const folders = DriveApp.getFoldersByName(SYNC_CONFIG.FOLDER_NAME);
  if (!folders.hasNext()) {
    DriveApp.createFolder(SYNC_CONFIG.FOLDER_NAME);
    Logger.log("Created folder: " + SYNC_CONFIG.FOLDER_NAME + ". Place your Google Docs or .docx files inside it.");
    return;
  }
  const folder = folders.next();
  
  const properties = PropertiesService.getScriptProperties();
  const files = folder.getFiles();
  let syncCount = 0;
  
  while (files.hasNext()) {
    const file = files.next();
    const fileId = file.getId();
    const fileName = file.getName();
    const mimeType = file.getMimeType();
    const lastUpdated = file.getLastUpdated().getTime();
    
    const lastSyncedKey = "SYNCED_" + fileId;
    const previousSyncTime = properties.getProperty(lastSyncedKey);
    
    if (previousSyncTime && parseInt(previousSyncTime, 10) >= lastUpdated) {
      continue;
    }
    
    Logger.log("Syncing document: " + fileName);
    
    try {
      let docTitle = fileName.replace(/\.(docx|doc|txt)$/i, "");
      let docContent = "";
      
      if (mimeType === MimeType.GOOGLE_DOCS) {
        const doc = DocumentApp.openById(fileId);
        docTitle = doc.getName() || docTitle;
        docContent = convertDocToMarkdown(doc);
      } else if (mimeType === MimeType.PLAIN_TEXT) {
        docContent = file.getBlob().getDataAsString();
      } else {
        // Word doc
        try {
          const blob = file.getBlob();
          const docFile = Drive.Files.copy({
            title: "[Temp] " + file.getName(),
            mimeType: MimeType.GOOGLE_DOCS
          }, file.getId(), { convert: true });
          const tempDoc = DocumentApp.openById(docFile.id);
          docContent = convertDocToMarkdown(tempDoc);
          DriveApp.getFileById(docFile.id).setTrashed(true);
        } catch (e) {
          docContent = file.getBlob().getDataAsString();
        }
      }
      
      if (!docContent || docContent.trim().length < 5) continue;
      
      const payload = {
        drive_file_id: fileId,
        title: docTitle,
        content: docContent,
        category: SYNC_CONFIG.DEFAULT_CATEGORY,
        blog_type: "personal",
        updated_at: file.getLastUpdated().toISOString()
      };
      
      const options = {
        method: "post",
        contentType: "application/json",
        headers: { "x-sync-key": SYNC_CONFIG.SYNC_SECRET_KEY },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      };
      
      const response = UrlFetchApp.fetch(SYNC_CONFIG.WEBHOOK_URL, options);
      if (response.getResponseCode() >= 200 && response.getResponseCode() < 300) {
        properties.setProperty(lastSyncedKey, String(lastUpdated));
        syncCount++;
        Logger.log("Successfully synced: " + docTitle);
      } else {
        Logger.log("API returned error: " + response.getContentText());
      }
    } catch (err) {
      Logger.log("Error syncing " + fileName + ": " + err.toString());
    }
  }
  
  Logger.log("Sync finished. " + syncCount + " files updated.");
}

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
    }
  }
  
  return mdLines.join("\n\n");
}

function setupFiveMinuteTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "syncPersonalBlogsFromDrive") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  
  ScriptApp.newTrigger("syncPersonalBlogsFromDrive")
    .timeBased()
    .everyMinutes(5)
    .create();
    
  Logger.log("5-Minute automatic sync trigger activated successfully!");
}
