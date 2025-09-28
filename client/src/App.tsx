import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import OrdersPage from "@/pages/orders";
import ProductsPage from "@/pages/products";
import ProjectsPage from "@/pages/projects";
import CustomersPage from "@/pages/customers";
import IntegrationsPage from "@/pages/integrations";
import N8NPage from "@/pages/n8n";

function Router() {
	return (
		<Switch>
			<Route path="/" component={Dashboard} />
			<Route path="/dashboard" component={Dashboard} />
			<Route path="/orders" component={OrdersPage} />
			<Route path="/products" component={ProductsPage} />
			<Route path="/projects" component={ProjectsPage} />
			<Route path="/customers" component={CustomersPage} />
			<Route path="/integrations" component={IntegrationsPage} />
			<Route path="/n8n" component={N8NPage} />
			{/* Fallback to 404 */}
			<Route component={NotFound} />
		</Switch>
	);
}

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<TooltipProvider>
				<Toaster />
				<Router />
			</TooltipProvider>
		</QueryClientProvider>
	);
}

export default App;
