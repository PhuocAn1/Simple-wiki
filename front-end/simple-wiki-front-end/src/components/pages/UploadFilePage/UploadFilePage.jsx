import { useRef } from "react";
import Header from "../../common/Header/Header";
import styles from "./UploadFilePage.module.css"
import { useEffect, useState } from "react";
import { checkFileNames, uploadFiles } from "../../services/MultiMediaService";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";

export const UploadFilePage = () => {
    const location = useLocation();
    const [uploadMultipleFiles, setuploadMultipleFiles] = useState(false);
    const [fileDescription, setfileDescription] = useState("");
    const [destinationFilename, setDestinationFilename] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [rejectedFiles, setRejectedFiles] = useState([]);
    const fileInputRef = useRef(null);
    const permittedTypes = [
        'image/png', 'image/gif', 'image/jpeg', 'image/webp', 'image/x-icon', 'image/svg+xml',
        'audio/wav', 'audio/mpeg', 'audio/ogg', 'audio/flac',
        'video/mp4', 'video/webm', 'video/x-matroska', 'video/quicktime',
        'application/pdf'
    ];
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: string, files?: string[] }
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    const {isLoggedIn} = useAuth();

    const handleUploadFileChange = (e) => {
        const files  = Array.from(e.target.files); // convert FileList to array
        const accepted = [];
        const rejected = [];
        let totalSize = 0;

        for (let file of files) {
            if (permittedTypes.includes(file.type)) {
                if (file.size <= MAX_FILE_SIZE) {
                    if (totalSize + file.size > MAX_FILE_SIZE) {
                        rejected.push({
                            name: file.name,
                            size: file.size,
                            preview: URL.createObjectURL(file),
                            reason: 'Total upload size would exceed 50MB'
                        });
                        break;
                    }
                    accepted.push(file);
                    totalSize += file.size;
                } else {
                    rejected.push({
                        name: file.name,
                        size: file.size,
                        preview: URL.createObjectURL(file),
                        reason: 'File exceeds maximum size of 10MB'
                    });
                }
            } else {
                rejected.push({
                    name: file.name,
                    type: file.type,
                    preview: URL.createObjectURL(file),
                    reason: 'Unsupported file type'
                });
            }
        }

        setSelectedFiles(accepted);
        setRejectedFiles(rejected);
    }

    const checkDuplicateFileNames = async (selectedFiles) => {
        const rejected = [];
        // Extract just the names from File objects
        const fileNames = selectedFiles.map(file => file.name);
        console.log("Checking filenames: ", fileNames);
        // Check the file name to see if any has existed in the DB
        const duplicates = await checkFileNames(fileNames);

        for (let fileName of duplicates) {
           // Find the corresponding File object in selectedFiles
            const file = selectedFiles.find(f => f.name === fileName);
            if (file) {
                rejected.push({
                    name: fileName,
                    reason: 'File with name: ' + fileName + ' has existed!',
                    preview: URL.createObjectURL(file) // Add preview URL
                });
            }
        }
        setRejectedFiles(rejected);

        if (rejected.length === 0) {
            return false; // No duplicate file
        }
        return true;
    }

    const UploadButtonClicked = async (e) => {
        e.preventDefault();

        if (selectedFiles.length === 0) {
            alert("No file have been selected for upload!")
            setRejectedFiles([]);
            return;
        }

        if (uploadMultipleFiles) {
            const hasDuplicate = await checkDuplicateFileNames(selectedFiles);
            if(hasDuplicate === false) {
                console.log("File description: ", fileDescription, 'Selected files:', selectedFiles);

                setUploading(true);
                setMessage(null); // Clear previous messages

                try {
                    const result = await uploadFiles(selectedFiles, fileDescription);
                    setMessage({
                        type: 'success',
                        text: result.message,
                        files: result.files
                    });
                } catch (error) {
                    setMessage({
                        type: 'error',
                        text: error.message
                    });
                } finally {
                    setUploading(false);
                }
            }
        } else {
            // If a destination file name is given then set the file name as the destination filename, if no file extension given
            // , make sure it match the file extension
            const file = selectedFiles[0];
            const originalName = file.name;
            const originalExtension = originalName.split('.').pop().toLowerCase();
            const mimeType = file.type;
            const extensionFromType = mimeType.split('/').pop(); // e.g., "jpeg" from "image/jpeg"

            let finalFilename = destinationFilename?.trim();

            if (!finalFilename) {
                // No override — use original filename
                finalFilename = originalName;
            } else {
                const hasExtension = finalFilename.includes('.');
                const customExtension = hasExtension ? finalFilename.split('.').pop().toLowerCase() : null;
        
                if (!hasExtension) {
                    // Append original file's extension
                    finalFilename += '.' + originalExtension;
                } else if (customExtension !== originalExtension && customExtension !== extensionFromType) {
                    // Mismatch — reject
                    setRejectedFiles([
                        {
                        name: originalName,
                        preview: URL.createObjectURL(file), // Add preview URL
                        reason: `Mismatch between actual file extension (${originalExtension}) and destination filename (.${customExtension})`
                        }
                    ]);
                    setSelectedFiles([]); // Clear accepted list
                    return;
                }
            }
            
            // Rename the the file by recreate it
            const renamedFile = new File([file], finalFilename, {
                type: file.type,
            });

            // ✅ Final upload object
            const uploadObject = {
                file: renamedFile,
                filename: finalFilename,
                description: fileDescription
            };
            
            const hasDuplicate = await checkDuplicateFileNames([uploadObject.file]);

            if (!hasDuplicate) {
                console.log('Ready to upload:', uploadObject);
                setUploading(true);
                setMessage(null); // Clear previous messages

                try {
                    const result = await uploadFiles(renamedFile, fileDescription);
                    setMessage({
                        type: 'success',
                        text: result.message,
                        files: result.files
                    });
                } catch (error) {
                    setMessage({
                        type: 'error',
                        text: error.message
                    });
                } finally {
                    setUploading(false);
                }
            }

            //console.log("File description: ", fileDescription, "Destination filename: ", destinationFilename, 'Selected file:', selectedFiles);
        }
        
    }

    // Cleanup URLs when component unmounts or rejectedFiles changes
    useEffect(() => {
        return () => {
            rejectedFiles.forEach((file) => {
                if (file.preview) {
                    URL.revokeObjectURL(file.preview);
                }
            });
        };
    }, [rejectedFiles]);

    const handleDestinatonFilenameChange = (e) => {
        setDestinationFilename(e.target.value);
    }

    /*
    useEffect(() => {
        const channel = new BroadcastChannel('authChannel');

        channel.onmessage = (event) => {
            const { token, username, userId } = event.data;
            // Store in sessionStorage
            sessionStorage.setItem('jwtToken', token);
            sessionStorage.setItem('username', username);
            sessionStorage.setItem('userId', userId);
        };
        //console.log("username:", sessionStorage.getItem("username"));
        return () => channel.close(); // cleanup
    }, []);
    */
    
    const handleFileDescriptionChange = (e) => {
        setfileDescription(e.target.value);
    }
    
    return (
        <div className="wiki-container">
            <Header/>
            <div className="page-content">
                <h1 className='username-heading'>Upload image/file</h1>
                {isLoggedIn ? (
                    <div className={styles.uploadText}>
                    <dl>
                        <dt>Recent upload</dt>
                        <dd>To view or search previously uploaded files go to the <Link to='/ListFiles'>list of uploaded files</Link>, (re)uploads are also logged in the upload log, deletions in the deletion log.</dd>
                    </dl>

                    <dl>
                        <dt>Uploading new images</dt>
                        <dd>Use the form below to upload files.</dd>
                    </dl>

                    <dl>
                        <dt>Using</dt>
                        <dd>To display or link to an uploaded image on a wiki page, use one of these wikitext formats. Note: Spaces in file names (e.g., "My Image.jpg") 
                            are automatically replaced with underscores (_) when saved to the database, so use underscores in the wikitext (e.g., My_Image.jpg).</dd>
                        <ul>
                            <li>
                                <strong><code>[[File:My_Image.jpg]]</code></strong>
                                <ul><li>to use the full-size version of the file</li></ul>
                            </li>

                            <li>
                                <strong><code>[[File:My_Image.png|200px|thumb|left|caption]]</code></strong>
                                <ul><li>to use a 200 pixel wide rendition in a box in the left margin with "caption" as description</li></ul>
                            </li>

                            <li>
                                <strong><code>[[:File:My_Image.jpg]]</code></strong>
                                <ul><li>for directly linking to the file without displaying the file (i.e. a <code>:</code> prefix)</li></ul>
                            </li>
                        </ul>
                    </dl>

                    {/* This part display the rejected files */}
                    {rejectedFiles.length > 0 && (
                      <div className={styles.rejectedFileList}>
                        <h4>Some files were rejected:</h4>
                        <ul>
                          {rejectedFiles.map((file, index) => (
                            <li key={index} className={styles.rejectedFileItem}>
                                <div className={styles.rejectedFilePreview}>
                                    <img
                                        src={file.preview}
                                        alt={file.name}
                                        style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover' }}
                                    />
                                </div>
                                <div className={styles.rejectedFileDetails}>
                                    <strong>{file.name}</strong> ({file.type}) – {file.reason}
                                </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* This part display a successful upload message */}
                    {message && (
                        <div
                            className={styles.successMessage}
                            style={{
                                marginTop: '20px',
                                padding: '10px',
                                borderRadius: '4px',
                                backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                                color: message.type === 'success' ? '#155724' : '#721c24',
                                border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
                            }}
                        >
                            <p>{message.text}</p>
                            {message.files && message.files.length > 0 && (
                                <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                                    {message.files.map((file, index) => (
                                        <li key={index}>{file}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    <form className={styles.uploadForm} action="">
                        <fieldset>
                            <legend>Source file</legend>
                            <table>
                                <tbody>
                                    <tr>
                                        <td>Upload multiple files:</td>
                                        <td>
                                            <label>
                                              <input
                                                type="radio"
                                                name="multipleFiles"
                                                id="multipleFiles"
                                                value="yes"
                                                checked={uploadMultipleFiles === true}
                                                onChange={() => setuploadMultipleFiles(true)}
                                              /> Yes
                                            </label>
                                            &nbsp;
                                            <label>
                                              <input
                                                type="radio"
                                                name="multipleFiles"
                                                id="multipleFiles"
                                                value="no"
                                                checked={uploadMultipleFiles === false}
                                                onChange={() => {
                                                        setuploadMultipleFiles(false);
                                                        if (fileInputRef.current) {
                                                            fileInputRef.current.value = null; // Clear selected files
                                                            setSelectedFiles([]);
                                                        }
                                                        setRejectedFiles([]);
                                                    }}
                                              /> No
                                            </label>
                                          </td>

                                    </tr>

                                    <tr>
                                        <td>
                                        <label htmlFor="wpUploadFile">
                                          {uploadMultipleFiles ? 'Source files:' : 'Source filename:'}
                                        </label>
                                        </td>
                                        <td>
                                            <input
                                            ref={fileInputRef}
                                            id="wpUploadFile"
                                            name="wpUploadFile"
                                            size="60"
                                            type="file"
                                            className={styles.wpUploadFile}
                                            multiple={uploadMultipleFiles}
                                            onChange={handleUploadFileChange}
                                            accept=".png,.gif,.jpg,.jpeg,.webp,.ico,.svg,.wav,.mp3,.ogg,.flac,.mp4,.webm,.mkv,.mov,.pdf"
                                            />
                                        </td>
                                    </tr>

                                    <tr>
                                        <td>Maximum file size: 10 MB</td>
                                    </tr>

                                    <tr>
                                        <td>Maximum upload size: 50 MB</td>
                                    </tr>

                                    <tr>
                                        <td><label htmlFor=""></label></td>
                                        <td>
                                            <div className={styles.uploadPermitted}>
                                                <p>Permitted file types: png, gif, jpg, jpeg, webp, ico, svg, wav, mp3, ogg, flac, mp4, webm, mkv, mov, pdf.</p>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>                                       
                            </table>
                        </fieldset>

                        <fieldset>
                            <legend>File description</legend>
                            <table className={styles.fileDescriptionForm}>
                                <tbody>
                                    {!uploadMultipleFiles && (
                                      <tr>
                                        <td>
                                          <label htmlFor="wpDestFile">Destination filename:</label>
                                        </td>
                                        <td>
                                          <input type="text" name="wpDestFile" id="wpDestFile" size="60" value={destinationFilename} onChange={handleDestinatonFilenameChange} autoComplete="off"/>
                                        </td>
                                      </tr>
                                    )}

                                    <tr>
                                        <td>
                                            <label htmlFor="wpUploadDescription">File description:</label>
                                        </td>
                                        <td>
                                            <textarea 
                                            name="wpUploadDescription"
                                            id="wpUploadDescription"
                                            className={styles.wpUploadDescription}
                                            value={fileDescription}
                                            onChange={handleFileDescriptionChange}
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </fieldset>

                        <button className="preview-button" 
                                type="button" 
                                onClick={UploadButtonClicked}
                                // disabled={rejectedFiles.length > 0}
                        >
                            Upload
                        </button>
                    </form>
                </div>
                ) : (  
                    <div className={styles.permissionMessages}>
                        <p>Please <Link to="/login" state={{ from: location }}>log in</Link> to upload images/files.</p>
                    </div>
                )}
                
            </div>
        </div>
    )
}

export default UploadFilePage;