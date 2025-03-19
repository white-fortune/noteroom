import { DashBoard } from "./pages/dashboard/index";
import { LeftPanel, NoteSearchBar, NotificationModal, RightPanel } from "./partials/index";
import MobileControlPanel from "./partials/MobileControlPanel";
import { useState } from "react";
import PostView from "./pages/post-view/PostView";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import SearchProfile from "./pages/search-profile/SearchProfile";
import Settings from "./pages/settings/Settings";	
import UserProfile from "./pages/user-profile/UserProfile";
// import SignUp from "./pages/sign-up/SignUp";
import { useUserAuth } from "./context/UserAuthContext";
import Login from "./pages/login/Login";
import nrLogo from "./assets/ng_logo.png"
import UploadNote from "./pages/upload-note/UploadNote";

//TODO: A reddit like logo when the feed loads or the user auth loads

function PublicRoute() {
	const [userAuth, , loading] = useUserAuth()
	if (loading) {
		return <>
			<img src={nrLogo} />
		</>
	}
	if (userAuth) {
		return <Navigate to="/feed" />
	}

	return <Outlet />
}

function ProtectedRoute() {
	const [userAuth, , loading] = useUserAuth()
	if (loading) {
		return <>
			<img src={nrLogo} />
		</>
	}
	if (!userAuth) {
		return <Navigate to="/login" />
	}

	return <Outlet />
}

function App() {	
	const [showNotiModal, setShowNotiModal] = useState(false);
	const [showRightPanel, setShowRightPanel] = useState(false);
	const [userAuth] = useUserAuth();

	return (
		<>
			<Routes>
				<Route element={<PublicRoute />}>
					<Route path="/login" element={<Login />} />
				</Route>

				<Route element={<ProtectedRoute />}>
					<Route path="/feed" element={<DashBoard />} />
					<Route path="/post/:postID" element={<PostView />} />
					<Route path="/user/:username" element={<UserProfile />} />
					<Route path="/search-profile" element={<SearchProfile />} />
					<Route path="/settings" element={<Settings />} />
					<Route path="/upload" element={<UploadNote />} />
				</Route>
			</Routes>

			{userAuth && (
				<>
					<LeftPanel />
					<NoteSearchBar notiModalState={[showNotiModal, setShowNotiModal]} />
					<NotificationModal notiState={[showNotiModal, setShowNotiModal]} />
					<RightPanel notiModalState={[showNotiModal, setShowNotiModal]} rightPanelState={showRightPanel} />
					<MobileControlPanel rightPanelState={[showRightPanel, setShowRightPanel]} />
				</>
			)}
		</>
	);
}

export default App;