import { useState } from 'react';
import {
  FaAngleLeft,
  FaAngleRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight
} from 'react-icons/fa'
import styles from './MediaTable.module.css'

export function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;

    const units = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
    const exponent = Math.floor(Math.log(bytes) / Math.log(1024));

    // Make sure exponent doesn't exceed units length
    const safeExponent = Math.min(exponent, units.length);
    const size = bytes / Math.pow(1024, safeExponent);

    return `${size.toFixed(1)} ${units[exponent - 1]}`;
}

export const MediaTable = ({ data=[] }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 20;

    const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));

    const handleFirstPage = () => setCurrentPage(1);
    const handlePreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
    const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const handleLastPage = () => setCurrentPage(totalPages);

    const currentRows = data.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    return (
        <div className={styles.mediaTableContainer}>
            <div className={styles.paginationControls}>
                <button onClick={handleFirstPage} disabled={currentPage === 1}>
                    <FaAngleDoubleLeft />
                </button>
                <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                    <FaAngleLeft />
                </button>
                <span>
                Page {currentPage} of {totalPages}
                </span>
                    <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                <FaAngleRight />
                </button>
                <button onClick={handleLastPage} disabled={currentPage === totalPages}>
                    <FaAngleDoubleRight />
                </button>
            </div>

            <table className={styles.mediaTable}>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Name</th>
                        <th>Thumbnail</th>
                        <th>Size</th>
                        <th>User</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {currentRows.map((item, index) => (
                        <tr key={index}>
                            <td>{item.uploadedAt}</td>
                            <td>{item.fileName}</td>
                            <td style={{ width: '180px', height: 'auto' }}>
                                <a href={`http://localhost:8080/simple-wiki${item.filePath}`} target="_blank" rel='noreferrer'>
                                    <img
                                    src={`http://localhost:8080/simple-wiki${item.filePath}`}
                                    alt={item.name}
                                    style={{ width: '180px', height: 'auto' }}
                                    />
                                </a>                                
                            </td>
                            <td>{formatSize(item.fileSize)}</td>
                            <td>{item.username}</td>
                            <td>{item.description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className={styles.paginationControls}>
                <button onClick={handleFirstPage} disabled={currentPage === 1}>
                    <FaAngleDoubleLeft />
                </button>
                <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                    <FaAngleLeft />
                </button>
                <span>
                Page {currentPage} of {totalPages}
                </span>
                    <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                <FaAngleRight />
                </button>
                <button onClick={handleLastPage} disabled={currentPage === totalPages}>
                    <FaAngleDoubleRight />
                </button>
            </div>
        </div>
    )
}

export default MediaTable;
