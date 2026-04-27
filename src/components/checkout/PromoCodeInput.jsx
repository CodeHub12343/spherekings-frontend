/**
 * PromoCodeInput Component
 * Allows customers to enter and validate a promo/coupon code during checkout
 *
 * Features:
 * - Collapsible "Have a promo code?" section
 * - Input field with "Apply" button
 * - Loading state during validation
 * - Success state with discount badge and "Remove" option
 * - Error state with clear error message
 * - Mobile-responsive design
 */

'use client';

import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useValidateCoupon } from '@/hooks/useCoupons';

// ==================== Animations ====================

const slideDown = keyframes`
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    max-height: 300px;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

// ==================== Styled Components ====================

const Container = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    border-color: #d1d5db;
  }
`;

const ToggleButton = styled.button`
  width: 100%;
  padding: 16px 20px;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 600;
  color: #5b4dff;
  font-family: inherit;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f7ff;
  }

  .icon {
    font-size: 16px;
    transition: transform 0.3s ease;
    transform: ${(props) => (props.$expanded ? 'rotate(180deg)' : 'rotate(0)')};
  }

  .label {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const ContentArea = styled.div`
  padding: 0 20px 20px;
  animation: ${slideDown} 0.3s ease forwards;
`;

const InputRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: stretch;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const CodeInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: all 0.2s ease;

  &::placeholder {
    font-weight: 400;
    letter-spacing: 0;
    text-transform: none;
    color: #9ca3af;
  }

  &:focus {
    outline: none;
    border-color: #5b4dff;
    box-shadow: 0 0 0 3px rgba(91, 77, 255, 0.1);
  }

  &:disabled {
    background: #f9fafb;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const ApplyButton = styled.button`
  padding: 12px 24px;
  background: linear-gradient(135deg, #5b4dff 0%, #4c3fcc 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 100px;
  font-family: inherit;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(91, 77, 255, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    width: 100%;
    padding: 12px;
  }
`;

const Spinner = styled.span`
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
`;

const SuccessBanner = styled.div`
  animation: ${fadeIn} 0.3s ease;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border: 1px solid #6ee7b7;
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const SuccessInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;

  .check-icon {
    width: 32px;
    height: 32px;
    background: #10b981;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 16px;
    flex-shrink: 0;
  }

  .details {
    min-width: 0;

    .code {
      font-size: 14px;
      font-weight: 700;
      color: #065f46;
      letter-spacing: 0.5px;
    }

    .discount-text {
      font-size: 12px;
      color: #047857;
      margin-top: 2px;
    }
  }
`;

const DiscountBadge = styled.span`
  background: #10b981;
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
`;

const RemoveButton = styled.button`
  background: none;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;
  font-weight: 500;
  font-family: inherit;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    border-color: #ef4444;
    color: #ef4444;
    background: #fef2f2;
  }
`;

const ErrorMessage = styled.div`
  animation: ${fadeIn} 0.2s ease;
  margin-top: 8px;
  padding: 10px 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  font-size: 13px;
  color: #dc2626;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;

  &::before {
    content: '⚠️';
    flex-shrink: 0;
  }
`;

// ==================== Component ====================

/**
 * PromoCodeInput Component
 *
 * @param {Object} props
 * @param {number} props.cartSubtotal - Current cart subtotal for validation
 * @param {Function} props.onCouponApplied - Callback when coupon is applied: (couponData) => void
 * @param {Function} props.onCouponRemoved - Callback when coupon is removed: () => void
 * @param {boolean} props.disabled - Disable the input (e.g., during checkout submission)
 * @returns {JSX.Element}
 */
export default function PromoCodeInput({
  cartSubtotal = 0,
  onCouponApplied,
  onCouponRemoved,
  disabled = false,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const {
    validateCoupon,
    removeCoupon,
    couponData,
    isValidating,
    error,
    clearError,
  } = useValidateCoupon();

  const handleApply = async () => {
    if (!inputValue.trim()) return;

    const result = await validateCoupon(inputValue, cartSubtotal);

    if (result) {
      onCouponApplied?.(result);
    }
  };

  const handleRemove = () => {
    removeCoupon();
    setInputValue('');
    onCouponRemoved?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApply();
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (error) clearError();
  };

  const formatDiscount = (data) => {
    if (!data) return '';
    if (data.discountType === 'percentage') {
      return `${data.discountValue}% off`;
    }
    return `$${data.discountAmount.toFixed(2)} off`;
  };

  // If coupon is applied, always show expanded
  const showContent = isExpanded || couponData;

  return (
    <Container id="promo-code-section">
      <ToggleButton
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        $expanded={showContent}
        disabled={disabled}
      >
        <span className="label">
          <span>🏷️</span>
          {couponData ? 'Promo code applied' : 'Have a promo code?'}
        </span>
        <span className="icon">▾</span>
      </ToggleButton>

      {showContent && (
        <ContentArea>
          {couponData ? (
            /* Success State — Coupon Applied */
            <SuccessBanner>
              <SuccessInfo>
                <div className="check-icon">✓</div>
                <div className="details">
                  <div className="code">{couponData.code}</div>
                  <div className="discount-text">{formatDiscount(couponData)}</div>
                </div>
              </SuccessInfo>
              <DiscountBadge>-${couponData.discountAmount.toFixed(2)}</DiscountBadge>
              <RemoveButton onClick={handleRemove} disabled={disabled}>
                Remove
              </RemoveButton>
            </SuccessBanner>
          ) : (
            /* Input State — Enter Code */
            <>
              <InputRow>
                <CodeInput
                  id="promo-code-input"
                  type="text"
                  placeholder="Enter promo code"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  disabled={isValidating || disabled}
                  maxLength={30}
                  autoComplete="off"
                  spellCheck={false}
                />
                <ApplyButton
                  id="promo-code-apply"
                  type="button"
                  onClick={handleApply}
                  disabled={isValidating || !inputValue.trim() || disabled}
                >
                  {isValidating ? (
                    <>
                      <Spinner />
                      Checking...
                    </>
                  ) : (
                    'Apply'
                  )}
                </ApplyButton>
              </InputRow>

              {error && <ErrorMessage>{error}</ErrorMessage>}
            </>
          )}
        </ContentArea>
      )}
    </Container>
  );
}
