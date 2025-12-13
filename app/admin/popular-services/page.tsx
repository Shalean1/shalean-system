"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, GripVertical, Save, X } from "lucide-react";
import {
  getAllPopularServices,
  addPopularService,
  updatePopularService,
  deletePopularService,
  reorderPopularServices,
  type PopularService,
} from "@/app/actions/popular-services";

export default function AdminPopularServicesPage() {
  const [services, setServices] = useState<PopularService[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", slug: "", description: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", slug: "", description: "" });
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    setLoading(true);
    const data = await getAllPopularServices();
    setServices(data);
    setLoading(false);
  }

  async function handleAdd() {
    if (!addForm.name.trim() || !addForm.slug.trim()) {
      alert("Please fill in all fields");
      return;
    }

    const result = await addPopularService(addForm.name, addForm.slug);
    
    if (result.success) {
      setAddForm({ name: "", slug: "", description: "" });
      setShowAddForm(false);
      loadServices();
    } else {
      alert(`Error: ${result.error}`);
    }
  }

  function handleEdit(service: PopularService) {
    setEditingId(service.id);
    setEditForm({ name: service.name, slug: service.slug, description: service.description || "" });
  }

  async function handleUpdate() {
    if (!editForm.name.trim() || !editForm.slug.trim()) {
      alert("Please fill in all fields");
      return;
    }

    const result = await updatePopularService(editingId!, {
      name: editForm.name,
      slug: editForm.slug,
      description: editForm.description,
    });

    if (result.success) {
      setEditingId(null);
      setEditForm({ name: "", slug: "", description: "" });
      loadServices();
    } else {
      alert(`Error: ${result.error}`);
    }
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditForm({ name: "", slug: "", description: "" });
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this service?")) {
      return;
    }

    const result = await deletePopularService(id);
    
    if (result.success) {
      loadServices();
    } else {
      alert(`Error: ${result.error}`);
    }
  }

  async function handleToggleActive(service: PopularService) {
    const result = await updatePopularService(service.id, {
      is_active: !service.is_active,
    });

    if (result.success) {
      loadServices();
    } else {
      alert(`Error: ${result.error}`);
    }
  }

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  function handleNameChange(value: string, isEdit: boolean = false) {
    if (isEdit) {
      setEditForm({
        ...editForm,
        name: value,
        slug: generateSlug(value),
      });
    } else {
      setAddForm({
        ...addForm,
        name: value,
        slug: generateSlug(value),
      });
    }
  }

  function handleDragStart(index: number) {
    setDraggedItem(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    
    if (draggedItem === null || draggedItem === index) return;

    const newServices = [...services];
    const draggedService = newServices[draggedItem];
    newServices.splice(draggedItem, 1);
    newServices.splice(index, 0, draggedService);
    
    setServices(newServices);
    setDraggedItem(index);
  }

  async function handleDragEnd() {
    if (draggedItem === null) return;

    // Update display_order for all services
    const reorderedServices = services.map((service, index) => ({
      id: service.id,
      display_order: index + 1,
    }));

    await reorderPopularServices(reorderedServices);
    setDraggedItem(null);
    loadServices();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Manage Popular Services
            </h1>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Service
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-3">Add New Service</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Name
                  </label>
                  <input
                    type="text"
                    value={addForm.name}
                    onChange={(e) => handleNameChange(e.target.value, false)}
                    placeholder="e.g., Holiday Cleaning"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug (auto-generated)
                  </label>
                  <input
                    type="text"
                    value={addForm.slug}
                    onChange={(e) => setAddForm({ ...addForm, slug: e.target.value })}
                    placeholder="e.g., holiday-cleaning"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={addForm.description}
                    onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                    placeholder="e.g., Get your home ready for the holidays with our thorough cleaning service"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setAddForm({ name: "", slug: "", description: "" });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Services List */}
          <div className="space-y-3">
            {services.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No popular services yet. Add one to get started!
              </div>
            ) : (
              services.map((service, index) => (
                <div
                  key={service.id}
                  draggable={editingId !== service.id}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-3 p-4 bg-white border rounded-lg transition-all ${
                    draggedItem === index
                      ? "opacity-50"
                      : "hover:border-blue-300 hover:shadow-md"
                  } ${!service.is_active ? "bg-gray-50" : ""}`}
                >
                  {/* Drag Handle */}
                  <div className="cursor-move text-gray-400 hover:text-gray-600">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Service Info */}
                  <div className="flex-1">
                    {editingId === service.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => handleNameChange(e.target.value, true)}
                          placeholder="Service Name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          value={editForm.slug}
                          onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                          placeholder="service-slug"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          placeholder="Service description"
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold text-gray-900">{service.name}</h3>
                        <p className="text-sm text-gray-500">{service.slug}</p>
                        {service.description && (
                          <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Order Badge */}
                  <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                    #{service.display_order}
                  </div>

                  {/* Active Toggle */}
                  <button
                    onClick={() => handleToggleActive(service)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      service.is_active
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-red-100 text-red-700 hover:bg-red-200"
                    }`}
                  >
                    {service.is_active ? "Active" : "Inactive"}
                  </button>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {editingId === service.id ? (
                      <>
                        <button
                          onClick={handleUpdate}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Save className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(service)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Instructions:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Drag and drop services to reorder them</li>
              <li>• Click the Active/Inactive badge to toggle visibility</li>
              <li>• Edit or delete services using the action buttons</li>
              <li>• Active services will appear on the homepage</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
