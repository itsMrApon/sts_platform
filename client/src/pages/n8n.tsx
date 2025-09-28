import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useTenant } from "@/hooks/use-tenant";

export default function N8NPage() {
	const n8nUrl = "http://localhost:5678";
	const { currentTenant } = useTenant();
	const { toast } = useToast();
	const [panelOpen, setPanelOpen] = useState(false);
	const [panelTitle, setPanelTitle] = useState<string>("Execution Status");
	const [panelBody, setPanelBody] = useState<string>("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	type Action = { label: string; payload: Record<string, unknown> };

	const common: Action[] = [
		{ label: "Get Status", payload: { tenant_slug: currentTenant, action: "get-status" } },
	];

	// Fixed three category groups as requested
	const agencySaaS: Action[] = [
		{ label: "CRM Leads Sync", payload: { tenant_slug: "sudotechserve", action: "crm-sync" } },
		{ label: "Client Onboarding", payload: { tenant_slug: "sudotechserve", action: "saas-onboarding" } },
		{ label: "Subscription Billing", payload: { tenant_slug: "sudotechserve", action: "billing-sync" } },
	];

	const ecommerce: Action[] = [
		{ label: "Sync Products", payload: { tenant_slug: "switchtoswag", action: "sync-products" } },
		{ label: "Sync Orders", payload: { tenant_slug: "switchtoswag", action: "sync-orders" } },
		{ label: "Sync Customers", payload: { tenant_slug: "switchtoswag", action: "sync-customers" } },
	];

	const manufacturing: Action[] = [
		{ label: "MRP Sync", payload: { tenant_slug: "strongtermstrategy", action: "mrp-sync" } },
		{ label: "Inventory Sync", payload: { tenant_slug: "strongtermstrategy", action: "inventory-sync" } },
		{ label: "Procurement Sync", payload: { tenant_slug: "strongtermstrategy", action: "procurement-sync" } },
	];

	const sendTest = async (payload: Record<string, unknown>) => {
		setIsSubmitting(true);
		setPanelTitle("Execution Status");
		setPanelBody("");
		try {
			// Standard: try production webhook (active workflow)
			const prod = await fetch(`${n8nUrl}/webhook/automation`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (prod.ok) {
				const text = await prod.text();
				setPanelBody(text);
				setPanelOpen(true);
				toast({ title: "Workflow triggered", description: "Production webhook executed." });
				return;
			}

			// Dev fallback: test URL requires Execute in n8n
			const testResp = await fetch(`${n8nUrl}/webhook-test/automation`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			const testText = await testResp.text();
			setPanelBody(testText);
			setPanelOpen(true);
			if (testResp.ok) {
				toast({ title: "Workflow triggered (test)", description: "Test webhook executed. Activate workflow to use production." });
			} else {
				toast({ title: "Workflow failed", description: "Check n8n logs or activate the workflow.", variant: "destructive" });
			}
		} catch (err: any) {
			setPanelBody(String(err?.message || err));
			setPanelOpen(true);
			toast({ title: "Network error", description: String(err?.message || err), variant: "destructive" });
		} finally {
			setIsSubmitting(false);
		}
	};

	const Row = ({ title, items }: { title: string; items: Action[] }) => (
		<Card>
			<CardContent className="p-4">
				<div className="flex items-center justify-between mb-3">
					<h2 className="text-lg font-semibold">{title}</h2>
				</div>
				<div className="flex flex-wrap gap-2">
					{items.map((t) => (
						<Button key={t.label} onClick={() => sendTest(t.payload)}>
							{t.label}
						</Button>
					))}
				</div>
			</CardContent>
		</Card>
	);

	return (
		<div className="flex h-screen bg-gray-50">
			<Sidebar />
			<div className="flex-1 flex flex-col overflow-hidden">
				<Header />
				<main className="flex-1 overflow-y-auto p-6 space-y-6">
					<Card>
						<CardContent className="p-6 space-y-3">
							<h1 className="text-2xl font-bold">n8n Automations</h1>
							<div className="flex flex-wrap gap-2">
					{common.map((t) => (
						<Button key={t.label} onClick={() => sendTest(t.payload)} disabled={isSubmitting}>
										{t.label}
									</Button>
								))}
								<a href={n8nUrl} target="_blank" rel="noreferrer">
									<Button variant="secondary">Open n8n UI</Button>
								</a>
							</div>
						</CardContent>
					</Card>

					<Row title="Digital Agency & SaaS (SudoTechServe)" items={agencySaaS} />
					<Row title="E‑commerce (SwitchToSwag)" items={ecommerce} />
					<Row title="Manufacturing (StrongTermStrategy)" items={manufacturing} />

					<Card>
						<CardContent className="p-0">
							<iframe title="n8n" src={n8nUrl} className="w-full h-[70vh] border-0" />
						</CardContent>
					</Card>

					<Sheet open={panelOpen} onOpenChange={setPanelOpen}>
						<SheetContent side="right" className="w-[480px]">
							<SheetHeader>
								<SheetTitle>{panelTitle}</SheetTitle>
							</SheetHeader>
							<div className="mt-4">
								<pre className="text-xs whitespace-pre-wrap break-words bg-muted p-3 rounded-md max-h-[70vh] overflow-auto">{panelBody || "No response yet."}</pre>
							</div>
						</SheetContent>
					</Sheet>
				</main>
			</div>
		</div>
	);
}
