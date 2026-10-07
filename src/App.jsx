import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import MainLayout from "./components/MainLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AddBook from "./pages/books/AddBook";
import Dashboard from "./dashboard/Dashboard";
import EditBook from "./pages/books/EditBook";
import BrowseBooks from "./pages/books/BrowseBooks";
import MyRequests from "./pages/exchanges/MyRequests";
import IncomingRequests from "./pages/exchanges/IncomingRequests";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import UserManagement from "./pages/admin/UserManagement";
import BookManagement from "./pages/admin/BookManagement";
import MyBooks from "./pages/books/MyBooks";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import ReportManagement from "./pages/admin/ReportManagement";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import FAQs from "./pages/FAQs";
import HelpBot from "./components/HelpBot";

function App() {
    return (
        <BrowserRouter>
                <HelpBot />
            <AuthProvider>
                <Routes>

                    <Route
                        path="/"
                        element={<Navigate to="/login" replace />}
                    />

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/register"
                        element={<Register />}
                    />

<Route
    path="/dashboard"
    element={
        <ProtectedRoute>
            <MainLayout>
                <Dashboard />
            </MainLayout>
        </ProtectedRoute>
    }
/>

                    <Route
                        path="/add-book"
                        element={
                            <ProtectedRoute>
                                <AddBook />
                            </ProtectedRoute>
                        }
                    />

<Route
    path="/edit-book/:book_id"
    element={
        <ProtectedRoute>
            <EditBook />
        </ProtectedRoute>
    }
/>

<Route
    path="/browse-books"
    element={
        <ProtectedRoute>
            <MainLayout>
                <BrowseBooks />
            </MainLayout>
        </ProtectedRoute>
    }
/>

<Route
    path="/my-requests"
    element={
        <ProtectedRoute>
            <MainLayout>
                <MyRequests />
            </MainLayout>
        </ProtectedRoute>
    }
/>

<Route
    path="/incoming-requests"
    element={
        <ProtectedRoute>
            <MainLayout>
                <IncomingRequests />
            </MainLayout>
        </ProtectedRoute>
    }
/>

<Route
    path="/admin/dashboard"
    element={
        <AdminRoute>
            <MainLayout>
                <AdminDashboard />
            </MainLayout>
        </AdminRoute>
    }
/>

<Route
    path="/admin/users"
    element={
        <AdminRoute>
            <MainLayout>
                <UserManagement />
            </MainLayout>
        </AdminRoute>
    }
/>

<Route
    path="/admin/books"
    element={
        <AdminRoute>
            <MainLayout>
                <BookManagement />
            </MainLayout>
        </AdminRoute>
    }
/>

<Route
    path="/my-books"
    element={
        <ProtectedRoute>
            <MainLayout>
                <MyBooks />
            </MainLayout>
        </ProtectedRoute>
    }
/>

<Route
    path="/profile"
    element={
        <ProtectedRoute>
            <MainLayout>
                <Profile />
            </MainLayout>
        </ProtectedRoute>
    }
/>

<Route 
path="/notifications" 
element={
            <ProtectedRoute>
            <MainLayout>
<Notifications />
</MainLayout>
</ProtectedRoute>
} 
/>

<Route
    path="/admin/reports"
    element={
        <MainLayout>
            <ReportManagement />
        </MainLayout>
    }
/>

<Route
    path="/forgot-password"
    element={<ForgotPassword />}
/>

<Route
    path="/reset-password/:token"
    element={<ResetPassword />}
/>

<Route path="/faqs" element={<MainLayout><FAQs /></MainLayout>} />

                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}


export default App;