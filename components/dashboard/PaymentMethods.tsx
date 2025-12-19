"use client";

import { useState } from "react";
import { PaymentMethod } from "@/lib/storage/payment-methods-supabase";
import { CreditCard, Plus, Trash2, Star, StarOff, Edit2, X, Check } from "lucide-react";

interface PaymentMethodsProps {
  paymentMethods: PaymentMethod[];
  onRefresh: () => void | Promise<void>;
}

export default function PaymentMethods({ paymentMethods, onRefresh }: PaymentMethodsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "card" as "card" | "bank_account" | "other",
    lastFour: "",
    brand: "",
    expiryDate: "",
    isDefault: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      alert("Please enter a payment method name");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add payment method");
      }

      setIsAdding(false);
      setFormData({
        name: "",
        type: "card",
        lastFour: "",
        brand: "",
        expiryDate: "",
        isDefault: false,
      });
      await onRefresh();
    } catch (error) {
      console.error("Error adding payment method:", error);
      alert(error instanceof Error ? error.message : "Failed to add payment method");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.name.trim()) {
      alert("Please enter a payment method name");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/payment-methods/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update payment method");
      }

      setEditingId(null);
      setFormData({
        name: "",
        type: "card",
        lastFour: "",
        brand: "",
        expiryDate: "",
        isDefault: false,
      });
      await onRefresh();
    } catch (error) {
      console.error("Error updating payment method:", error);
      alert(error instanceof Error ? error.message : "Failed to update payment method");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment method?")) {
      return;
    }

    try {
      const response = await fetch(`/api/payment-methods/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete payment method");
      }

      await onRefresh();
    } catch (error) {
      console.error("Error deleting payment method:", error);
      alert(error instanceof Error ? error.message : "Failed to delete payment method");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch(`/api/payment-methods/${id}/default`, {
        method: "PATCH",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to set default payment method");
      }

      await onRefresh();
    } catch (error) {
      console.error("Error setting default payment method:", error);
      alert(error instanceof Error ? error.message : "Failed to set default payment method");
    }
  };

  const startEdit = (method: PaymentMethod) => {
    setEditingId(method.id);
    setFormData({
      name: method.name,
      type: method.type,
      lastFour: method.lastFour || "",
      brand: method.brand || "",
      expiryDate: method.expiryDate || "",
      isDefault: method.isDefault,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({
      name: "",
      type: "card",
      lastFour: "",
      brand: "",
      expiryDate: "",
      isDefault: false,
    });
  };

  const getCardIcon = (brand?: string) => {
    const brandLower = brand?.toLowerCase() || "";
    if (brandLower.includes("visa")) return "💳";
    if (brandLower.includes("mastercard") || brandLower.includes("master")) return "💳";
    return "💳";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Payment Method
          </button>
        )}
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., My Visa Card"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="card">Card</option>
                <option value="bank_account">Bank Account</option>
                <option value="other">Other</option>
              </select>
            </div>

            {formData.type === "card" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last 4 Digits
                    </label>
                    <input
                      type="text"
                      value={formData.lastFour}
                      onChange={(e) => setFormData({ ...formData, lastFour: e.target.value })}
                      placeholder="1234"
                      maxLength={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry (MM/YY)
                    </label>
                    <input
                      type="text"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      placeholder="12/25"
                      maxLength={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Visa, Mastercard, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            )}

            {formData.type === "bank_account" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last 4 Digits
                </label>
                <input
                  type="text"
                  value={formData.lastFour}
                  onChange={(e) => setFormData({ ...formData, lastFour: e.target.value })}
                  placeholder="1234"
                  maxLength={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                Set as default payment method
              </label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Adding..." : "Add Payment Method"}
              </button>
              <button
                onClick={cancelEdit}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Methods List */}
      {paymentMethods.length === 0 && !isAdding ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            No payment methods saved
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Add a payment method to make checkout faster
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            >
              {editingId === method.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Method Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  {method.type === "card" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last 4 Digits
                        </label>
                        <input
                          type="text"
                          value={formData.lastFour}
                          onChange={(e) => setFormData({ ...formData, lastFour: e.target.value })}
                          maxLength={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry (MM/YY)
                        </label>
                        <input
                          type="text"
                          value={formData.expiryDate}
                          onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                          maxLength={5}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`default-${method.id}`}
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`default-${method.id}`} className="ml-2 text-sm text-gray-700">
                      Set as default
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(method.id)}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-2xl">{getCardIcon(method.brand)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{method.name}</h4>
                        {method.isDefault && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        {method.type === "card" && (
                          <>
                            {method.lastFour && (
                              <span>•••• {method.lastFour}</span>
                            )}
                            {method.brand && <span>{method.brand}</span>}
                            {method.expiryDate && <span>Expires {method.expiryDate}</span>}
                          </>
                        )}
                        {method.type === "bank_account" && method.lastFour && (
                          <span>Account •••• {method.lastFour}</span>
                        )}
                        {method.type === "other" && (
                          <span className="capitalize">{method.type}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <button
                        onClick={() => handleSetDefault(method.id)}
                        className="p-2 text-gray-400 hover:text-yellow-600 transition-colors"
                        title="Set as default"
                      >
                        <Star className="w-5 h-5" />
                      </button>
                    )}
                    {method.isDefault && (
                      <div className="p-2 text-yellow-600" title="Default payment method">
                        <Star className="w-5 h-5 fill-current" />
                      </div>
                    )}
                    <button
                      onClick={() => startEdit(method)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(method.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}








