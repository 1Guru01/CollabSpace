export default function LoginPage() {
  return (
    <div style={{ padding: 30 }}>
      <h1>Login</h1>
      <a
        href="/api/auth/google/start"
        style={{
          display: "inline-block",
          marginTop: 20,
          padding: "10px 20px",
          background: "#4285F4",
          color: "white",
          borderRadius: 6,
          textDecoration: "none",
        }}
      >
        Continue with Google
      </a>
    </div>
  );
}
