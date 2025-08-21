import './App.css';
import { Routes, Route } from 'react-router-dom';
import PageComponent from './components/pages/PageComponent';
import CreateAccountPage from './components/pages/CreateAccountPage/CreateAccountPage';
import LogInPage from './components/pages/LogInPage/LogInPage';
import UserPage from './components/pages/UserPage/UserPage';
import EditUserSourcePage from './components/pages/EditSourcePage/EditUserSourcePage';
import MyInfoPage from './components/pages/MyInfoPage/MyInfoPage';
import ChangePasswordPage from './components/pages/ChangePasswordPage/ChangePasswordPage';
import ChangeEmailPage from './components/pages/ChangeEmailPage/ChangeEmailPage';
import PrivateRoute from './components/privateRoutes';
import WikiPage from './components/pages/WikiPage/wikiPage';
import EditSourcePage from './components/pages/EditSourcePage/EditSourcePage';
import UploadFilePage from './components/pages/UploadFilePage/UploadFilePage';
import ListFilesPage from './components/pages/ListFilesPage/ListFilesPage';
import PreviewPage from './components/pages/WikiPage/PreviewPage';
import { useAuth } from './components/context/AuthContext';

function App() {

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<PageComponent />} />
        <Route path="/create-account" element={<CreateAccountPage />} />
        <Route path="/login" element={<LogInPage />}/>
        <Route path='/edit-source' element={<EditUserSourcePage/>}/>
        <Route path='/edit-source/:pageTitle' element={<EditSourcePage/>}/>
        <Route path='/pages/:pageTitle' element={<WikiPage/>}/>
        <Route path='/upload' element={<UploadFilePage/>}/>
        <Route path='/ListFiles' element={<ListFilesPage/>}/>
        <Route path="/preview" element={<PreviewPage />}/>

        {/* Grouped private routes */}
        <Route element={<PrivateRoute />}>
          {/* Keep the route /user/:username as the personal user page may need some specialize function */}
          <Route path='/user/:username' element={<UserPage/>}/> 
          <Route path="/user/my-info" element={<MyInfoPage />} />
          <Route path="/settings/change-password" element={<ChangePasswordPage />} />
          <Route path="/settings/change-email" element={<ChangeEmailPage />} />
        </Route>

      </Routes>
    </div>
  );
}

export default App;
