
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PaymentTest from "./pages/PaymentTest";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/payment-test"
                    element={<PaymentTest />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
