import React, { useState } from 'react';
import { useHomeOs } from '../../context/HomeOsContext';
import { api } from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import {
  FolderLock,
  Upload,
  Search,
  Filter,
  User,
  Users,
  FileText,
  ShieldCheck,
  Download,
  Trash2,
  Eye,
  File,
  Sparkles,
  Info,
  CheckCircle2,
  FolderOpen,
  X
} from 'lucide-react';

export default function DocumentVaultPage() {
  const {
    currentUser,
    documentCategories,
    vaultMembers,
    documents,
    uploadDocument,
    deleteDocument,
    addToast
  } = useHomeOs();

  // Safe fallbacks keep the page renderable even if the context is
  // temporarily missing document-specific values during backend loading.
  const safeDocumentCategories = Array.isArray(documentCategories)
    ? documentCategories
    : [
        'Personal Documents',
        'Family Documents',
        'Health Documents',
        'Legal Documents',
        'Certificates'
      ];

  const safeVaultMembers = Array.isArray(vaultMembers) ? vaultMembers : [];

  // Owner options come only from authenticated household data.
  // Always include the current authenticated user as a possible owner.
  const ownerOptions = [
    ...(currentUser?.name
      ? [{
          id: 'current-user',
          name: currentUser.name,
          role: currentUser.role || 'Home Owner',
          avatarBg: 'bg-[#F4D8CC] text-[#C96243]'
        }]
      : []),
    ...safeVaultMembers
  ].filter(
    (member, index, list) =>
      member?.name &&
      list.findIndex(
        (item) => String(item.name).toLowerCase() === String(member.name).toLowerCase()
      ) === index
  );

  const safeDocuments = Array.isArray(documents) ? documents : [];

  const [selectedMember, setSelectedMember] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  // Form State for Upload
  const [newDocForm, setNewDocForm] = useState({
    name: '',
    owner: currentUser?.name || '',
    category: 'Personal Documents',
    format: 'PDF',
    file: null
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploadError('');

    if (!newDocForm.name.trim()) {
      setUploadError('Document name is required');
      return;
    }

    if (!newDocForm.file) {
      setUploadError('Please select a PDF, JPG, or PNG file');
      return;
    }

    const maxFileSize = 25 * 1024 * 1024;
    if (newDocForm.file.size > maxFileSize) {
      setUploadError('File size must be 25MB or less');
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(newDocForm.file.type)) {
      setUploadError('Only PDF, JPG, and PNG files are allowed');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(20);

      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 150);

      await uploadDocument(newDocForm.file, {
        name: newDocForm.name.trim(),
        owner: newDocForm.owner,
        category: newDocForm.category,
        format: newDocForm.file.type === 'application/pdf'
          ? 'PDF'
          : newDocForm.file.type === 'image/png'
            ? 'PNG'
            : 'JPG',
      });

      clearInterval(progressTimer);
      setUploadProgress(100);

      setNewDocForm({
        name: '',
        owner: currentUser?.name || '',
        category: 'Personal Documents',
        format: 'PDF',
        file: null
      });

      setUploadError('');
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setIsUploadModalOpen(false);
      }, 250);
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadError(error.message || 'Failed to upload document');
    }
  };

  const handleDownload = async (doc) => {
    try {
      addToast({
        title: 'Downloading Document',
        message: `Preparing "${doc.name}" for download.`,
        type: 'info'
      });

      await api.downloadDocument(doc.id);

      addToast({
        title: 'Download Complete',
        message: `"${doc.name}" downloaded successfully.`,
        type: 'success'
      });
    } catch (error) {
      console.error('Document download error:', error);
      addToast({
        title: 'Download Failed',
        message: error.message || 'Unable to download document.',
        type: 'error'
      });
    }
  };

  // Filtered documents
  const filteredDocuments = safeDocuments.filter((doc) => {
    const matchesSearch =
      String(doc.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(doc.tags) && doc.tags.some(t => String(t || '').toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesMember =
      selectedMember === 'All' || String(doc.owner || '').toLowerCase() === selectedMember.toLowerCase();
    const matchesCategory =
      selectedCategory === 'All' || doc.category === selectedCategory;
    return matchesSearch && matchesMember && matchesCategory;
  });

  return (
    <div className="space-y-7 animate-fadeIn">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#241D1A] tracking-tight font-display">
            Document Vault
          </h2>
          <p className="text-sm text-[#716963] mt-1">
            Securely organize the important documents your family relies on.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsUploadModalOpen(true)}
          icon={Upload}
        >
          Upload Document
        </Button>
      </div>

      {/* Strict Product Rule Notice: No Bills Here */}
      <div className="p-4 rounded-2xl bg-[#FFF9F6] border border-[#E8DDD6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#716963]">
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 text-[#C96243] shrink-0" />
          <span>
            <strong className="text-[#241D1A]">Strict Organization Rule:</strong> Document Vault is exclusively for personal IDs, family legal deeds, health records, and certificates. Bills belong inside <strong className="text-[#C96243]">Finance Management</strong>.
          </span>
        </div>
        <span className="inline-flex items-center gap-1 font-bold text-[#4FA77B] bg-[#E4F3EB] px-2.5 py-1 rounded-lg border border-[#4FA77B]/20 shrink-0 self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5 text-[#4FA77B]" />
          Zero-Knowledge Vault
        </span>
      </div>

      {/* 2. Family Member Folders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#9A908A]">
            Family Member Folders
          </h3>
          {selectedMember !== 'All' && (
            <button
              onClick={() => setSelectedMember('All')}
              className="text-xs font-bold text-[#C96243] hover:text-[#AE4F35] transition-colors"
            >
              Reset Filter (Show All)
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {safeVaultMembers.map((member) => {
            const isSelected = selectedMember.toLowerCase() === member.name.toLowerCase();
            const count = safeDocuments.filter(d => String(d.owner || '').toLowerCase() === String(member.name || '').toLowerCase()).length;
            return (
              <div
                key={member.id}
                onClick={() => setSelectedMember(isSelected ? 'All' : member.name)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-[#F4D8CC] text-[#241D1A] border-[#C96243] shadow-sm -translate-y-0.5'
                    : 'bg-white hover:border-[#C96243]/30 border-[#E8DDD6] text-[#241D1A] shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${member.avatarBg}`}>
                    {member.name === 'Family' ? <Users className="w-5 h-5 text-[#C96243]" /> : member.name[0]}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-[#C96243] text-white' : 'bg-[#FFF9F6] text-[#716963] border border-[#E8DDD6]'
                  }`}>
                    {count} Files
                  </span>
                </div>
                <h4 className="text-sm font-bold font-display text-[#241D1A]">{member.name}</h4>
                <p className="text-[11px] text-[#716963] truncate mt-0.5">
                  {member.role}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Search and Category Filters */}
      <Card padding="normal" className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#9A908A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents by name or tags (e.g. passport, degree, property)..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#FFF9F6] border border-[#E8DDD6] focus:outline-none focus:ring-2 focus:ring-[#C96243]/20 focus:border-[#C96243] text-[#241D1A] placeholder:text-[#9A908A]"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === 'All'
                  ? 'bg-[#C96243] text-white font-bold shadow-sm'
                  : 'bg-[#FFF9F6] border border-[#E8DDD6] text-[#716963] hover:text-[#241D1A] hover:bg-[#F8E7E0]/50'
              }`}
            >
              All Categories
            </button>
            {documentCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#C96243] text-white font-bold shadow-sm'
                    : 'bg-[#FFF9F6] border border-[#E8DDD6] text-[#716963] hover:text-[#241D1A] hover:bg-[#F8E7E0]/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Active Filter Indicators */}
        {(selectedMember !== 'All' || selectedCategory !== 'All' || searchQuery) && (
          <div className="flex items-center gap-2 pt-2 border-t border-[#E8DDD6] text-xs text-[#716963]">
            <span>Active filters:</span>
            {selectedMember !== 'All' && (
              <span className="inline-flex items-center gap-1 bg-[#FFF9F6] text-[#241D1A] px-2 py-0.5 rounded-md border border-[#E8DDD6]">
                Person: {selectedMember}
                <X className="w-3 h-3 cursor-pointer hover:text-[#D95C5C]" onClick={() => setSelectedMember('All')} />
              </span>
            )}
            {selectedCategory !== 'All' && (
              <span className="inline-flex items-center gap-1 bg-[#FFF9F6] text-[#241D1A] px-2 py-0.5 rounded-md border border-[#E8DDD6]">
                Category: {selectedCategory}
                <X className="w-3 h-3 cursor-pointer hover:text-[#D95C5C]" onClick={() => setSelectedCategory('All')} />
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 bg-[#FFF9F6] text-[#241D1A] px-2 py-0.5 rounded-md border border-[#E8DDD6]">
                Query: "{searchQuery}"
                <X className="w-3 h-3 cursor-pointer hover:text-[#D95C5C]" onClick={() => setSearchQuery('')} />
              </span>
            )}
          </div>
        )}
      </Card>

      {/* 4. Document Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#241D1A] font-display">
            Vault Records ({filteredDocuments.length})
          </h3>
          <span className="text-xs text-[#716963]">
            Secure authenticated storage
          </span>
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white border border-[#E8DDD6] text-center space-y-3 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF9F6] border border-[#E8DDD6] mx-auto flex items-center justify-center text-[#9A908A]">
              <FolderOpen className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-[#241D1A]">No documents found</h4>
            <p className="text-xs text-[#716963] max-w-sm mx-auto">
              No vault files matched your filters. Try clearing your search or upload a new record.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSelectedMember('All');
                setSelectedCategory('All');
                setSearchQuery('');
              }}
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="p-5 rounded-2xl bg-white border border-[#E8DDD6] hover:border-[#C96243]/40 transition-all duration-200 hover:-translate-y-0.5 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF9F6] border border-[#E8DDD6] flex items-center justify-center text-[#C96243] font-bold font-mono text-xs shrink-0">
                      {doc.format}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF9F6] text-[#716963] border border-[#E8DDD6]">
                        {doc.size}
                      </span>
                      <button
                        onClick={() => deleteDocument(doc.id)}
                        className="p-1.5 rounded-lg text-[#9A908A] hover:text-[#D95C5C] hover:bg-[#FBE6E6] transition-colors"
                        title="Delete Document"
                        aria-label="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-[#241D1A] font-display line-clamp-1 mb-1" title={doc.name}>
                    {doc.name}
                  </h4>
                  <p className="text-xs text-[#716963] mb-3">
                    Owner: <span className="text-[#241D1A] font-medium">{doc.owner}</span>
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FFF9F6] text-[#C96243] border border-[#C96243]/20">
                      {doc.category}
                    </span>
                    {doc.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-[#FFF9F6] text-[#716963] border border-[#E8DDD6]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E8DDD6] flex items-center justify-between text-xs">
                  <span className="text-[10px] text-[#9A908A]">Uploaded {doc.uploadDate}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="text-[#716963] hover:text-[#241D1A] flex items-center gap-1 transition-colors"
                      title="Preview Document"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="text-[#C96243] hover:text-[#AE4F35] font-semibold flex items-center gap-1 transition-colors"
                      title="Download Secure Copy"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Upload Document Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Vault New Document"
        subtitle="Encrypt and store identity, deeds, certificates, or health records"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          {uploadError && (
            <div className="p-3 rounded-xl bg-[#FBE6E6] border border-[#D95C5C]/30 text-xs text-[#D95C5C]">
              {uploadError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#241D1A] mb-1.5">
              Document Name *
            </label>
            <input
              type="text"
              required
              value={newDocForm.name}
              onChange={(e) => setNewDocForm({ ...newDocForm, name: e.target.value })}
              placeholder="e.g. Degree Certificate, Passport, Property Deed"
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#FFF9F6] border border-[#E8DDD6] focus:outline-none focus:ring-2 focus:ring-[#C96243]/20 focus:border-[#C96243] text-[#241D1A] placeholder:text-[#9A908A]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#241D1A] mb-1.5">
                Owner / Member
              </label>
              <select
                value={newDocForm.owner}
                onChange={(e) => setNewDocForm({ ...newDocForm, owner: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#FFF9F6] border border-[#E8DDD6] focus:outline-none focus:border-[#C96243] text-[#241D1A]"
              >
                {ownerOptions.length === 0 ? (
                  <option value="">No household members available</option>
                ) : (
                  ownerOptions.map((member) => (
                    <option key={member.id} value={member.name}>
                      {member.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#241D1A] mb-1.5">
                Category
              </label>
              <select
                value={newDocForm.category}
                onChange={(e) => setNewDocForm({ ...newDocForm, category: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#FFF9F6] border border-[#E8DDD6] focus:outline-none focus:border-[#C96243] text-[#241D1A]"
              >
                {safeDocumentCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Visual Drag & Drop Container */}
          <div>
            <label className="block text-xs font-bold text-[#241D1A] mb-1.5">
              Upload File (PDF, JPG, PNG)
            </label>
            <label className="border-2 border-dashed border-[#E8DDD6] hover:border-[#C96243]/50 rounded-2xl p-6 text-center bg-[#FFF9F6] transition-colors cursor-pointer group block">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                className="hidden"
                disabled={isUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;

                  if (!file) {
                    setNewDocForm((prev) => ({ ...prev, file: null }));
                    return;
                  }

                  const maxFileSize = 25 * 1024 * 1024;
                  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];

                  if (!allowedTypes.includes(file.type)) {
                    setUploadError('Only PDF, JPG, and PNG files are allowed');
                    e.target.value = '';
                    return;
                  }

                  if (file.size > maxFileSize) {
                    setUploadError('File size must be 25MB or less');
                    e.target.value = '';
                    return;
                  }

                  const format =
                    file.type === 'application/pdf'
                      ? 'PDF'
                      : file.type === 'image/png'
                        ? 'PNG'
                        : 'JPG';

                  setNewDocForm((prev) => ({
                    ...prev,
                    file,
                    format
                  }));
                  setUploadError('');
                }}
              />

              <Upload className="w-8 h-8 text-[#9A908A] group-hover:text-[#C96243] mx-auto mb-2 transition-colors" />

              <p className="text-xs font-bold text-[#241D1A]">
                {newDocForm.file
                  ? newDocForm.file.name
                  : 'Click to browse or select a file'}
              </p>

              <p className="text-[11px] text-[#716963] mt-1">
                {newDocForm.file
                  ? `${(newDocForm.file.size / (1024 * 1024)).toFixed(2)} MB • ${newDocForm.format}`
                  : 'PDF, JPG, or PNG • Maximum file size: 25MB'}
              </p>

              <p className="text-[10px] text-[#9A908A] mt-2">
                Secure authenticated upload
              </p>
            </label>
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs text-[#716963]">
                <span>Encrypting and uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#E8DDD6] overflow-hidden">
                <div
                  className="h-full bg-[#C96243] rounded-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E8DDD6]">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsUploadModalOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              loading={isUploading}
            >
              Vault Document
            </Button>
          </div>
        </form>
      </Modal>

      {/* 6. Document Preview Modal */}
      {previewDoc && (
        <Modal
          isOpen={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          title={previewDoc.name}
          subtitle={`Owner: ${previewDoc.owner} • Category: ${previewDoc.category}`}
        >
          <div className="space-y-4">
            <div className="p-8 rounded-2xl bg-[#FFF9F6] border border-[#E8DDD6] text-center space-y-3">
              <FileText className="w-16 h-16 text-[#C96243] mx-auto opacity-80" />
              <div>
                <p className="text-sm font-bold text-[#241D1A]">{previewDoc.name}</p>
                <p className="text-xs text-[#716963]">
                  {previewDoc.format} Document • {previewDoc.size} • Verified Valid
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E4F3EB] border border-[#4FA77B]/30 text-[#4FA77B] text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero-Knowledge Decrypted</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#FFF9F6] border border-[#E8DDD6]">
                <span className="text-[10px] text-[#9A908A] block uppercase font-bold">Record Owner</span>
                <span className="font-bold text-[#241D1A]">{previewDoc.owner}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FFF9F6] border border-[#E8DDD6]">
                <span className="text-[10px] text-[#9A908A] block uppercase font-bold">Date Vaulted</span>
                <span className="font-bold text-[#241D1A]">{previewDoc.uploadDate}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8DDD6]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPreviewDoc(null)}
              >
                Close Preview
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  handleDownload(previewDoc);
                  setPreviewDoc(null);
                }}
                icon={Download}
              >
                Download Document
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
