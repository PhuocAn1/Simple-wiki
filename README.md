# Simple wiki 
This is my attemp at creating a simple clone of wikipedia.

## Project Features
- **Article Creation and Editing**: Create and edit wiki articles using wikitext markup, parsed and rendered via the Bliki library. Articles support rich text formatting (e.g., headings, links, lists, tables) and are stored in a MySQL database.

- **Media Uploads**: Upload images to enhance articles, stored in a configurable server directory (`src/main/resources/static/media`) and embeddable in wiki pages.

- **User Account Management**: Register, update, and delete user accounts with secure password hashing (BCrypt). Users can provide a username and optional email, with REST APIs for retrieving or managing user data.

- **Search with Suggestions**: Search for articles and user profiles with autocomplete suggestions, powered by backend queries to the MySQL database and displayed on the ReactJS frontend.

- **JWT-Based Authentication**: Secure API endpoints with JSON Web Tokens (JWT), ensuring protected access to features like article editing and user management.

- **Wikitext Parsing and Rendering**: Render Wikipedia-style markup using the Bliki library, supporting rich formatting for articles displayed on the frontend. Note: While Bliki does support most of wikitext syntax, more advance syntax like Template is not supported.

- **Error Handling and Logging**: Robust error handling with descriptive API responses and server-side logging (SLF4J) for debugging and monitoring.

- **RESTful API**: Expose backend functionality (e.g., user management, article operations) via REST APIs for seamless frontend-backend integration.

## Project struture
- **Backend:** `back-end/simple-wiki-back-end` (Spring Boot, MySQL, Bliki)
- **Frontend:** `front-end/simple-wiki-front-end` (ReactJS)

## Backend project
The backend is made using Spring Boot, MySQL as its database and Bliki library to interpret wikitext markup. 

### Database configuration
To use your preferred database, update the `application.properties` file located at `back-end/simple-wiki-back-end/src/main/resources/application.properties`:

```properties
spring.datasource.url={path to your database. Example:jdbc:mysql://localhost:3306/db-name}
spring.datasource.username={Your database login username}
spring.datasource.password={Your database password}
spring.datasource.driver-class-name={com.mysql.cj.jdbc.Driver}
```

### Media storage
The images uploaded by user are stored in `src/main/resources/static/media`. This folder is ignored by Git to prevent large or unnecessary files from being committed. When cloning the project, ensure you::

- Create the folder manually if it doesn't exist.
- Alternatively, configure a custom media storage path in the following files:
    - `src/main/java/com.phuocan.simple_wiki/service/MediaUploadService.java`
    - `src/main/java/com.phuocan.simple_wiki/service/MultimediaService.java`
    Update the `mediaPath` variable:
    ```Java 
        String mediaPath = "src/main/resources/static/media/";
    ```
### Running the backend
1. Ensure MySQL or your database is running and the database is created.
2. Navigate to `back-end/simple-wiki-back-end` and run the project in your IDE.

## Frontend project
The frontend is made using React JS and communicates with the backend via REST APIs.

### Running the frontend
1. Navigate to the frontend directory (e.g., `front-end/simple-wiki-front-end`).
2. Install dependencies: `npm install`.
3. Start the development `server: npm start`.
4. Access the application at `http://localhost:3000` (default port).

## Notes
- Ensure the backend is running before starting the frontend.
- If your backend is running on a different port than `http://localhost:8080` go to the `front-end/simple-wiki-front-end/src/config.js` and change `API_BASE_URL` base on your backend.