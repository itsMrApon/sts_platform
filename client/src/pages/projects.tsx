import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";

export default function ProjectsPage() {
	return (
		<div className="flex h-screen bg-gray-50">
			<Sidebar />
			<div className="flex-1 flex flex-col overflow-hidden">
				<Header />
				<main className="flex-1 overflow-y-auto p-6">
					<Card>
						<CardContent className="p-6">
							<h1 className="text-2xl font-bold mb-2">Projects</h1>
							<p className="text-muted-foreground">This is a placeholder Projects page.</p>
						</CardContent>
					</Card>
				</main>
			</div>
		</div>
	);
}
