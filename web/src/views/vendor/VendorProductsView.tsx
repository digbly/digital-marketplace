import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  UploadCloud,
  Key,
  Trash2,
  X,
} from 'lucide-react';
import { useMarketplaceStore } from '../../store/marketplaceStore';
import type { Product } from '../../types/marketplace';

export const VendorProductsView: React.FC = () => {
  const { vendorProducts, deleteVendorProduct, updateVendorProduct } = useMarketplaceStore();

  const [activeUploadModal, setActiveUploadModal] = useState<Product | null>(null);
  const [activeLicenseModal, setActiveLicenseModal] = useState<Product | null>(null);

  const [fileName, setFileName] = useState('');
  const [fileVersion, setFileVersion] = useState('1.0.0');
  const [licenseKeysInput, setLicenseKeysInput] = useState('');

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeUploadModal && fileName.trim()) {
      const newFile = {
        id: `file-${Date.now()}`,
        product_id: activeUploadModal.id,
        file_name: fileName.trim(),
        original_name: fileName.trim(),
        file_size: 15400200,
        version: fileVersion,
        is_main: true,
      };
      updateVendorProduct(activeUploadModal.id, {
        files: [...(activeUploadModal.files || []), newFile],
      });
      setActiveUploadModal(null);
      setFileName('');
    }
  };

  const handleLicenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeLicenseModal && licenseKeysInput.trim()) {
      alert(`Imported ${licenseKeysInput.split('\n').filter(Boolean).length} keys into ${activeLicenseModal.name}`);
      setActiveLicenseModal(null);
      setLicenseKeysInput('');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Digital Products Catalog</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your digital files, software licenses, pricing, and versions
          </p>
        </div>

        <Link
          to="/vendor/products/new"
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 flex items-center gap-1.5 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Digital Item</span>
        </Link>
      </div>

      {/* Products Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-700">
              <tr>
                <th className="py-3.5 px-4">Product Asset</th>
                <th className="py-3.5 px-4">Format</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Sales</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {vendorProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-800/50 transition">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.thumbnail_url || ''}
                        alt={product.name}
                        className="w-12 h-12 rounded-xl object-cover bg-slate-800 border border-slate-700 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <Link
                          to={`/products/${product.slug}`}
                          className="font-bold text-white hover:text-purple-400 truncate block max-w-xs"
                        >
                          {product.name}
                        </Link>
                        <span className="text-[11px] text-slate-400">Version {product.version}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {product.product_type.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <span className="font-bold text-emerald-400 text-sm">${product.effective_price.toFixed(2)}</span>
                  </td>

                  <td className="py-4 px-4">
                    <span className="font-semibold text-white">{product.total_sales} units</span>
                  </td>

                  <td className="py-4 px-4">
                    <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {product.status}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setActiveUploadModal(product)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400"
                        title="Upload New File Package"
                      >
                        <UploadCloud className="w-4 h-4" />
                      </button>

                      {product.product_type === 'license_key' && (
                        <button
                          onClick={() => setActiveLicenseModal(product)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400"
                          title="Import License Keys"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (confirm(`Delete product ${product.name}?`)) {
                            deleteVendorProduct(product.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload File Modal */}
      {activeUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Upload File for {activeUploadModal.name}</h3>
              <button onClick={() => setActiveUploadModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Package / File Name</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="e.g. source-code-bundle-v2.zip"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Release Version</label>
                <input
                  type="text"
                  value={fileVersion}
                  onChange={(e) => setFileVersion(e.target.value)}
                  placeholder="e.g. 1.2.0"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center space-y-2">
                <UploadCloud className="w-8 h-8 text-purple-400 mx-auto" />
                <p className="text-xs font-medium text-slate-300">Drag & drop your .zip package here</p>
                <p className="text-[10px] text-slate-500">Stored securely in Private Encrypted Storage</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveUploadModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow"
                >
                  Save & Attach File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import License Keys Modal */}
      {activeLicenseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Import Keys for {activeLicenseModal.name}</h3>
              <button onClick={() => setActiveLicenseModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLicenseSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  License Keys List (One key per line)
                </label>
                <textarea
                  value={licenseKeysInput}
                  onChange={(e) => setLicenseKeysInput(e.target.value)}
                  rows={6}
                  required
                  placeholder="KEY-AAAA-BBBB-CCCC&#10;KEY-DDDD-EEEE-FFFF&#10;KEY-GGGG-HHHH-IIII"
                  className="w-full p-3 font-mono rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveLicenseModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow"
                >
                  Import Keys Pool
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
