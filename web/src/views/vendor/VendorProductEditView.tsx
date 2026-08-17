import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
} from 'lucide-react';
import { useMarketplaceStore } from '../../store/marketplaceStore';
import type { ProductType } from '../../types/marketplace';

export const VendorProductEditView: React.FC = () => {
  const navigate = useNavigate();
  const { categories, addVendorProduct } = useMarketplaceStore();

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [productType, setProductType] = useState<ProductType>('downloadable_file');
  const [price, setPrice] = useState<number>(49.00);
  const [salePrice, setSalePrice] = useState<number | undefined>(undefined);
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [thumbnailUrl, setThumbnailUrl] = useState('https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600');
  const [demoUrl, setDemoUrl] = useState('');
  const [fileName, setFileName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addVendorProduct({
      name,
      category_id: categoryId,
      product_type: productType,
      price: Number(price),
      sale_price: salePrice ? Number(salePrice) : undefined,
      short_description: shortDesc,
      description,
      version,
      thumbnail_url: thumbnailUrl,
      demo_url: demoUrl || undefined,
      files: fileName
        ? [
            {
              id: `file-${Date.now()}`,
              product_id: '',
              file_name: fileName,
              original_name: fileName,
              file_size: 14500100,
              version,
              is_main: true,
            },
          ]
        : [],
    });

    navigate('/vendor/products');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Link to="/vendor/products" className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-white">Upload New Digital Asset</h1>
          <p className="text-xs text-slate-400">List your source code, design kit, or software license</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase text-slate-300 tracking-wider">Product Essentials</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1">Asset Title *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Next.js 15 Full-Stack E-Commerce Template"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Digital Format *</label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="downloadable_file">Downloadable File (.zip / .fig)</option>
                <option value="license_key">Software License Key</option>
                <option value="bundle">Bundle Package</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Short Tagline Summary *</label>
            <input
              type="text"
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              placeholder="1-2 sentences highlighting value proposition"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Full Description & Documentation</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Detailed overview, tech stack, installation instructions..."
              className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Pricing & Licensing */}
        <div className="pt-6 border-t border-slate-800 space-y-4">
          <h3 className="text-sm font-bold uppercase text-slate-300 tracking-wider">Pricing & Release</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Standard Price ($) *</label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-bold focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Sale Price ($) (Optional)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={salePrice || ''}
                onChange={(e) => setSalePrice(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 29.00"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Version</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="1.0.0"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Media & Deliverables */}
        <div className="pt-6 border-t border-slate-800 space-y-4">
          <h3 className="text-sm font-bold uppercase text-slate-300 tracking-wider">Visuals & Deliverables</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Cover Image URL</label>
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Live Demo URL</label>
              <input
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://demo.yoursite.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Main Digital Package (.zip)</label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="e.g. source-code-bundle-v1.zip"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-6 border-t border-slate-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/vendor/products')}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20"
          >
            Publish Digital Product
          </button>
        </div>
      </form>
    </div>
  );
};
