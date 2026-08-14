import { formatWhen } from "../lib/format";
import { useShop } from "../store";

export function MarketingPage() {
  const campaigns = useShop((s) => s.campaigns);
  const customers = useShop((s) => s.customers);
  const ros = useShop((s) => s.repairOrders);
  const sendCampaign = useShop((s) => s.sendCampaign);
  const posted = ros.find((ro) => ro.status === "posted");
  const declined = ros.find((ro) => ro.jobs.some((j) => j.authorized === false));

  return (
    <div>
      <p className="font-accent text-xs font-bold uppercase tracking-wider text-goose">Retention</p>
      <h1 className="mb-4 text-4xl font-extrabold">Reviews & reminders</h1>
      <div className="mb-6 flex flex-wrap gap-2">
        {posted && <button className="rounded-lg bg-goose px-4 py-2 font-bold text-white" type="button" onClick={() => sendCampaign("review", posted.customerId, posted.id)}>Send Google review request</button>}
        <button className="rounded-lg bg-navy px-4 py-2 font-bold text-white" type="button" onClick={() => sendCampaign("reminder", customers[0].id)}>Send service reminder</button>
        {declined && <button className="rounded-lg border border-navy/15 px-4 py-2 font-bold" type="button" onClick={() => sendCampaign("declined_followup", declined.customerId, declined.id)}>Follow up declined jobs</button>}
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-card">
        {campaigns.slice().reverse().map((c) => (
          <p key={c.id} className="border-b border-navy/5 py-2 text-sm">
            <span className="font-semibold">{c.type.replace("_", " ")}</span> · {customers.find((x) => x.id === c.customerId)?.name} · {c.status} · {formatWhen(c.sentAt)}
          </p>
        ))}
      </div>
    </div>
  );
}
