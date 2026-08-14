import { useState } from "react";
import { formatWhen } from "../lib/format";
import { useShop } from "../store";

export function MessagesPage() {
  const messages = useShop((s) => s.messages);
  const customers = useShop((s) => s.customers);
  const sendMessage = useShop((s) => s.sendMessage);
  const receiveMessage = useShop((s) => s.receiveMessage);
  const sendEstimate = useShop((s) => s.sendEstimate);
  const ros = useShop((s) => s.repairOrders);
  const [body, setBody] = useState("Your Goose estimate is ready — tap to approve.");
  const pending = ros.find((ro) => ro.status === "requires_auth" || ro.status === "pending_auth");

  return (
    <div className="mx-auto max-w-2xl">
      <p className="font-accent text-xs font-bold uppercase tracking-wider text-goose">Two-way SMS / email</p>
      <h1 className="mb-4 text-4xl font-extrabold">Customer thread</h1>
      <div className="mb-4 space-y-2 rounded-2xl bg-white p-4 shadow-card">
        {messages.slice().sort((a, b) => a.at.localeCompare(b.at)).map((msg) => {
          const customer = customers.find((c) => c.id === msg.customerId);
          return (
            <div key={msg.id} className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${msg.direction === "out" ? "ml-auto bg-navy text-white" : "bg-mist"}`}>
              <p className="text-[11px] opacity-70">{customer?.name} · {msg.channel} · {formatWhen(msg.at)}</p>
              <p>{msg.body}</p>
            </div>
          );
        })}
      </div>
      {pending && (
        <div className="flex flex-wrap gap-2">
          <input className="min-w-[200px] flex-1 rounded-lg border border-navy/10 px-3 py-2" value={body} onChange={(e) => setBody(e.target.value)} />
          <button className="rounded-lg bg-goose px-3 py-2 font-bold text-white" type="button" onClick={() => { sendEstimate(pending.id, "sms"); sendMessage(pending.customerId, pending.id, "sms", body); }}>Text estimate</button>
          <button className="rounded-lg bg-navy px-3 py-2 font-bold text-white" type="button" onClick={() => sendEstimate(pending.id, "email")}>Email estimate</button>
          <button className="rounded-lg border border-navy/15 px-3 py-2 font-semibold" type="button" onClick={() => receiveMessage(pending.customerId, pending.id, "sms", "Got it — do the safety items.")}>Simulate inbound SMS</button>
        </div>
      )}
    </div>
  );
}
