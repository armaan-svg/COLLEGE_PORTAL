import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { CalendarDays, Download, MapPin, Printer, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { api, type Registration } from '../lib/api';
import { ButtonLink, Notice, PageIntro } from '../components/UI';

function IdCard({
  registration,
  memberId,
}: {
  registration: Registration;
  memberId: number | null;
}) {
  const leader =
    registration.members.find((member) => member.id === memberId) ??
    registration.members.find((member) => member.role === 'leader');

  return (
    <article className="id-card">
      <div className="id-card-top">
        <img src="/img/event-mark.png" alt="Supplied event logo" />
        <span>
          NASA INTERNATIONAL
          <br />
          SPACE APPS CHALLENGE 2026
        </span>
      </div>
      <span className="id-local-brand">ASTROVERSE</span>
      <div className="id-card-body">
        <div>
          <span className="eyebrow">EVENT PARTICIPANT</span>
          <h2>{leader?.name}</h2>
          <h3>{registration.teamName}</h3>
          <p>{registration.institution}</p>
          <span className={`status ${registration.status}`}>
            {registration.status}
          </span>
        </div>
        <QRCodeSVG
          value={`${window.location.origin}/verify/${registration.reference}`}
          size={116}
          bgColor="#ffffff"
          fgColor="#101021"
          marginSize={2}
        />
      </div>
      <div className="id-card-footer">
        <strong>{registration.reference}</strong>
        <p>14–16 NOVEMBER 2026</p>
        <small>
          Birla Institute of Applied Sciences · Bhimtal, Uttarakhand
        </small>
      </div>
      <p className="id-disclaimer">
        Local event registration ID · Not an official NASA credential
      </p>
    </article>
  );
}

export default function Dashboard({
  cardOnly = false,
  detailsOnly = false,
}: {
  cardOnly?: boolean;
  detailsOnly?: boolean;
}) {
  const { user } = useAuth();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [memberId, setMemberId] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Registration | null>('registration')
      .then(setRegistration)
      .catch((error) => setError(error.message))
      .finally(() => setLoading(false));
  }, []);

  const pageTitle = cardOnly
    ? 'Your digital ID card.'
    : detailsOnly
      ? 'Your registration details.'
      : user?.name
        ? `Welcome aboard, ${user.name.split(' ')[0]}.`
        : 'Welcome aboard.';

  return (
    <div className="page dashboard-page">
      <PageIntro
        eyebrow="YOUR PERSONAL MISSION CONTROL"
        title={pageTitle}
      >
        {cardOnly
          ? 'Print or save as PDF using your browser\'s print dialog.'
          : 'Your real registration. Your team. Your next frontier.'}
      </PageIntro>

      {error && <Notice error>{error}</Notice>}

      {loading ? (
        <div className="panel loading-state">Retrieving your registration…</div>
      ) : !registration ? (
        !error && (
          <div className="panel">
            <h2>Your mission is waiting.</h2>
            <p>No team registration is linked to this account yet.</p>
            <ButtonLink to="/register">Register a team</ButtonLink>
          </div>
        )
      ) : (
        <>
          {!cardOnly && (
            <>
              <div className="dashboard-stats">
                <div className="panel">
                  <span className="micro-label">REGISTRATION ID</span>
                  <h3>{registration.reference}</h3>
                </div>
                <div className="panel">
                  <span className="micro-label">STATUS</span>
                  <span className={`status ${registration.status}`}>
                    {registration.status}
                  </span>
                </div>
                <div className="panel">
                  <span className="micro-label">CATEGORY</span>
                  <h3>{registration.category} category</h3>
                </div>
              </div>

              <section className="panel">
                <div className="heading-row">
                  <div>
                    <span className="eyebrow">YOUR TEAM</span>
                    <h2>{registration.teamName}</h2>
                    <p>{registration.institution}</p>
                  </div>
                  <span className="tag">{registration.members.length} MEMBERS</span>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Participant</th>
                        <th>Role</th>
                        <th>Email</th>
                        <th>Institution</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registration.members.map((member) => (
                        <tr key={member.id}>
                          <td>{member.name}</td>
                          <td>{member.role}</td>
                          <td>{member.email}</td>
                          <td>{member.institution}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {registration.mentor && <p>Mentor: {registration.mentor}</p>}
                <p className="fine-print">
                  Updates are handled by authorized organizers. Contact
                  instructions are awaiting confirmation.
                </p>
              </section>

              <div className="panel dashboard-event">
                <span>
                  <CalendarDays />
                  14–16 November 2026
                </span>
                <span>
                  <MapPin />
                  Birla Institute of Applied Sciences, Bhimtal
                </span>
              </div>
            </>
          )}

          {!detailsOnly && (
            <section className="id-section">
              <IdCard registration={registration} memberId={memberId} />
              <div className="id-actions">
                <label className="id-member-select">
                  Participant on card
                  <select
                    value={
                      memberId ??
                      registration.members.find((member) => member.role === 'leader')
                        ?.id ??
                      ''
                    }
                    onChange={(event) => setMemberId(Number(event.target.value))}
                  >
                    {registration.members.map((member) => (
                      <option value={member.id} key={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button className="button" onClick={() => window.print()}>
                  <Printer size={17} />
                  Print / save as PDF
                </button>
                <ButtonLink secondary to={`/verify/${registration.reference}`}>
                  Verify registration
                </ButtonLink>
                {!cardOnly && (
                  <Link to="/id-card" className="arrow-link">
                    Open digital ID card <ArrowUpRight size={17} />
                  </Link>
                )}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
