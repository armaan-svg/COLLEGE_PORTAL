import { useState } from 'react';
import {
  login,
  signup,
  requestPasswordRecovery,
  updateUser,
  acceptInvite,
} from '@netlify/identity';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Orbit } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { Notice, PageIntro } from '../components/UI';

export default function Auth({
  mode = 'login',
}: {
  mode?: 'login' | 'signup' | 'recover' | 'reset' | 'admin' | 'invite';
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const titles = {
    login: 'Welcome back, stargazer.',
    signup: 'Your journey starts here.',
    recover: 'Back on your trajectory.',
    reset: 'Set a new password.',
    admin: 'Organizer mission control.',
    invite: 'Accept your invitation.',
  };

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    setBusy(true);
    const data = new FormData(event.currentTarget);

    const email = String(data.get('email') ?? '').trim();
    const password = String(data.get('password') ?? '');

    try {
      if (mode === 'recover') {
        await requestPasswordRecovery(email);
        setMessage(
          'If an account exists for this email, a recovery link has been sent.'
        );
      } else if (mode === 'reset') {
        await updateUser({ password });
        await refresh();
        setMessage('Password updated. You can now open your dashboard.');
      } else if (mode === 'invite') {
        const token = new URLSearchParams(location.hash.slice(1)).get(
          'invite_token'
        );
        if (!token) throw new Error('Open the invitation link from your email.');
        await acceptInvite(token, password);
        await refresh();
        navigate('/dashboard');
      } else if (mode === 'signup') {
        const user = await signup(email, password, {
          full_name: String(data.get('name')),
        });
        if (user.confirmedAt) {
          await refresh();
          navigate('/register');
        } else
          setMessage(
            'Account created. Check your email and confirm your account before signing in and registering your team.'
          );
      } else {
        await login(email, password);
        await refresh();
        navigate(
          mode === 'admin' ? '/admin' : location.state?.from ?? '/dashboard'
        );
      }
    } catch {
      setError(
        mode === 'login' || mode === 'admin'
          ? 'Unable to sign in. Check your email, password and email confirmation, then try again.'
          : 'Unable to complete this request. Check the details or request a fresh email link.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page auth-page">
      <div className="auth-art">
        <Orbit size={72} strokeWidth={0.8} />
        <span className="eyebrow">ASTROVERSE / 2026</span>
        <h2>
          Every great mission
          <br />
          starts with a
          <br />
          <em>curious mind.</em>
        </h2>
        <p>14–16 November · Bhimtal, Uttarakhand</p>
      </div>

      <div className="auth-form panel">
        <PageIntro
          eyebrow={
            mode === 'admin'
              ? 'AUTHORIZED ORGANIZERS ONLY'
              : 'YOUR PERSONAL MISSION CONTROL'
          }
          title={titles[mode]}
        />
        {error && <Notice error>{error}</Notice>}
        {message && <Notice>{message}</Notice>}

        <form onSubmit={submit}>
          {mode === 'signup' && (
            <label>
              Full name
              <input
                name="name"
                autoComplete="name"
                required
                minLength={2}
                maxLength={120}
              />
            </label>
          )}

          {!['reset', 'invite'].includes(mode) && (
            <label>
              Email address
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
              />
            </label>
          )}

          {mode !== 'recover' && (
            <label>
              {mode === 'reset' ? 'New password' : 'Password'}
              <input
                type="password"
                name="password"
                autoComplete={
                  ['signup', 'reset', 'invite'].includes(mode)
                    ? 'new-password'
                    : 'current-password'
                }
                required
                minLength={['signup', 'reset', 'invite'].includes(mode) ? 10 : 1}
              />
            </label>
          )}

          {['signup', 'reset', 'invite'].includes(mode) && (
            <p className="fine-print">
              Use at least 10 characters and a unique password.
            </p>
          )}

          <button className="button full-width" disabled={busy}>
            {busy
              ? 'Connecting…'
              : mode === 'signup'
                ? 'Create account'
                : mode === 'recover'
                  ? 'Send recovery email'
                  : ['reset', 'invite'].includes(mode)
                    ? 'Save password'
                    : 'Sign in'}
            <ArrowRight size={17} />
          </button>
        </form>

        {['login', 'admin'].includes(mode) && (
          <Link className="arrow-link" to="/forgot-password">
            Forgot your password?
          </Link>
        )}

        {mode === 'login' && (
          <p>
            New to ASTROVERSE? <Link to="/signup">Create an account</Link>
          </p>
        )}

        {mode === 'signup' && (
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        )}

        {message && mode === 'reset' && (
          <Link className="button" to="/dashboard">
            Open dashboard
          </Link>
        )}

        <p className="auth-security">
          <LockKeyhole size={14} /> Secure authentication with Netlify
          Identity
        </p>
      </div>
    </div>
  );
}
