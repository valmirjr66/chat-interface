import { SyntheticEvent, useState } from "react";
import { toast, ToastContainer } from "react-toastify";

export default function Login() {
  const CREDENTIAL_PAIRS: Record<string, string> = {
    bruno: "123",
    joao: "123",
    valmir: "123",
    witness_member_1: "123",
    witness_member_2: "123",
    witness_member_3: "123",
    external: "123",
  };

  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

  const submitCallback = (event: SyntheticEvent<any>) => {
    event.preventDefault();

    if (CREDENTIAL_PAIRS[user] === password) {
      localStorage.setItem("userId", user);
      document.location.reload();
    } else {
      setUser("");
      setPassword("");

      toast("Invalid credentials, please try again 😟", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        type: "error",
      });
    }
  };

  return (
    <>
      <ToastContainer />
      <main className="loginWrapper">
        <form className="loginContainer" onSubmit={submitCallback}>
          <div className="fieldWrapper">
            <label htmlFor="userId">User</label>
            <input
              id="userId"
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
          </div>
          <div className="fieldWrapper">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="primary"
            style={{ width: 150 }}
            disabled={!user || !password}
          >
            Login
          </button>
        </form>
      </main>
    </>
  );
}
