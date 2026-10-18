import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PaymentTest from "./pages/PaymentTest";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={<Navigate to="/payment-test" replace />}
                />

                <Route
                    path="/payment-test"
                    element={<PaymentTest />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;