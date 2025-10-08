import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type TenantType, type TenantConfig } from '@shared/schema';

interface TenantState {
  currentTenant: TenantType;
  setCurrentTenant: (tenant: TenantType) => void;
  getTenantConfig: (tenant: TenantType) => TenantConfig;
}

const tenantConfigs: Record<TenantType, TenantConfig> = {
  superuser: {
    id: 'superuser',
    name: 'Superuser',
    slug: 'superuser',
    description: 'Admin & System Management',
    modules: ['Dashboard', 'Integration Status', 'Shortcuts', 'Reports'],
    color: 'hsl(280 100% 70%)'
  },
  sudotechserve: {
    id: 'sudotechserve',
    name: 'SudoTechServe',
    slug: 'sudotechserve',
    description: 'Agency & SaaS Operations',
    modules: ['Projects', 'Subscriptions', 'Support'],
    color: 'hsl(221.2 83.2% 53.3%)'
  },
  switchtoswag: {
    id: 'switchtoswag',
    name: 'SwitchToSwag',
    slug: 'switchtoswag',
    description: 'E-commerce & Design Studio',
    modules: ['Customers', 'Products', 'Orders', 'n8n', 'Projects', 'Inventory', 'Design Studio'],
    color: 'hsl(142.1 76.2% 36.3%)'
  },
  strongtermstrategy: {
    id: 'strongtermstrategy',
    name: 'StrongTermStrategy',
    slug: 'strongtermstrategy',
    description: 'Procurement & Manufacturing',
    modules: ['Manufacturing', 'Procurement', 'Quality Control', 'FOB Shipments'],
    color: 'hsl(24.6 95% 53.1%)'
  }
};

export const useTenant = create<TenantState>()(
  persist(
    (set, get) => ({
      currentTenant: 'superuser',
      setCurrentTenant: (tenant: TenantType) => set({ currentTenant: tenant }),
      getTenantConfig: (tenant: TenantType) => tenantConfigs[tenant],
    }),
    {
      name: 'tenant-storage',
    }
  )
);
