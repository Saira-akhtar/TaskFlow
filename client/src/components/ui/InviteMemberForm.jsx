import { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";

const InviteMemberForm = ({ onInvite, isLoading = false }) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    setError("");
    onInvite?.({ email, role });
    setEmail("");
    setRole("member");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Email address"
        type="email"
        name="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setError("");
        }}
        placeholder="teammate@example.com"
        disabled={isLoading}
      />

      {error && (
        <p className="text-sm text-rose-600" role="alert">
          {error}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Role
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={isLoading}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
        >
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "Sending Invite..." : "Send Invite"}
      </Button>
    </form>
  );
};

export default InviteMemberForm;