/**
 * @typedef {Object} PageRevisionDTO
 * @property {number} revisionId - The unique identifier for the revision
 * @property {number} pageId - The ID of the page this revision belongs to
 * @property {number} userId - The ID of the user who created the revision
 * @property {string} content - The content of the revision
 * @property {string} [summary] - A summary of the revision (optional)
 * @property {string} createdAt - The creation date and time of the revision
 */

/**
 * @typedef {Object} PageDTO
 * @property {number} pageId - The unique identifier for the page
 * @property {string} title - The title of the page
 * @property {number} userId - The ID of the user who created the page
 * @property {PageRevisionDTO} pageRevisionDTO - The latest revision details
 * @property {string} createdAt - The creation date and time of the page
 * @property {string} updatedAt - The last update date and time of the page
 */