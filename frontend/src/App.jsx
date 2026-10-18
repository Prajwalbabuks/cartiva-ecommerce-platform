
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import PaymentTest from "./pages/PaymentTest";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route
                    path="/products"
                    element={<div>Product listing coming soon.</div>}
                />
                <Route
                    path="/payment-test"
                    element={<PaymentTest />}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
