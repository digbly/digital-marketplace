import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  UploadCloud,
  Key,
  Trash2,
  X,
  Loader2,
  Package,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  useGetVendorProductsQuery,
  useDeleteVendorProductMutation,
  useUploadProductFileMutation,
  useImportProductLicenseKeysMutation,
} from '../../store/services/vendorApi';
import type { Product } from '../../types/marketplace';

export const VendorProductsView: React.FC = () => {
  const { data: response, isLoading } = useGetVendorProductsQuery();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteVendorProductMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadProductFileMutation();
  const [importLicenseKeys, { isLoading: isImporting }] = useImportProductLicenseKeysMutation();

  const products = response?.data || [];

  const [activeUploadModal, setActiveUploadModal] = useState<Product | null>(null);
  const [activeLicenseModal, setActiveLicenseModal] = useState<Product | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileVersion, setFileVersion] = useState('1.0.0');
  const [licenseKeysInput, setLicenseKeysInput] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!fileName) {
        setFileName(file.name);
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUploadModal) return;

    if (!selectedFile) {
      showNotification('error', 'Please select a file to upload (.zip / package).');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('file_name', fileName.trim() || selectedFile.name || 'asset.zip');
      formData.append('version', fileVersion.trim() || '1.0.0');
      formData.append('is_main', '1');

      await uploadFile({
        productId: activeUploadModal.id,
        formData,
      }).unwrap();

      showNotification('success', `File attached successfully to ${activeUploadModal.name}!`);
      setActiveUploadModal(null);
      setSelectedFile(null);
      setFileName('');
    } catch {
      showNotification('error', 'Failed to upload asset file. Please try again.');
    }
  };

  const handleLicenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLicenseModal) return;

    const keys = licenseKeysInput
      .split('\n')
      .map((k) => k.trim())
      .filter(Boolean);

    if (keys.length === 0) {
      showNotification('error', 'Please enter at least one license key.');
      return;
    }

    try {
      const result = await importLicenseKeys({
        productId: activeLicenseModal.id,
        keys,
      }).unwrap();

      showNotification(
        'success',
        result.data?.message || `Successfully imported ${keys.length} license keys into ${activeLicenseModal.name}!`
      );
      setActiveLicenseModal(null);
      setLicenseKeysInput('');
    } catch {
      showNotification('error', 'Failed to import license keys.');
    }
  };

  const handleDelete = async (product: Product) => {
    if (confirm(`Are you sure you want to delete product "${product.name}"?`)) {
      try {
        await deleteProduct(product.id).unwrap();
        showNotification('success', `Product "${product.name}" deleted successfully.`);
      } catch {
        showNotification('error', 'Failed to delete product.');
      }
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

      {notification && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-2.5 text-xs font-semibold ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Products Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
            <span>Loading products catalog...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center space-y-3 px-4">
            <Package className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-white">No products found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven't listed any digital products yet. Start uploading templates, scripts, or license keys.
            </p>
            <Link
              to="/vendor/products/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create First Product</span>
            </Link>
          </div>
        ) : (
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
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {product.thumbnail_url ? (
                          <img
                            src={product.thumbnail_url}
                            alt={product.name}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-800 border border-slate-700 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-purple-900/30 border border-purple-500/20 flex items-center justify-center text-purple-300 font-bold flex-shrink-0">
                            <Package className="w-6 h-6" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link
                            to={`/products/${product.slug}`}
                            className="font-bold text-white hover:text-purple-400 truncate block max-w-xs"
                          >
                            {product.name}
                          </Link>
                          <span className="text-[11px] text-slate-400">
                            Version {product.version || '1.0.0'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {product.product_type?.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-bold text-emerald-400 text-sm">
                        ${(product.sale_price || product.price || 0).toFixed(2)}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-semibold text-white">{product.total_sales || 0} units</span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          product.status === 'published'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {product.status || 'Published'}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setActiveUploadModal(product);
                            setFileName('');
                            setSelectedFile(null);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 transition"
                          title="Upload New File Package"
                        >
                          <UploadCloud className="w-4 h-4" />
                        </button>

                        {product.product_type === 'license_key' && (
                          <button
                            onClick={() => {
                              setActiveLicenseModal(product);
                              setLicenseKeysInput('');
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition"
                            title="Import License Keys"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(product)}
                          disabled={isDeleting}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 transition disabled:opacity-50"
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
        )}
      </div>

      {/* Upload File Modal */}
      {activeUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                Upload File for {activeUploadModal.name}
              </h3>
              <button
                onClick={() => setActiveUploadModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Package / File Name
                </label>
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
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Release Version
                </label>
                <input
                  type="text"
                  value={fileVersion}
                  onChange={(e) => setFileVersion(e.target.value)}
                  placeholder="e.g. 1.2.0"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Select File from Computer
                </label>
                <div className="border-2 border-dashed border-slate-700 hover:border-purple-500/50 rounded-2xl p-4 text-center space-y-2 relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <UploadCloud className="w-8 h-8 text-purple-400 mx-auto" />
                  <p className="text-xs font-medium text-slate-300">
                    {selectedFile ? selectedFile.name : 'Click or drop .zip / asset file here'}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Stored securely in Private Encrypted Storage
                  </p>
                </div>
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
                  disabled={isUploading}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-xs font-semibold text-white shadow flex items-center gap-1.5"
                >
                  {isUploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save & Attach File</span>
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
              <h3 className="text-base font-bold text-white">
                Import Keys for {activeLicenseModal.name}
              </h3>
              <button
                onClick={() => setActiveLicenseModal(null)}
                className="text-slate-400 hover:text-white"
              >
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
                  disabled={isImporting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-xs font-semibold text-white shadow flex items-center gap-1.5"
                >
                  {isImporting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Import Keys Pool</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
