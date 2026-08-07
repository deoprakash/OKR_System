import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEmployee, getSetupStatus } from "../lib/api";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function Setup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cellNumber, setCellNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [setupEnabled, setSetupEnabled] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const resp = await getSetupStatus();
        if (!resp || !resp.setupEnabled) {
          setSetupEnabled(false);
        }
      } catch (err) {
        // allow showing form if check fails
      }
    })();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!name || !email || !password || !cellNumber)
      return setError("All fields are required");
    if (password !== confirm) return setError("Passwords do not match");

    setLoading(true);
    try {
      const payload = {
        empName: name,
        emailId: email,
        cellNumber: cellNumber,
        isAdmin: true,
        password,
      };
      await createEmployee(payload);
      setSuccess("Admin account created. Registration is now disabled.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message || "Failed to create admin");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-primary rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      
      <Card className="max-w-md w-full space-y-8 p-10 bg-white/80 backdrop-blur-md shadow-2xl border border-white z-10 relative rounded-2xl">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">
            Initial Setup
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            Create the primary administrator account
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        {!setupEnabled && !success && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-md">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">Admin already exists. Registration disabled.</p>
              </div>
            </div>
          </div>
        )}

        {!success && setupEnabled && (
          <form className="mt-8 space-y-6" onSubmit={onSubmit}>
            <div className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
              />
              
              <Input
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@company.com"
              />

              <Input
                label="Cell Number"
                type="text"
                required
                value={cellNumber}
                onChange={(e) => setCellNumber(e.target.value)}
                placeholder="+1 234 567 890"
              />

              <Input
                label="Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
              />

              <Input
                label="Confirm Password"
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm your password"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 text-base shadow-md mt-6"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Complete Setup"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
