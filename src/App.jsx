import { useState } from "react";
import "./App.css";

function App() {
  const [showRegister, setShowRegister] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (showRegister) {
    return (
      <div className="container">
        <button className="register-btn" onClick={() => setShowRegister(false)}>
          ← Kthehu
        </button>

        <div className="profile-card">
          <h1>Regjistrohu si profesionist</h1>

          <input placeholder="Emri dhe mbiemri" />
          <input placeholder="Profesioni" />
          <input placeholder="Qyteti" />
          <input placeholder="Numri i telefonit" />
          <textarea placeholder="Përshkruaj shërbimet që ofron" />

          <button className="register-btn" onClick={() => setSubmitted(true)}>
            Dërgo regjistrimin
          </button>

          {submitted && <p>✅ Regjistrimi u dërgua me sukses.</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="logo">Fix24</div>
      <h1>Gjej profesionistin e duhur pranë teje</h1>
      <p>Platforma shqiptare për profesionistë dhe klientë.</p>

      <div className="search">
        <input placeholder="Kërko profesion..." />
        <input placeholder="Qyteti..." />
        <button>Kërko</button>
      </div>

      <button className="register-btn" onClick={() => setShowRegister(true)}>
        Regjistrohu si profesionist
      </button>

      <h2>Kategoritë</h2>
      <div className="categories">
        <div className="card">Elektricist</div>
        <div className="card">Hidraulik</div>
        <div className="card">Mekanik</div>
        <div className="card">Bojaxhi</div>
      </div>
    </div>
  );
}

export default App;