import React, { useState } from 'react';
import { useHomeOs } from '../../context/HomeOsContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import AIInsightCard from '../../components/ui/AIInsightCard';
import {
  Wrench,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Wind,
  Refrigerator,
  Flame,
  Droplets,
  Activity,
  Calendar,
  RotateCw,
  Power,
  ShieldCheck,
  ChevronRight,
  Trash2
} from 'lucide-react';

export default function ApplianceMaintenancePage() {
  const {
    appliances,
    addAppliance,
    updateApplianceStatus,
    logApplianceService,
    deleteAppliance
  } = useHomeOs();

  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [serviceModalApp, setServiceModalApp] = useState(null);
  const [deleteModalApp, setDeleteModalApp] = useState(null);

  const handleDeleteAppliance = async () => {
    if (!deleteModalApp) return;

    try {
      await deleteAppliance(deleteModalApp.id);
      setDeleteModalApp(null);
    } catch (error) {
      // The context handles the error toast. Keep the confirmation modal open
      // so the user can see that the delete did not complete.
    }
  };

  // Add Appliance Form
  const [formState, setFormState] = useState({
    name: '',
    type: 'Cooling & HVAC',
    purchaseDate: '2025-01-15',
    lastService: 'Recently serviced',
    nextService: 'In 6 Months',
    location: 'Main Living Area',
    notes: 'Regular periodic inspection'
  });

  const [formError, setFormError] = useState('');

  const handleAddApplianceSubmit = (e) => {
    e.preventDefault();
    if (!formState.name.trim()) {
      setFormError('Please provide an appliance name');
      return;
    }

    addAppliance({
      name: formState.name,
      type: formState.type,
      lastService: formState.lastService,
      nextService: formState.nextService,
      location: formState.location,
      notes: formState.notes,
      status: 'Running'
    });

    setFormState({
      name: '',
      type: 'Cooling & HVAC',
      purchaseDate: '2025-01-15',
      lastService: 'Recently serviced',
      nextService: 'In 6 Months',
      location: 'Main Living Area',
      notes: 'Regular periodic inspection'
    });
    setFormError('');
    setIsAddModalOpen(false);
  };

  // Counts
  const totalCount = appliances.length;
  const runningCount = appliances.filter(a => a.status === 'Running').length;
  const idleCount = appliances.filter(a => a.status === 'Idle').length;
  const needsServiceCount = appliances.filter(a => a.status === 'Needs Service').length;

  // Filtered Appliances
  const filteredAppliances = appliances.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === 'All' || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Helper for icons
  const getApplianceIcon = (type, name) => {
    const lower = (type + ' ' + name).toLowerCase();
    if (lower.includes('ac') || lower.includes('conditioner') || lower.includes('cooling')) return Wind;
    if (lower.includes('refrigerator') || lower.includes('fridge')) return Refrigerator;
    if (lower.includes('wash') || lower.includes('laundry')) return RotateCw;
    if (lower.includes('purifier') || lower.includes('water')) return Droplets;
    if (lower.includes('heat') || lower.includes('oven')) return Flame;
    return Wrench;
  };

  return (
    <div className="space-y-7 animate-fadeIn">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#241D1A] tracking-tight font-sans">
            Appliance Maintenance
          </h2>
          <p className="text-sm text-[#716963] mt-1">
            Keep your household appliances healthy and running smoothly.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          icon={Plus}
          className="shadow-homeos-sm"
        >
          Add Appliance
        </Button>
      </div>

      {/* 2. Summary Counters (4 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card padding="normal" className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#716963]">
            Total Appliances
          </span>
          <div className="text-2xl font-black text-[#241D1A] tracking-tight">
            {totalCount}
          </div>
          <p className="text-[11px] text-[#9A908A]">Registered devices</p>
        </Card>

        <Card padding="normal" className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#4FA77B]">
            Running
          </span>
          <div className="text-2xl font-black text-[#4FA77B] tracking-tight">
            {runningCount}
          </div>
          <p className="text-[11px] text-[#4FA77B]">Active & operational</p>
        </Card>

        <Card padding="normal" className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#716963]">
            Idle
          </span>
          <div className="text-2xl font-black text-[#716963] tracking-tight">
            {idleCount}
          </div>
          <p className="text-[11px] text-[#9A908A]">Standby / Off-cycle</p>
        </Card>

        <Card padding="normal" className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#D95C5C]">
            Needs Service
          </span>
          <div className="text-2xl font-black text-[#D95C5C] tracking-tight">
            {needsServiceCount}
          </div>
          <p className="text-[11px] text-[#D95C5C]">Action required</p>
        </Card>
      </div>

      {/* 3. AI Maintenance Insight */}
      <AIInsightCard
        title="HomeOS Intelligence"
        badge="Maintenance Alert"
        description="Your AC maintenance is approaching. Schedule a service before the recommended date. CoolBreeze technicians recommend inspecting compressor coils before seasonal high-heat loads."
        recommendation="Recommended maintenance target: Due in 5 days (23 Sep 2026)"
        actionText="Schedule AC Service"
        onAction={() => {
          const ac = appliances.find(a => a.name.includes('Air'));
          if (ac) setServiceModalApp(ac);
        }}
      />

      {/* 4. Filter and Search Bar */}
      <Card padding="normal" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#9A908A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search appliance by name, room or type..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] focus:outline-none focus:ring-2 focus:ring-[#F4D8CC] focus:border-[#C96243] text-[#241D1A] placeholder:text-[#9A908A]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {['All', 'Running', 'Idle', 'Needs Service'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filterStatus === status
                  ? 'bg-[#C96243] text-white font-bold'
                  : 'bg-[#FBF7F3] border border-[#E8DDD6] text-[#716963] hover:text-[#241D1A]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </Card>

      {/* 5. Appliance Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAppliances.map((app) => {
          const Icon = getApplianceIcon(app.type, app.name);
          const isUrgent = app.status === 'Needs Service';
          const isRunning = app.status === 'Running';

          return (
            <div
              key={app.id}
              className={`p-5 rounded-2xl bg-white border transition-all duration-200 hover:-translate-y-0.5 shadow-homeos-sm flex flex-col justify-between ${
                isUrgent ? 'border-[#F4D8CC] hover:border-[#D95C5C]/60' : 'border-[#E8DDD6] hover:border-[#C96243]/50'
              }`}
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold ${
                    isUrgent
                      ? 'bg-[#FBE6E6] text-[#D95C5C] border border-[#D95C5C]/30'
                      : 'bg-[#F8E7E0] text-[#C96243] border border-[#F4D8CC]'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={isUrgent ? 'service' : isRunning ? 'running' : 'idle'}
                      dot
                      size="sm"
                    >
                      {app.status}
                    </Badge>
                  </div>
                </div>

                <h4 className="text-base font-bold text-[#241D1A] font-sans">
                  {app.name}
                </h4>
                <p className="text-xs text-[#716963] mb-3">
                  {app.type} • {app.location}
                </p>

                {/* Health indicator */}
                <div className="space-y-1 mb-4">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#716963]">Operational Health</span>
                    <span className={`font-mono font-bold ${
                      app.healthPercent < 70 ? 'text-[#D95C5C]' : 'text-[#4FA77B]'
                    }`}>
                      {app.healthPercent}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#FBF7F3] overflow-hidden border border-[#E8DDD6]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        app.healthPercent < 70 ? 'bg-[#D95C5C]' : 'bg-[#4FA77B]'
                      }`}
                      style={{ width: `${app.healthPercent}%` }}
                    />
                  </div>
                </div>

                {/* Service Details */}
                <div className="p-3 rounded-xl bg-[#FFF9F6] border border-[#E8DDD6] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#716963]">Last Service:</span>
                    <span className="text-[#241D1A] font-medium">{app.lastService}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#716963]">Next Scheduled:</span>
                    <span className={`font-bold ${isUrgent ? 'text-[#D95C5C]' : 'text-[#241D1A]'}`}>
                      {app.nextService}
                    </span>
                  </div>
                  <div className="pt-1 border-t border-[#E8DDD6] text-[11px] text-[#9A908A]">
                    {app.maintenanceSchedule}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-[#E8DDD6] flex items-center justify-between gap-2">
                {/* Quick Toggle Running / Idle */}
                <button
                  onClick={() => updateApplianceStatus(app.id, app.status === 'Running' ? 'Idle' : 'Running')}
                  className="px-2.5 py-1.5 text-[11px] font-semibold text-[#716963] hover:text-[#241D1A] bg-[#FBF7F3] hover:bg-white rounded-lg transition-colors flex items-center gap-1.5 border border-[#E8DDD6] cursor-pointer"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>Toggle Power</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setServiceModalApp(app)}
                    className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 shadow-homeos-sm cursor-pointer ${
                      isUrgent
                        ? 'bg-[#D95C5C] hover:bg-[#C54F4F] text-white'
                        : 'bg-[#C96243] hover:bg-[#AE4F35] text-white'
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Log Service</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteModalApp(app)}
                    title={`Delete ${app.name}`}
                    aria-label={`Delete ${app.name}`}
                    className="p-1.5 rounded-lg border border-[#E8DDD6] bg-[#FBF7F3] text-[#D95C5C] hover:bg-[#FBE6E6] hover:border-[#D95C5C]/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Appliance Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Appliance"
        subtitle="Add a household appliance to intelligent maintenance monitoring"
      >
        <form onSubmit={handleAddApplianceSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-[#FBE6E6] border border-[#D95C5C]/30 text-xs text-[#D95C5C]">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#241D1A] mb-1.5">
              Appliance Name *
            </label>
            <input
              type="text"
              required
              value={formState.name}
              onChange={(e) => setFormState({ ...formState, name: e.target.value })}
              placeholder="e.g. Living Room AC, Kitchen Refrigerator"
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] focus:outline-none focus:ring-2 focus:ring-[#F4D8CC] focus:border-[#C96243] text-[#241D1A] placeholder:text-[#9A908A]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#241D1A] mb-1.5">
                Type
              </label>
              <select
                value={formState.type}
                onChange={(e) => setFormState({ ...formState, type: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] focus:outline-none focus:border-[#C96243] text-[#241D1A]"
              >
                <option value="Cooling & HVAC">Cooling & HVAC</option>
                <option value="Kitchen Storage">Kitchen Storage</option>
                <option value="Laundry Care">Laundry Care</option>
                <option value="Thermal / Heating">Thermal / Heating</option>
                <option value="Kitchen Appliance">Kitchen Appliance</option>
                <option value="Filtration System">Filtration System</option>
                <option value="Other Household Device">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#241D1A] mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={formState.location}
                onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                placeholder="e.g. Master Bedroom, Balcony"
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] focus:outline-none focus:ring-2 focus:ring-[#F4D8CC] focus:border-[#C96243] text-[#241D1A] placeholder:text-[#9A908A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#241D1A] mb-1.5">
                Purchase Date
              </label>
              <input
                type="date"
                value={formState.purchaseDate}
                onChange={(e) => setFormState({ ...formState, purchaseDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] focus:outline-none text-[#241D1A]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#241D1A] mb-1.5">
                Next Service Target
              </label>
              <input
                type="text"
                value={formState.nextService}
                onChange={(e) => setFormState({ ...formState, nextService: e.target.value })}
                placeholder="In 6 Months"
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] focus:outline-none text-[#241D1A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#241D1A] mb-1.5">
              Maintenance Schedule & Notes
            </label>
            <input
              type="text"
              value={formState.notes}
              onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
              placeholder="e.g. Biannual filter wash, condenser check"
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] focus:outline-none text-[#241D1A] placeholder:text-[#9A908A]"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E8DDD6]">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
            >
              Add Appliance
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Appliance Confirmation Modal */}
      {deleteModalApp && (
        <Modal
          isOpen={Boolean(deleteModalApp)}
          onClose={() => setDeleteModalApp(null)}
          title="Delete Appliance"
          subtitle="This will permanently remove the appliance from maintenance monitoring."
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#FBE6E6] border border-[#D95C5C]/30">
              <p className="text-sm font-semibold text-[#241D1A]">
                Are you sure you want to delete <span className="text-[#D95C5C]">{deleteModalApp.name}</span>?
              </p>
              <p className="mt-1 text-xs text-[#716963]">
                This action cannot be undone. The appliance will be removed from your household data.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E8DDD6]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeleteModalApp(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDeleteAppliance}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Delete Appliance
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Log Service Modal */}
      {serviceModalApp && (
        <Modal
          isOpen={Boolean(serviceModalApp)}
          onClose={() => setServiceModalApp(null)}
          title={`Log Service: ${serviceModalApp.name}`}
          subtitle="Record technician inspection, parts replacement, and reset maintenance urgency"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#FFF9F6] border border-[#E8DDD6] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#716963]">Appliance:</span>
                <span className="font-bold text-[#241D1A]">{serviceModalApp.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#716963]">Location:</span>
                <span className="text-[#241D1A]">{serviceModalApp.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#716963]">Recommended Routine:</span>
                <span className="text-[#4FA77B] font-medium">{serviceModalApp.maintenanceSchedule}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#241D1A] mb-1.5">
                  Service Provider / Technician
                </label>
                <input
                  type="text"
                  defaultValue="Authorized Brand Service Partner"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] text-[#241D1A] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#241D1A] mb-1.5">
                  Service Notes
                </label>
                <input
                  type="text"
                  defaultValue="Completed routine maintenance, parts inspected and certified functional"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBF7F3] border border-[#E8DDD6] text-[#241D1A] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E8DDD6]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setServiceModalApp(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  logApplianceService(serviceModalApp.id);
                  setServiceModalApp(null);
                }}
              >
                Mark as Serviced
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
