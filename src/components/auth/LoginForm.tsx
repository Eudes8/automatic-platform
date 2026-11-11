"use client";

import { useState } from "react";
import { Loader2, ArrowLeft, KeyRound } from "lucide-react";
import { authClient } from "@/lib/auth-client";

type ResetStep = "idle" | "awaiting-code";

export default function LoginForm({ justCreated = false }: { justCreated?: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [resetStep, setResetStep] = useState<ResetStep>("idle");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await authClient.signIn.email({ email, password });

    if (error) {
      setMessage(error.message || "Échec de connexion. Vérifiez vos identifiants.");
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setMessage("Saisissez d'abord votre adresse e-mail.");
      return;
    }
    setLoading(true);
    setMessage("");

    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "forget-password",
    });

    if (error) {
      setMessage(error.message || "Impossible d'envoyer le code de réinitialisation.");
    } else {
      setResetStep("awaiting-code");
    }
    setLoading(false);
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await authClient.emailOtp.resetPassword({
      email,
      otp,
      password: newPassword,
    });

    if (error) {
      setMessage(error.message || "Code invalide ou expiré.");
      setLoading(false);
      return;
    }

    setResetSuccess(true);
    setResetStep("idle");
    setOtp("");
    setNewPassword("");
    setLoading(false);
  };

  if (resetStep === "awaiting-code") {
    return (
      <form onSubmit={handleResetPassword} className="space-y-5">
        <button
          type="button"
          onClick={() => {
            setResetStep("idle");
            setMessage("");
          }}
          className="inline-flex items-center gap-1.5 text-[13px] text-secondary hover:text-foreground"
        >
          <ArrowLeft size={14} aria-hidden="true" /> Revenir à la connexion
        </button>

        <p className="text-[14px] text-secondary">
          Un code à 6 chiffres a été envoyé à <span className="font-medium text-foreground">{email}</span>.
        </p>

        <div className="space-y-1.5">
          <label htmlFor="otp" className="block text-[13px] font-medium text-foreground">
            Code de sécurité
          </label>
          <input
            id="otp"
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            maxLength={6}
            placeholder="123456"
            className="field numeric text-center text-lg tracking-[0.4em]"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="new-password" className="block text-[13px] font-medium text-foreground">
            Nouveau mot de passe
          </label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="8 caractères minimum"
            className="field"
          />
        </div>

        {message && <Feedback kind="error">{message}</Feedback>}

        <button type="submit" disabled={loading} className="btn btn-primary w-full h-12">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
          Définir le mot de passe
        </button>
      </form>
    );
  }

  return (
    <>
      {justCreated && !resetSuccess && (
        <div className="mb-5 rounded-[10px] border border-ok/25 bg-ok/5 px-4 py-3 text-[13px] text-ok">
          Votre compte est créé. Connectez-vous pour accéder à votre espace.
        </div>
      )}

      {resetSuccess && (
        <div className="mb-5 rounded-[10px] border border-ok/25 bg-ok/5 px-4 py-3 text-[13px] text-ok">
          Mot de passe mis à jour. Vous pouvez vous connecter.
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-[13px] font-medium text-foreground">
            Adresse e-mail
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            placeholder="vous@entreprise.com"
            className="field"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-[13px] font-medium text-foreground">
              Mot de passe
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-[12px] font-medium text-accent hover:underline"
            >
              Mot de passe oublié ?
            </button>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
            placeholder="Votre mot de passe"
            className="field"
          />
        </div>

        {message && <Feedback kind="error">{message}</Feedback>}

        <button type="submit" disabled={loading} className="btn btn-primary h-12 w-full">
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          Se connecter
        </button>
      </form>
    </>
  );
}

function Feedback({ kind, children }: { kind: "error"; children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className={`rounded-[10px] border px-4 py-3 text-[13px] ${
        kind === "error" ? "border-danger/25 bg-danger/5 text-danger" : ""
      }`}
    >
      {children}
    </p>
  );
}
