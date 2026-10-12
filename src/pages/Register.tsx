import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { api, type Settings } from '../lib/api';
import { registrationSchema, type Member } from '../lib/validation';
import { ButtonLink, Notice, PageIntro } from '../components/UI';

const emptyMember = (
  role: 'leader' | 'member' = 'member',
  email = ''
): Member => ({
  name: '',
  email,
  mobile: '',
  institution: '',
  role,
});

export default function Register() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [settings, setSettings] = useState<Settings | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [members, setMembers] = useState<Member[]>([
    emptyMember('leader'),
    emptyMember(),
    emptyMember(),
    emptyMember(),
  ]);
  const [category, setCategory] = useState(
    params.get('category') === 'school' ? 'school' : 'college'
  );

  useEffect(() => {
    api<Settings>('config')
      .then(setSettings)
      .catch((error) => setError(error.message));
  }, []);

  useEffect(() => {
    if (user)
      setMembers((current) =>
        current.map((member, index) =>
          index === 0 ? { ...member, email: user.email ?? '' } : member
        )
      );
  }, [user?.id]);

  function updateMember(index: number, field: keyof Member, value: string) {
    setMembers((current) =>
      current.map((member, position) =>
        position === index ? { ...member, [field]: value } : member
      )
    );
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const data = new FormData(event.currentTarget);
    const institution = String(data.get('institution'));

    const parsed = registrationSchema.safeParse({
      teamName: data.get('teamName'),
      institution,
      category,
      mentor: data.get('mentor'),
      consent: data.get('consent') === 'on',
      members: members.map((member) => ({
        ...member,
        institution: member.institution || institution,
      })),
    });

    if (!parsed.success) {
      setError(parsed.error.issues.map((issue) => issue.message).join(' '));
      return;
    }

    if (
      settings &&
      (members.length < settings.minMembers ||
        members.length > settings.maxMembers)
    ) {
      setError(`Add ${settings.minMembers}–${settings.maxMembers} team members.`);
      return;
    }

    setBusy(true);

    try {
      await api('registration', {
        method: 'POST',
        body: JSON.stringify(parsed.data),
      });
      navigate('/dashboard');
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page registration-page">
      <PageIntro
        eyebrow="YOUR IDEAS BELONG HERE"
        title="Assemble your crew."
      >
        One team. Different talents. A shared mission.
      </PageIntro>

      {error && <Notice error>{error}</Notice>}

      {loading ? (
        <Notice>Checking your account…</Notice>
      ) : !user ? (
        <div className="panel">
          <h2>First, create your mission account.</h2>
          <p>
            The team leader needs a confirmed account to securely save and
            manage a registration.
          </p>
          <ButtonLink to="/signup">Create an account</ButtonLink>
          <ButtonLink to="/login" secondary>
            Already registered? Sign in
          </ButtonLink>
        </div>
      ) : !settings ? (
        <Notice>
          {error
            ? 'Registration rules are unavailable. Please refresh this page to reconnect.'
            : 'Loading registration rules…'}
        </Notice>
      ) : (
        <>
          <div className="registration-info">
            <span>
              <ShieldCheck size={18} /> Secure team registration
            </span>
            <span>
              {settings.minMembers}–{settings.maxMembers} team members
            </span>
            <span>No payment collected</span>
          </div>

          {!settings.registrationOpen && (
            <Notice>
              Registration has not opened yet. Organizers must confirm category
              eligibility, fees and team rules before enabling submissions. You
              can review the form below.
            </Notice>
          )}

          <form onSubmit={submit}>
            {/* Team Section */}
            <section className="panel">
              <span className="eyebrow">01 / THE TEAM</span>
              <h2>Start with your team.</h2>
              <div className="form-grid">
                <label>
                  Team name
                  <input
                    name="teamName"
                    required
                    minLength={2}
                    maxLength={100}
                  />
                </label>
                <label>
                  Institution / school / college
                  <input
                    name="institution"
                    required
                    minLength={2}
                    maxLength={200}
                  />
                </label>
                <label>
                  Participation category
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value as any)}
                  >
                    <option value="school">School Category</option>
                    <option value="college">College Category</option>
                  </select>
                </label>
                <label>
                  Mentor name <span className="muted">(optional)</span>
                  <input name="mentor" maxLength={120} />
                </label>
              </div>
            </section>

            {/* Crew Section */}
            <section className="panel">
              <div className="heading-row">
                <div>
                  <span className="eyebrow">02 / YOUR CREW</span>
                  <h2>Every mind matters.</h2>
                </div>
                <span className="tag">{members.length} MEMBERS</span>
              </div>

              {members.map((member, index) => (
                <fieldset className="member-fields" key={index}>
                  <legend>
                    {index === 0
                      ? 'Team leader'
                      : `Team member ${index + 1}`}
                  </legend>
                  {index > 0 && (
                    <button
                      type="button"
                      className="remove-member icon-button"
                      aria-label={`Remove member ${index + 1}`}
                      onClick={() =>
                        setMembers((current) =>
                          current.filter((_, position) => position !== index)
                        )
                      }
                    >
                      <Trash2 size={17} />
                    </button>
                  )}
                  <div className="form-grid">
                    <label>
                      Full name
                      <input
                        required
                        minLength={2}
                        maxLength={120}
                        autoComplete="off"
                        value={member.name}
                        onChange={(event) =>
                          updateMember(index, 'name', event.target.value)
                        }
                      />
                    </label>
                    <label>
                      Email address
                      <input
                        type="email"
                        required
                        value={member.email}
                        readOnly={index === 0}
                        onChange={(event) =>
                          updateMember(index, 'email', event.target.value)
                        }
                      />
                    </label>
                    <label>
                      Mobile number
                      <input
                        type="tel"
                        required
                        pattern="\+?[1-9][0-9]{7,14}"
                        placeholder="+91…"
                        value={member.mobile}
                        onChange={(event) =>
                          updateMember(index, 'mobile', event.target.value)
                        }
                      />
                    </label>
                    <label>
                      Institution{' '}
                      <span className="muted">(if different from team)</span>
                      <input
                        maxLength={200}
                        value={member.institution}
                        onChange={(event) =>
                          updateMember(index, 'institution', event.target.value)
                        }
                      />
                    </label>
                  </div>
                </fieldset>
              ))}

              <button
                className="button button-secondary"
                type="button"
                disabled={members.length >= settings.maxMembers}
                onClick={() =>
                  setMembers((current) => [...current, emptyMember()])
                }
              >
                <Plus size={16} />
                Add team member
              </button>
            </section>

            {/* Consent Section */}
            <section className="panel">
              <span className="eyebrow">03 / READY FOR LIFTOFF</span>
              <h2>A little responsibility. A big journey.</h2>
              <label className="checkbox-label">
                <input name="consent" type="checkbox" required />
                <span>
                  I confirm the information is accurate, that each member has
                  agreed to the collection of these details for event
                  administration, and that any necessary guardian consent has
                  been obtained. I understand the event rules remain subject to
                  organizer confirmation.
                </span>
              </label>
              <p className="fine-print">
                Names, emails, mobile numbers and institutions are stored
                securely for registration administration. Public QR
                verification shares only the team, institution, category and
                registration status. Organizers must publish a retention policy
                and final minor-consent process before opening registration.
              </p>
              <button
                className="button"
                disabled={busy || !settings.registrationOpen}
              >
                {busy
                  ? 'Saving your registration…'
                  : settings.registrationOpen
                    ? 'Submit team registration'
                    : 'Registration opens after confirmation'}
                <ArrowRight size={17} />
              </button>
            </section>
          </form>
        </>
      )}
    </div>
  );
}
