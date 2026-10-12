import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Download,
  Search,
  Users,
  CheckCircle2,
  Clock,
  Shield,
  ArrowUpRight,
  Trash2,
} from 'lucide-react';
import { api, type Registration, type Settings } from '../lib/api';
import { ButtonLink, Notice, PageIntro } from '../components/UI';
import EditTeam from '../components/EditTeam';

function exportCsv(records: Registration[]) {
  const escape = (input: string) => {
    const value = /^[=+\-@\t\r]/.test(input) ? `'${input}` : input;
    return `"${value.replaceAll('"', '""')}"`;
  };

  const rows = [
    [
      'Registration ID',
      'Team',
      'Institution',
      'Category',
      'Status',
      'Participant',
      'Role',
      'Email',
      'Mobile',
    ],
    ...records.flatMap((record) =>
      record.members.map((member) => [
        record.reference,
        record.teamName,
        member.institution,
        record.category,
        record.status,
        member.name,
        member.role,
        member.email,
        member.mobile,
      ])
    ),
  ];

  const url = URL.createObjectURL(
    new Blob(
      [
        '\uFEFF' +
          rows
            .map((row) => row.map(escape).join(','))
            .join('\r\n'),
      ],
      { type: 'text/csv;charset=utf-8;' }
    )
  );

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `astroverse-registrations-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Admin() {
  const [records, setRecords] = useState<Registration[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [selected, setSelected] = useState<Registration | null>(null);
  const [busy, setBusy] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const location = useLocation();

  const section = location.pathname.split('/')[2] ?? '';

  async function refresh() {
    setLoading(true);
    setError('');
    try {
      const [data, config] = await Promise.all([
        api<Registration[]>('admin/registrations'),
        api<Settings>('config'),
      ]);
      setRecords(data);
      setSettings(config);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const visible = records.filter(
    (record) =>
      (!status || record.status === status) &&
      (!category || record.category === category) &&
      JSON.stringify(record)
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  async function changeStatus(
    record: Registration,
    value: Registration['status']
  ) {
    setBusy(true);
    setError('');
    try {
      await api(`admin/registrations/${record.reference}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: value }),
      });
      setRecords((current) =>
        current.map((item) =>
          item.id === record.id ? { ...item, status: value } : item
        )
      );
      if (selected?.id === record.id) setSelected({ ...record, status: value });
      setMessage(`${record.reference} marked ${value}.`);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteRecord() {
    if (!selected) return;
    setBusy(true);
    try {
      await api(`admin/registrations/${selected.reference}`, {
        method: 'DELETE',
      });
      setRecords((current) =>
        current.filter((record) => record.id !== selected.id)
      );
      setSelected(null);
      setDeleteConfirmation(false);
      setMessage('Rejected registration and linked participant records deleted.');
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      const result = await api<Settings>('admin/config', {
        method: 'PATCH',
        body: JSON.stringify({
          minMembers: Number(data.get('minMembers')),
          maxMembers: Number(data.get('maxMembers')),
          registrationOpen: data.get('open') === 'on' ? 1 : 0,
        }),
      });
      setSettings(result);
      setMessage('Event registration settings saved.');
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page admin-page">
      <PageIntro
        eyebrow="AUTHORIZED ORGANIZER AREA"
        title="Mission control."
      >
        Live event registrations. Authorized actions. A clear view of the crew.
      </PageIntro>

      <nav className="admin-tabs" aria-label="Administration">
        <Link className={!section ? 'active' : ''} to="/admin">
          Overview
        </Link>
        <Link className={section === 'participants' ? 'active' : ''} to="/admin/participants">
          Participants
        </Link>
        <Link className={section === 'teams' ? 'active' : ''} to="/admin/teams">
          Teams
        </Link>
        <Link className={section === 'reports' ? 'active' : ''} to="/admin/reports">
          Reports
        </Link>
        <Link className={section === 'settings' ? 'active' : ''} to="/admin/settings">
          Settings
        </Link>
        <Link to="/verify">
          QR lookup <ArrowUpRight size={13} />
        </Link>
      </nav>

      {error && <Notice error>{error}</Notice>}
      {message && <Notice>{message}</Notice>}

      {loading ? (
        <div className="panel loading-state">Retrieving live event data…</div>
      ) : !settings ? (
        <div className="panel">
          <h2>Event data is not available yet.</h2>
          <p>No statistics can be shown until the database responds.</p>
          <button className="button button-secondary" onClick={() => void refresh()}>
            Retry connection
          </button>
        </div>
      ) : section === 'settings' ? (
        settings && (
          <form className="panel settings-form" onSubmit={saveSettings}>
            <h2>Registration controls</h2>
            <Notice>
              Open registration only after confirming eligibility, the
              free-participation policy, team rules, guardian consent,
              privacy/retention policy and the event's official status.
            </Notice>
            <div className="form-grid">
              <label>
                Minimum team members
                <input
                  name="minMembers"
                  type="number"
                  min="1"
                  max="20"
                  defaultValue={settings.minMembers}
                  required
                />
              </label>
              <label>
                Maximum team members
                <input
                  name="maxMembers"
                  type="number"
                  min="1"
                  max="20"
                  defaultValue={settings.maxMembers}
                  required
                />
              </label>
            </div>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="open"
                defaultChecked={!!settings.registrationOpen}
              />
              <span>
                I confirm the event policies and authorize opening
                registration.
              </span>
            </label>
            <button className="button" disabled={busy}>
              Save settings
            </button>
            <p className="fine-print">
              These changes are recorded in the audit table. Existing
              registrations are not retroactively invalidated by changed team
              limits.
            </p>
          </form>
        )
      ) : (
        <>
          {/* Stats Section */}
          <div className="admin-stats">
            {[
              { label: 'Registrations / teams', value: records.length, icon: Users },
              {
                label: 'Participants',
                value: records.reduce((total, record) => total + record.members.length, 0),
                icon: Users,
              },
              {
                label: 'Pending',
                value: records.filter((record) => record.status === 'pending').length,
                icon: Clock,
              },
              {
                label: 'Approved',
                value: records.filter((record) => record.status === 'approved').length,
                icon: CheckCircle2,
              },
              {
                label: 'Rejected',
                value: records.filter((record) => record.status === 'rejected').length,
                icon: Shield,
              },
            ].map((stat) => (
              <div className="panel stat-card" key={stat.label}>
                <stat.icon size={20} />
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </div>

          {/* Reports Section */}
          {section === 'reports' && (
            <div className="panel">
              <h2>Category breakdown</h2>
              <p>
                School:{' '}
                {records.filter((record) => record.category === 'school').length}{' '}
                teams
              </p>
              <p>
                College:{' '}
                {records.filter((record) => record.category === 'college').length}{' '}
                teams
              </p>
              <p className="fine-print">
                CSV exports contain personal contact details. Download only for
                authorized event administration and delete according to your
                approved retention policy.
              </p>
            </div>
          )}

          {/* Registrations Table */}
          <section className="panel">
            <div className="heading-row">
              <h2>
                {section === 'participants' ? 'Participants' : 'Team registrations'}
              </h2>
              <button
                className="button button-secondary"
                disabled={!visible.length}
                onClick={() => exportCsv(visible)}
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>

            <div className="admin-filters">
              <label className="search-input">
                <Search size={16} />
                <input
                  aria-label="Search by ID, team, participant, email, mobile or institution"
                  placeholder="Search teams, names, email, mobile, ID…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <select
                aria-label="Filter by status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                aria-label="Filter by category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="">All categories</option>
                <option value="school">School</option>
                <option value="college">College</option>
              </select>
            </div>

            {!visible.length ? (
              <div className="empty-state">
                <Users size={34} />
                <h3>
                  {records.length ? 'No matches found.' : 'No registrations yet.'}
                </h3>
                <p>
                  {records.length
                    ? 'Try another search or filter.'
                    : 'Real registrations appear here after participants submit their teams.'}
                </p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Registration</th>
                      <th>
                        {section === 'participants' ? 'Participant' : 'Team'}
                      </th>
                      <th>Institution</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Manage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.flatMap((record) =>
                      (section === 'participants' ? record.members : [null]).map(
                        (member, index) => (
                          <tr key={`${record.id}-${index}`}>
                            <td>{record.reference}</td>
                            <td>
                              {member?.name ?? record.teamName}
                              {member && <small>{member.email}</small>}
                            </td>
                            <td>{member?.institution ?? record.institution}</td>
                            <td>{record.category}</td>
                            <td>
                              <span className={`status ${record.status}`}>
                                {record.status}
                              </span>
                            </td>
                            <td>
                              <button
                                className="text-button"
                                onClick={() => {
                                  setSelected(record);
                                  setDeleteConfirmation(false);
                                }}
                              >
                                Details <ArrowUpRight size={14} />
                              </button>
                            </td>
                          </tr>
                        )
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
            <p className="fine-print">
              {visible.length} of {records.length} teams · All values are from
              saved database records.
            </p>
          </section>

          {/* Detail View */}
          {selected && (
            <section className="panel admin-detail">
              <div className="heading-row">
                <div>
                  <span className="eyebrow">{selected.reference}</span>
                  <h2>{selected.teamName}</h2>
                </div>
                <button
                  className="button button-secondary"
                  onClick={() => setSelected(null)}
                >
                  Close details
                </button>
              </div>
              <p>
                {selected.institution} · {selected.category} category
              </p>
              {selected.mentor && <p>Mentor: {selected.mentor}</p>}

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Email</th>
                      <th>Mobile</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.members.map((member) => (
                      <tr key={member.id}>
                        <td>{member.name}</td>
                        <td>{member.role}</td>
                        <td>{member.email}</td>
                        <td>{member.mobile}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <EditTeam
                key={selected.id}
                record={selected}
                onSave={(updated) => {
                  setSelected(updated);
                  setRecords((current) =>
                    current.map((record) =>
                      record.id === updated.id ? updated : record
                    )
                  );
                }}
              />

              <div className="admin-detail-actions">
                <button
                  className="button"
                  disabled={busy}
                  onClick={() => void changeStatus(selected, 'approved')}
                >
                  Approve
                </button>
                <button
                  className="button button-secondary"
                  disabled={busy}
                  onClick={() => void changeStatus(selected, 'pending')}
                >
                  Mark pending
                </button>
                <button
                  className="button button-danger"
                  disabled={busy}
                  onClick={() => void changeStatus(selected, 'rejected')}
                >
                  Reject
                </button>
                <ButtonLink secondary to={`/verify/${selected.reference}`}>
                  Verify
                </ButtonLink>
                {selected.status === 'rejected' && (
                  <button
                    className="button button-danger"
                    disabled={busy}
                    onClick={() => setDeleteConfirmation(true)}
                  >
                    <Trash2 size={15} />
                    Delete rejected record
                  </button>
                )}
              </div>

              {deleteConfirmation && (
                <Notice>
                  <p>
                    This permanently deletes the rejected team and its members.
                    An audit record is retained.
                  </p>
                  <button
                    className="button button-danger"
                    disabled={busy}
                    onClick={() => void deleteRecord()}
                  >
                    Confirm permanent deletion
                  </button>
                  <button
                    className="button button-secondary"
                    onClick={() => setDeleteConfirmation(false)}
                  >
                    Cancel
                  </button>
                </Notice>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
