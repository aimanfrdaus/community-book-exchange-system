import Sidebar from "./Sidebar";

const MainLayout = ({ children }) => {
    return (
        <div className="app-layout">

            <Sidebar />

            <main className="main-content">
                {children}
            </main>

        </div>
    );
};

export default MainLayout;