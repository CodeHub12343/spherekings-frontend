/**
 * CouponForm Component
 * Reusable form for creating and editing coupons (admin only)
 *
 * Features:
 * - All backend-supported coupon fields
 * - Client-side validation
 * - Create and Edit modes
 * - Loading state during submission
 * - Mobile-responsive layout
 */

'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';

// ==================== Styled Components ====================

const FormOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const FormCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);

  /* Scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
  }

  @media (max-width: 768px) {
    padding: 20px;
    max-height: 95vh;
  }
`;

const FormHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f3f4f6;

  h2 {
    font-size: 22px;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  color: #6b7280;
  transition: all 0.2s;
  font-family: inherit;

  &:hover {
    background: #f3f4f6;
    color: #1f2937;
  }
`;

const FormGrid = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${(props) => props.$columns || '1fr 1fr'};
  gap: 16px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  .hint {
    font-weight: 400;
    text-transform: none;
    color: #9ca3af;
    letter-spacing: 0;
    margin-left: 4px;
  }
`;

const Input = styled.input`
  padding: 10px 14px;
  border: 2px solid ${(props) => (props.$error ? '#fecaca' : '#e5e7eb')};
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s;
  background: ${(props) => (props.$error ? '#fef2f2' : 'white')};

  &:focus {
    outline: none;
    border-color: #5b4dff;
    box-shadow: 0 0 0 3px rgba(91, 77, 255, 0.1);
  }

  &:disabled {
    background: #f9fafb;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const Select = styled.select`
  padding: 10px 14px;
  border: 2px solid ${(props) => (props.$error ? '#fecaca' : '#e5e7eb')};
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  background: white;
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #5b4dff;
    box-shadow: 0 0 0 3px rgba(91, 77, 255, 0.1);
  }

  &:disabled {
    background: #f9fafb;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  padding: 10px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 60px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #5b4dff;
    box-shadow: 0 0 0 3px rgba(91, 77, 255, 0.1);
  }
`;

const CheckboxRow = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 0;

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #5b4dff;
    cursor: pointer;
  }

  span {
    font-size: 14px;
    color: #374151;
    font-weight: 500;
  }
`;

const ErrorText = styled.span`
  font-size: 12px;
  color: #dc2626;
  font-weight: 500;
`;

const ErrorBanner = styled.div`
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  font-size: 13px;
  color: #dc2626;
  font-weight: 500;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
`;

const CancelButton = styled.button`
  padding: 10px 24px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
`;

const SubmitButton = styled.button`
  padding: 10px 28px;
  background: linear-gradient(135deg, #5b4dff 0%, #4c3fcc 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(91, 77, 255, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Spinner = styled.span`
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// ==================== Default Values ====================

const defaultFormData = {
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: '',
  minimumOrderValue: '',
  maxUses: '',
  maxUsesPerUser: '1',
  isActive: true,
  expiryDate: '',
  appliesTo: 'all',
  salesChannel: '',
};

// ==================== Component ====================

/**
 * CouponForm Component
 *
 * @param {Object} props
 * @param {Object|null} props.coupon - Existing coupon for edit mode (null for create)
 * @param {Function} props.onSubmit - Submit handler: (formData) => Promise<void>
 * @param {Function} props.onClose - Close/cancel handler
 * @param {boolean} props.isSubmitting - External loading state
 * @param {string} props.submitError - External error message
 */
export default function CouponForm({
  coupon = null,
  onSubmit,
  onClose,
  isSubmitting = false,
  submitError = null,
}) {
  const isEditMode = !!coupon;
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});

  // Populate form for edit mode
  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code || '',
        description: coupon.description || '',
        discountType: coupon.discountType || 'percentage',
        discountValue: coupon.discountValue?.toString() || '',
        minimumOrderValue: coupon.minimumOrderValue?.toString() || '0',
        maxUses: coupon.maxUses?.toString() || '0',
        maxUsesPerUser: coupon.maxUsesPerUser?.toString() || '1',
        isActive: coupon.isActive !== false,
        expiryDate: coupon.expiryDate
          ? new Date(coupon.expiryDate).toISOString().slice(0, 16)
          : '',
        appliesTo: coupon.appliesTo || 'all',
        salesChannel: coupon.salesChannel || '',
      });
    }
  }, [coupon]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear field error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Coupon code is required';
    } else if (!/^[A-Za-z0-9_-]+$/.test(formData.code.trim())) {
      newErrors.code = 'Only letters, numbers, underscores, and hyphens allowed';
    }

    if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
      newErrors.discountValue = 'Discount value must be greater than 0';
    }

    if (formData.discountType === 'percentage' && parseFloat(formData.discountValue) > 100) {
      newErrors.discountValue = 'Percentage discount cannot exceed 100%';
    }

    if (formData.expiryDate && new Date(formData.expiryDate) < new Date()) {
      newErrors.expiryDate = 'Expiry date must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      code: formData.code.trim().toUpperCase(),
      description: formData.description.trim(),
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue),
      minimumOrderValue: parseFloat(formData.minimumOrderValue) || 0,
      maxUses: parseInt(formData.maxUses) || 0,
      maxUsesPerUser: parseInt(formData.maxUsesPerUser) || 1,
      isActive: formData.isActive,
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
      appliesTo: formData.appliesTo.trim() || 'all',
      salesChannel: formData.salesChannel.trim(),
    };

    // In edit mode, don't send the code field (it can't be changed)
    if (isEditMode) {
      delete payload.code;
    }

    await onSubmit(payload);
  };

  return (
    <FormOverlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <FormCard>
        <FormHeader>
          <h2>
            🏷️ {isEditMode ? 'Edit Coupon' : 'Create New Coupon'}
          </h2>
          <CloseButton onClick={onClose} type="button">✕</CloseButton>
        </FormHeader>

        <FormGrid onSubmit={handleSubmit}>
          {/* Code + Discount Type */}
          <FormRow>
            <FormField>
              <Label>
                Coupon Code
                {!isEditMode && <span className="hint">(auto-uppercase)</span>}
              </Label>
              <Input
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g. SUMMER25"
                disabled={isEditMode || isSubmitting}
                $error={!!errors.code}
                maxLength={30}
                style={{ textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}
              />
              {errors.code && <ErrorText>{errors.code}</ErrorText>}
            </FormField>

            <FormField>
              <Label>Discount Type</Label>
              <Select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount ($)</option>
              </Select>
            </FormField>
          </FormRow>

          {/* Discount Value + Minimum Order */}
          <FormRow>
            <FormField>
              <Label>
                Discount Value
                <span className="hint">
                  ({formData.discountType === 'percentage' ? '1-100%' : 'USD'})
                </span>
              </Label>
              <Input
                name="discountValue"
                type="number"
                value={formData.discountValue}
                onChange={handleChange}
                placeholder={formData.discountType === 'percentage' ? '15' : '10.00'}
                min="0.01"
                max={formData.discountType === 'percentage' ? '100' : undefined}
                step="0.01"
                disabled={isSubmitting}
                $error={!!errors.discountValue}
              />
              {errors.discountValue && <ErrorText>{errors.discountValue}</ErrorText>}
            </FormField>

            <FormField>
              <Label>Minimum Order Value <span className="hint">(0 = no min)</span></Label>
              <Input
                name="minimumOrderValue"
                type="number"
                value={formData.minimumOrderValue}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
                disabled={isSubmitting}
              />
            </FormField>
          </FormRow>

          {/* Max Uses */}
          <FormRow>
            <FormField>
              <Label>Max Total Uses <span className="hint">(0 = unlimited)</span></Label>
              <Input
                name="maxUses"
                type="number"
                value={formData.maxUses}
                onChange={handleChange}
                placeholder="0"
                min="0"
                disabled={isSubmitting}
              />
            </FormField>

            <FormField>
              <Label>Max Uses Per User <span className="hint">(0 = unlimited)</span></Label>
              <Input
                name="maxUsesPerUser"
                type="number"
                value={formData.maxUsesPerUser}
                onChange={handleChange}
                placeholder="1"
                min="0"
                disabled={isSubmitting}
              />
            </FormField>
          </FormRow>

          {/* Sales Channel + Expiry */}
          <FormRow>
            <FormField>
              <Label>Sales Channel <span className="hint">(tracking)</span></Label>
              <Input
                name="salesChannel"
                value={formData.salesChannel}
                onChange={handleChange}
                placeholder="e.g. facebook, instagram, email"
                disabled={isSubmitting}
              />
            </FormField>

            <FormField>
              <Label>Expiry Date <span className="hint">(optional)</span></Label>
              <Input
                name="expiryDate"
                type="datetime-local"
                value={formData.expiryDate}
                onChange={handleChange}
                disabled={isSubmitting}
                $error={!!errors.expiryDate}
              />
              {errors.expiryDate && <ErrorText>{errors.expiryDate}</ErrorText>}
            </FormField>
          </FormRow>

          {/* Description */}
          <FormField>
            <Label>Description <span className="hint">(internal note)</span></Label>
            <TextArea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="E.g. Summer sale promo for Instagram campaign"
              maxLength={200}
              disabled={isSubmitting}
            />
          </FormField>

          {/* Active Checkbox */}
          <CheckboxRow>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <span>Coupon is active and can be used by customers</span>
          </CheckboxRow>

          {/* Error Banner */}
          {submitError && <ErrorBanner>⚠️ {submitError}</ErrorBanner>}

          {/* Buttons */}
          <ButtonRow>
            <CancelButton type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </CancelButton>
            <SubmitButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner />
                  {isEditMode ? 'Saving...' : 'Creating...'}
                </>
              ) : (
                isEditMode ? 'Save Changes' : 'Create Coupon'
              )}
            </SubmitButton>
          </ButtonRow>
        </FormGrid>
      </FormCard>
    </FormOverlay>
  );
}
