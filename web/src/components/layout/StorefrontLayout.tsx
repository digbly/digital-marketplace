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
              <span className="text-base font-bold text-white">{t('common.appName')}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('footer.aboutDesc')}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase text-slate-200 tracking-wider mb-3">{t('footer.marketplace')}</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/browse" className="hover:text-indigo-400 transition">{t('nav.browseAssets')}</Link></li>
              <li><Link to="/browse" className="hover:text-indigo-400 transition">{t('footer.templatesThemes')}</Link></li>
              <li><Link to="/browse" className="hover:text-indigo-400 transition">{t('footer.sourceCodeBoilerplates')}</Link></li>
              <li><Link to="/browse" className="hover:text-indigo-400 transition">{t('footer.softwareLicenses')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase text-slate-200 tracking-wider mb-3">{t('footer.forCreators')}</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/vendor" className="hover:text-indigo-400 transition">{t('footer.becomeVendor')}</Link></li>
              <li><Link to="/vendor" className="hover:text-indigo-400 transition">{t('footer.vendorDashboard')}</Link></li>
              <li><Link to="/vendor/wallet" className="hover:text-indigo-400 transition">{t('footer.earningsPayouts')}</Link></li>
              <li><Link to="/vendor/products/new" className="hover:text-indigo-400 transition">{t('footer.submitAsset')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase text-slate-200 tracking-wider mb-3">{t('footer.trustSecurity')}</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{t('footer.verifiedFiles')}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Zap className="w-4 h-4 text-indigo-400" />
                <span>{t('footer.instantKeyGen')}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <DownloadCloud className="w-4 h-4 text-blue-400" />
                <span>{t('footer.lifetimeAccess')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>{t('footer.copyright', { year: 2026 })}</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            {t('footer.engineeredWith')} <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> {t('footer.forCreatorsAndDevs')}
          </p>
        </div>
      </footer>
    </div>
  );
};
