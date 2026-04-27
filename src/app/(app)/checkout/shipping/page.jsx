/**
 * Checkout Shipping Page
 * First step in checkout flow - collect shipping address + promo code before payment
 *
 * Flow:
 * 1. Display ShippingForm to collect address
 * 2. Display PromoCodeInput to apply discount
 * 3. Display CheckoutSummary with real-time totals
 * 4. Validate and store in Zustand
 * 5. On submit, redirect to Stripe Checkout (with coupon if applied)
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { useCheckoutAffiliateTracking } from '@/hooks/useCheckout';
import { useShippingAddress } from '@/stores/checkoutStore';
import { useCartStore } from '@/stores/cartStore';
import checkoutService from '@/api/services/checkoutService';
import ShippingForm from '@/components/checkout/ShippingForm';
import PromoCodeInput from '@/components/checkout/PromoCodeInput';
import CheckoutSummary from '@/components/checkout/CheckoutSummary';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  padding: 40px 20px;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding: 20px 12px;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 32px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    max-width: 700px;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 40px;

  @media (max-width: 900px) {
    position: static;
    order: -1;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 32px;
  grid-column: 1 / -1;

  @media (max-width: 768px) {
    margin-bottom: 24px;
  }
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const Subtitle = styled.p`
  font-size: 15px;
  color: #6b7280;
  margin: 0;
`;

const ProgressBar = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 20px;
  align-items: center;

  @media (max-width: 768px) {
    gap: 4px;
    margin-top: 16px;
  }
`;

const ProgressItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 4px;
  }
`;

const StepBadge = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 15px;
  background: ${(props) => (props.$active ? '#5b4dff' : props.$completed ? '#10b981' : '#e5e7eb')};
  color: ${(props) => (props.$active || props.$completed ? 'white' : '#6b7280')};
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }
`;

const StepLabel = styled.span`
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

const Connector = styled.div`
  width: 60px;
  height: 2px;
  background: #e5e7eb;
  position: relative;

  @media (max-width: 768px) {
    display: none;
  }
`;

/**
 * Checkout Shipping Page
 * Collects shipping address + promo code before Stripe payment
 */
export default function CheckoutShippingPage() {
  const router = useRouter();
  const { getAffiliateId } = useCheckoutAffiliateTracking();
  const shippingAddress = useShippingAddress();

  // Cart state
  const items = useCartStore((state) => state.items);
  const summary = useCartStore((state) => state.summary);
  const fetchCart = useCartStore((state) => state.fetchCart);

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch cart on mount
  useEffect(() => {
    fetchCart().catch((err) => {
      console.error('❌ Failed to fetch cart:', err);
    });
  }, [fetchCart]);

  // Compute totals with coupon discount
  const computedTotals = {
    subtotal: summary.subtotal || 0,
    tax: summary.tax || 0,
    discount: appliedCoupon ? appliedCoupon.discountAmount : 0,
    total: appliedCoupon
      ? Math.max(0, (summary.total || 0) - appliedCoupon.discountAmount)
      : summary.total || 0,
  };

  const handleCouponApplied = (couponData) => {
    console.log('🏷️ Coupon applied:', couponData);
    setAppliedCoupon(couponData);
  };

  const handleCouponRemoved = () => {
    console.log('🏷️ Coupon removed');
    setAppliedCoupon(null);
  };

  const handleShippingSubmit = async (validatedAddress) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      console.log('🚚 Shipping form submitted, creating checkout session...');
      console.log('📦 Validated address received:', validatedAddress);

      const affiliateId = getAffiliateId();
      console.log('🆔 [AFFILIATE TRACKING] Affiliate ID retrieved:', {
        affiliateId: affiliateId || '(none)',
        status: affiliateId ? '✅ PRESENT' : '❌ NOT FOUND',
      });

      if (affiliateId) {
        console.log('✅ Affiliate ID will be attached to checkout session');
      } else {
        console.log('ℹ️  No affiliate ID - processing as regular customer');
      }

      // Create checkout session with shipping address AND coupon code
      const sessionData = await checkoutService.createCheckoutSession({
        affiliateId,
        shippingAddress: validatedAddress,
        couponCode: appliedCoupon?.code || null,
      });

      console.log('✅ Checkout session created:', sessionData.sessionId);
      console.log('✅ Affiliate attribution status: ' + (affiliateId ? 'ATTACHED' : 'NONE'));
      console.log('🏷️ Coupon status: ' + (appliedCoupon ? `APPLIED (${appliedCoupon.code})` : 'NONE'));

      // Redirect to Stripe checkout
      if (sessionData.url) {
        window.location.href = sessionData.url;
      } else {
        console.error('No checkout URL received');
        alert('Error creating checkout session. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error creating checkout session:', error);

      // Show error to user
      let errorMessage = 'Error creating checkout session. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      }
      if (error.details?.shippingAddress) {
        errorMessage = `Shipping address error: ${JSON.stringify(error.details.shippingAddress)}`;
      }
      if (error.details?.email) {
        errorMessage = `Email error: ${error.details.email}`;
      }
      if (error.details?.couponCode) {
        errorMessage = `Coupon error: ${error.details.couponCode}`;
      }

      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <Header>
        <Title>🚚 Checkout</Title>
        <Subtitle>Step 1 of 2 — Shipping & promo code</Subtitle>

        {/* Progress indicator */}
        <ProgressBar>
          <ProgressItem>
            <StepBadge $active $completed={false}>
              1
            </StepBadge>
            <StepLabel>Shipping</StepLabel>
          </ProgressItem>

          <Connector />

          <ProgressItem>
            <StepBadge $active={false} $completed={false}>
              2
            </StepBadge>
            <StepLabel>Payment</StepLabel>
          </ProgressItem>
        </ProgressBar>
      </Header>

      <ContentWrapper>
        {/* Left Column — Shipping Form */}
        <LeftColumn>
          <ShippingForm
            onSubmit={handleShippingSubmit}
            showSaveProfile={true}
          />
        </LeftColumn>

        {/* Right Column — Summary + Promo Code */}
        <RightColumn>
          {/* Order Summary */}
          <CheckoutSummary
            totals={computedTotals}
            itemCount={summary.itemCount || items.length}
            title="Order Summary"
            showBreakdown={true}
            showShippingNote={true}
          />

          {/* Promo Code Input */}
          <PromoCodeInput
            cartSubtotal={summary.subtotal || 0}
            onCouponApplied={handleCouponApplied}
            onCouponRemoved={handleCouponRemoved}
            disabled={isSubmitting}
          />
        </RightColumn>
      </ContentWrapper>
    </PageContainer>
  );
}
