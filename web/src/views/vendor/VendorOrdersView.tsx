import { User as UserIcon } from 'lucide-react';
import { useMarketplaceStore } from '../../store/marketplaceStore';

export const VendorOrdersView: React.FC = () => {
  const { libraryItems } = useMarketplaceStore();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Vendor Customer Sales & Orders</h1>
        <p className="text-xs text-slate-400 mt-1">Real-time log of buyers who purchased your digital products</p>
      </div>

      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-700">
              <tr>
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Product Purchased</th>
                <th className="py-3.5 px-4">Buyer Details</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Net Earning (after 15% fee)</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {libraryItems.map((item) => {
                const commission = Math.round(item.price * 0.15 * 100) / 100;
                const net = item.price - commission;

                return (
                  <tr key={item.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-4 px-4 font-mono text-purple-400 font-bold">{item.order_id}</td>
                    <td className="py-4 px-4 font-bold text-white">{item.product_name}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-300">
                          <UserIcon className="w-3 h-3" />
                        </div>
                        <span>David Nguyen</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold">${item.price.toFixed(2)}</td>
                    <td className="py-4 px-4 font-bold text-emerald-400">${net.toFixed(2)}</td>
                    <td className="py-4 px-4 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Paid & Delivered
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
