import useSettingsStore from "@renderer/store/settings";

export default function Test() {
  const { user } = useSettingsStore();

  if (!user) {
    return <div>No authenticated user found.</div>;
  }

  return (
    <div style={{ padding: 16, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}></div>

      <table border={1} cellPadding={8} style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          <tr key={user.id}>
            <td>{user.id}</td>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.role}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
