import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navbar } from './Navbar';
import { Layers, ShieldCheck, Zap, DownloadCloud, Heart } from 'lucide-react';

export const StorefrontLayout: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/90 border-t border-slate-800 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-white">DigiStore PRO</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('footer.aboutDesc')}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase text-slate-200 tracking-wider mb-3">{t('common.appName')}</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/browse" className="hover:text-indigo-400 transition">{t('nav.browseAssets')}</Link></li>
              <li><Link to="/browse" className="hover:text-indigo-400 transition">{t('nav.categories')}</Link></li>
              <li><Link to="/browse" className="hover:text-indigo-400 transition">{t('nav.trending')}</Link></li>
              <li><Link to="/buyer/library" className="hover:text-indigo-400 transition">{t('nav.myPurchases')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase text-slate-200 tracking-wider mb-3">{t('nav.vendorPortal')}</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/vendor" className="hover:text-indigo-400 transition">{t('nav.vendorPortal')}</Link></li>
              <li><Link to="/vendor/wallet" className="hover:text-indigo-400 transition">Earnings & Payouts</Link></li>
              <li><Link to="/vendor/products/new" className="hover:text-indigo-400 transition">Submit New Asset</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase text-slate-200 tracking-wider mb-3">{t('footer.legal')}</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{t('storefront.verifiedCreators')}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Zap className="w-4 h-4 text-indigo-400" />
                <span>{t('storefront.instantDownload')}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <DownloadCloud className="w-4 h-4 text-blue-400" />
                <span>{t('storefront.buyerProtection')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 DigiStore Multi-Vendor E-Commerce. {t('footer.allRightsReserved')}</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Engineered with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for Digital Creators & Developers
          </p>
        </div>
      </footer>
    </div>
  );
};
