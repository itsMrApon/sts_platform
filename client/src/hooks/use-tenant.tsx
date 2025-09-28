import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type TenantType, type TenantConfig } from '@shared/schema';

interface TenantState {
  currentTenant: TenantType;
  setCurrentTenant: (tenant: TenantType) => void;
  getTenantConfig: (tenant: TenantType) => TenantConfig;
}

const tenantConfigs: Record<TenantType, TenantConfig> = {
  sudotechserve: {
    id: 'sudotechserve',
    name: 'SudoTechServe',
    slug: 'sudotechserve',
    description: 'Agency & SaaS Operations',
    modules: ['CRM Pipeline', 'Projects', 'Subscriptions', 'n8n', 'Support'],
    color: 'hsl(221.2 83.2% 53.3%)'
  },
  switchtoswag: {
    id: 'switchtoswag',
    name: 'SwitchToSwag',
    slug: 'switchtoswag',
    description: 'E-commerce & Design Studio',
    modules: ['Products', 'Orders', 'Projects', 'Inventory', 'Design Studio'],
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
      currentTenant: 'sudotechserve',
      setCurrentTenant: (tenant: TenantType) => set({ currentTenant: tenant }),
      getTenantConfig: (tenant: TenantType) => tenantConfigs[tenant],
    }),
    {
      name: 'tenant-storage',
    }
  )
);
