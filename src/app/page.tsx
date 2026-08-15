import Link from "next/link";
import {
  appointments,
  dashboardAlerts,
  formatTime,
  getPatient,
  labs,
  messages,
  patientName,
} from "@/data/store";
import { StatusBadge } from "@/components/StatusBadge";

export default function DashboardPage() {
  const todayAppts = appointments.filter((a) => a.status !== "Cancelled");
  const unread = messages.filter((m) => m.unread);
  const criticalLabs = labs.filter((l) => l.status === "Critical" || l.flagged);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Meridian</h1>
          <p>
            Your clinical day at Harbor Family Medicine — schedule flow, inbox,
            and results that need attention.
          </p>
        </div>
        <Link className="btn btn-primary" href="/schedule">
          Open schedule
        </Link>
      </div>

      <div className="alert-row">
        {dashboardAlerts.map((alert) => (
          <Link
            key={alert.id}
            href={alert.href}
            className={`alert-tile tone-${alert.tone}`}
          >
            <span className="count">{alert.count}</span>
            <span className="label">{alert.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid-2">
        <section className="panel">
          <div className="panel-head">
            <h2>Today&apos;s schedule</h2>
            <Link className="btn btn-ghost" href="/schedule">
              View all
            </Link>
          </div>
          <div className="panel-body">
            <div className="schedule-board">
              {todayAppts.slice(0, 5).map((appt, i) => {
                const patient = getPatient(appt.patientId);
                if (!patient) return null;
                return (
                  <Link
                    key={appt.id}
                    href={`/patients/${patient.id}`}
                    className="appt"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="appt-time">{appt.time}</div>
                    <div>
                      <div className="appt-title">{patientName(patient)}</div>
                      <div className="appt-meta">
                        {appt.reason} · {appt.provider}
                        {appt.room ? ` · ${appt.room}` : ""}
                      </div>
                    </div>
                    <StatusBadge status={appt.status} />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <div style={{ display: "grid", gap: "1rem" }}>
          <section className="panel">
            <div className="panel-head">
              <h2>Priority inbox</h2>
              <Link className="btn btn-ghost" href="/messages">
                Messages
              </Link>
            </div>
            <div className="panel-body">
              {unread.map((msg) => (
                <div key={msg.id} className="list-row">
                  <div>
                    <div className="strong">{msg.subject}</div>
                    <div className="muted" style={{ fontSize: "0.86rem" }}>
                      {msg.from} · {formatTime(msg.receivedAt)}
                    </div>
                  </div>
                  <StatusBadge status={msg.priority} />
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2>Labs needing review</h2>
              <Link className="btn btn-ghost" href="/labs">
                Lab queue
              </Link>
            </div>
            <div className="panel-body">
              {criticalLabs.slice(0, 3).map((lab) => {
                const patient = getPatient(lab.patientId);
                return (
                  <div key={lab.id} className="list-row">
                    <div>
                      <div className="strong">
                        {lab.testName}
                        {patient ? ` · ${patientName(patient)}` : ""}
                      </div>
                      <div className="muted" style={{ fontSize: "0.86rem" }}>
                        {lab.resultSummary}
                      </div>
                    </div>
                    <StatusBadge status={lab.status} />
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
