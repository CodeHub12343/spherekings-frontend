'use client';

/**
 * Coupon Custom Hooks
 * React hooks for coupon operations (customer validation + admin management)
 *
 * Usage:
 * - useValidateCoupon()   — Customer: validate promo code at checkout
 * - useCouponsList()      — Admin: list coupons with pagination
 * - useCreateCoupon()     — Admin: create new coupon
 * - useUpdateCoupon()     — Admin: update coupon
 * - useDeleteCoupon()     — Admin: deactivate coupon
 * - useCouponAnalytics()  — Admin: coupon performance analytics
 */

import { useState, useCallback } from 'react';
import couponService from '@/api/services/couponService';

// ==================== Customer Hook ====================

/**
 * Hook for validating a promo code at checkout
 *
 * @returns {Object} { validateCoupon, removeCoupon, couponData, isValidating, error }
 *
 * @example
 * const { validateCoupon, removeCoupon, couponData, isValidating, error } = useValidateCoupon();
 *
 * // Apply coupon
 * await validateCoupon('SAVE20', 100.00);
 *
 * // Remove applied coupon
 * removeCoupon();
 */
export function useValidateCoupon() {
  const [couponData, setCouponData] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState(null);

  const validateCoupon = useCallback(async (code, cartSubtotal) => {
    if (!code || !code.trim()) {
      setError('Please enter a coupon code');
      return null;
    }

    if (!cartSubtotal || cartSubtotal <= 0) {
      setError('Cart is empty');
      return null;
    }

    setIsValidating(true);
    setError(null);

    try {
      const result = await couponService.validateCoupon(code, cartSubtotal);

      if (result.valid) {
        setCouponData(result);
        setError(null);
        return result;
      } else {
        setCouponData(null);
        setError(result.reason || 'Invalid coupon code');
        return null;
      }
    } catch (err) {
      setCouponData(null);
      setError(err.message || 'Failed to validate coupon');
      return null;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const removeCoupon = useCallback(() => {
    setCouponData(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    validateCoupon,
    removeCoupon,
    clearError,
    couponData,
    isValidating,
    error,
  };
}

// ==================== Admin Hooks ====================

/**
 * Hook for listing coupons with pagination/filtering (admin)
 *
 * @returns {Object} { coupons, pagination, isLoading, error, fetchCoupons, refetch }
 */
export function useCouponsList() {
  const [coupons, setCoupons] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCoupons = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await couponService.getCoupons(params);
      setCoupons(result.data || []);
      setPagination(result.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
    } catch (err) {
      setError(err.message || 'Failed to fetch coupons');
      setCoupons([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    coupons,
    pagination,
    isLoading,
    error,
    fetchCoupons,
    refetch: fetchCoupons,
  };
}

/**
 * Hook for creating a coupon (admin)
 *
 * @returns {Object} { createCoupon, isCreating, error }
 */
export function useCreateCoupon() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  const createCoupon = useCallback(async (data) => {
    setIsCreating(true);
    setError(null);

    try {
      const result = await couponService.createCoupon(data);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to create coupon');
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, []);

  return { createCoupon, isCreating, error, clearError: () => setError(null) };
}

/**
 * Hook for updating a coupon (admin)
 *
 * @returns {Object} { updateCoupon, isUpdating, error }
 */
export function useUpdateCoupon() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const updateCoupon = useCallback(async (id, data) => {
    setIsUpdating(true);
    setError(null);

    try {
      const result = await couponService.updateCoupon(id, data);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to update coupon');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return { updateCoupon, isUpdating, error, clearError: () => setError(null) };
}

/**
 * Hook for deactivating a coupon (admin)
 *
 * @returns {Object} { deleteCoupon, isDeleting, error }
 */
export function useDeleteCoupon() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const deleteCoupon = useCallback(async (id) => {
    setIsDeleting(true);
    setError(null);

    try {
      const result = await couponService.deleteCoupon(id);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to deactivate coupon');
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return { deleteCoupon, isDeleting, error };
}

/**
 * Hook for coupon analytics (admin)
 *
 * @returns {Object} { analytics, isLoading, error, fetchAnalytics }
 */
export function useCouponAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await couponService.getCouponAnalytics();
      setAnalytics(result);
    } catch (err) {
      setError(err.message || 'Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { analytics, isLoading, error, fetchAnalytics };
}

export default {
  useValidateCoupon,
  useCouponsList,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
  useCouponAnalytics,
};
