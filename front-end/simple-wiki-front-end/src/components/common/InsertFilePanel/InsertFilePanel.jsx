import React, { useState } from 'react';
import styles from './InsertFilePanel.module.css'

const InsertFilePanel = ({ onClose, onUploadNavigate }) => {
  const [filename, setFilename] = useState('');
  const [caption, setCaption] = useState('');
  const [altText, setAltText] = useState('');
  const [size, setSize] = useState('');
  const [align, setAlign] = useState('');
  const [format, setFormat] = useState('thumb');

  const handleInsert = () => {
    if (filename === "") {
      onClose("");
      return;
    }
        
    // Build wikitext by including only non-empty fields
    const fields = [];
    if (format.trim()) fields.push(format.trim());
    if (align.trim()) fields.push(align.trim());
    if (size.trim()) fields.push(`${size.trim()}px`);
    if (altText.trim()) fields.push(`alt=${altText.trim()}`);
    if (caption.trim()) fields.push(caption.trim());

    // Construct wikitext with non-empty fields joined by pipes
    const wikitext = `[[File:${filename.trim()}${fields.length ? '|' + fields.join('|') : ''}]]`;

    console.log('Generated wikitext:', wikitext);
    onClose(wikitext); // or handle wikitext insertion elsewhere
  };

  return (
    <div className={styles.insertPanelOverlay}>
        <div className={styles.insertPanel}>
          <h3>Insert file</h3>

          <div className={styles.field}>
            <label>Filename:</label>
            <input value={filename} onChange={(e) => setFilename(e.target.value)} />
          </div>

          <div className={styles.field}>
            <label>Caption:</label>
            <input value={caption} onChange={(e) => setCaption(e.target.value)} />
          </div>

          <div className={styles.field}>
            <label>Alternative Text:</label>
            <input value={altText} onChange={(e) => setAltText(e.target.value)} />
          </div>

          <div className={styles.field}>
            <label>Size (e.g. 220):</label>
            <input value={size} onChange={(e) => setSize(e.target.value)} />
          </div>

          <div className={styles.field}>
            <label>Align:</label>
            <select value={align} onChange={(e) => setAlign(e.target.value)}>
              <option value="">default</option>
              <option value="left">left</option>
              <option value="right">right</option>
              <option value="center">center</option>
            </select>
          </div>

          <div className={styles.field}>
            <label>Format:</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="thumb">thumb</option>
              <option value="frame">frame</option>
              <option value="frameless">frameless</option>
            </select>
          </div>

          <div className={styles.buttons}>
            <button onClick={onUploadNavigate}>Upload</button>
            <button onClick={handleInsert}>Insert</button>
            <button onClick={() => onClose("")}>Cancel</button>
          </div>
        </div>
    </div>
  );
};

export default InsertFilePanel;