/**
 * Coupon API Service
 * Handles all API calls to backend coupon endpoints
 *
 * Endpoints:
 * - POST   /api/v1/coupons/validate   — Validate a promo code (customer)
 * - GET    /api/v1/coupons             — List coupons (admin)
 * - POST   /api/v1/coupons             — Create coupon (admin)
 * - GET    /api/v1/coupons/:id         — Get single coupon (admin)
 * - PUT    /api/v1/coupons/:id         — Update coupon (admin)
 * - DELETE /api/v1/coupons/:id         — Deactivate coupon (admin)
 * - GET    /api/v1/coupons/analytics   — Coupon analytics (admin)
 */

import client from '@/api/client';

// ==================== Customer-Facing ====================

/**
 * Validate a promo code and calculate the discount
 *
 * @param {string} code - The coupon code entered by the customer
 * @param {number} cartSubtotal - Current cart subtotal before discount
 * @returns {Promise<Object>} Validation result with discount details
 *
 * @example
 * const result = await couponService.validateCoupon('SAVE20', 100.00);
 * // result = {
 * //   valid: true,
 * //   couponId: '...',
 * //   code: 'SAVE20',
 * //   discountType: 'percentage',
 * //   discountValue: 20,
 * //   discountAmount: 20.00,
 * //   newTotal: 80.00,
 * // }
 */
export async function validateCoupon(code, cartSubtotal) {
  try {
    console.log('🏷️ [COUPON] Validating coupon:', code, 'subtotal:', cartSubtotal);

    const response = await client.post('/coupons/validate', {
      code: code.trim().toUpperCase(),
      cartSubtotal,
    });

    if (!response.data.success) {
      // Backend returned success: false — coupon is invalid
      return {
        valid: false,
        reason: response.data.message || 'Invalid coupon code',
      };
    }

    console.log('✅ [COUPON] Validation result:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('❌ [COUPON] Validation error:', error.response?.data || error.message);

    // Extract the error message from the backend response
    const reason =
      error.response?.data?.message ||
      error.response?.data?.details?.[0]?.message ||
      'Failed to validate coupon code';

    return {
      valid: false,
      reason,
    };
  }
}

// ==================== Admin CRUD ====================

/**
 * Get all coupons with pagination and filtering (admin only)
 *
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 20)
 * @param {boolean} params.isActive - Filter by active status
 * @param {string} params.salesChannel - Filter by sales channel
 * @param {string} params.search - Search code/description/channel
 * @param {string} params.sortBy - Sort field
 * @param {string} params.order - Sort order (asc/desc)
 * @returns {Promise<Object>} { data: [...coupons], pagination: {...} }
 */
export async function getCoupons(params = {}) {
  try {
    console.log('📋 [COUPON] Fetching coupons list:', params);

    const response = await client.get('/coupons', { params });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch coupons');
    }

    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  } catch (error) {
    console.error('❌ [COUPON] Fetch coupons error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch coupons');
  }
}

/**
 * Get a single coupon by ID (admin only)
 *
 * @param {string} id - Coupon ObjectId
 * @returns {Promise<Object>} Coupon document
 */
export async function getCouponById(id) {
  try {
    const response = await client.get(`/coupons/${id}`);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch coupon');
    }

    return response.data.data;
  } catch (error) {
    console.error('❌ [COUPON] Fetch coupon error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch coupon');
  }
}

/**
 * Create a new coupon (admin only)
 *
 * @param {Object} data - Coupon data
 * @param {string} data.code - Coupon code (uppercase, alphanumeric + _ -)
 * @param {string} data.discountType - 'percentage' or 'flat'
 * @param {number} data.discountValue - Discount amount
 * @param {string} data.description - Optional description
 * @param {number} data.minimumOrderValue - Minimum order value (default: 0)
 * @param {number} data.maxUses - Max total uses (0 = unlimited)
 * @param {number} data.maxUsesPerUser - Max uses per user (default: 1)
 * @param {boolean} data.isActive - Active status (default: true)
 * @param {string} data.expiryDate - ISO date string or null
 * @param {string} data.appliesTo - Target scope (default: 'all')
 * @param {string} data.salesChannel - Marketing channel
 * @returns {Promise<Object>} Created coupon
 */
export async function createCoupon(data) {
  try {
    console.log('🏷️ [COUPON] Creating coupon:', data.code);

    const response = await client.post('/coupons', data);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create coupon');
    }

    console.log('✅ [COUPON] Coupon created:', response.data.data.code);
    return response.data.data;
  } catch (error) {
    console.error('❌ [COUPON] Create error:', error.response?.data || error.message);

    // Handle validation errors
    const message =
      error.response?.data?.message ||
      error.response?.data?.details?.[0]?.message ||
      'Failed to create coupon';

    throw new Error(message);
  }
}

/**
 * Update an existing coupon (admin only)
 *
 * @param {string} id - Coupon ObjectId
 * @param {Object} data - Fields to update
 * @returns {Promise<Object>} Updated coupon
 */
export async function updateCoupon(id, data) {
  try {
    console.log('🏷️ [COUPON] Updating coupon:', id);

    const response = await client.put(`/coupons/${id}`, data);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update coupon');
    }

    console.log('✅ [COUPON] Coupon updated:', response.data.data.code);
    return response.data.data;
  } catch (error) {
    console.error('❌ [COUPON] Update error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to update coupon');
  }
}

/**
 * Deactivate (soft-delete) a coupon (admin only)
 *
 * @param {string} id - Coupon ObjectId
 * @returns {Promise<Object>} Deactivated coupon
 */
export async function deleteCoupon(id) {
  try {
    console.log('🏷️ [COUPON] Deactivating coupon:', id);

    const response = await client.delete(`/coupons/${id}`);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to deactivate coupon');
    }

    console.log('✅ [COUPON] Coupon deactivated');
    return response.data.data;
  } catch (error) {
    console.error('❌ [COUPON] Delete error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to deactivate coupon');
  }
}

// ==================== Analytics ====================

/**
 * Get coupon usage analytics for admin dashboard
 *
 * @returns {Promise<Object>} Analytics data
 * {
 *   coupons: [...],     // Each coupon with usage + revenue data
 *   summary: {          // Aggregate stats
 *     totalCoupons, activeCoupons, totalUsage, totalRevenue, totalDiscount
 *   },
 *   bySalesChannel: [...] // Revenue grouped by sales channel
 * }
 */
export async function getCouponAnalytics() {
  try {
    console.log('📊 [COUPON] Fetching coupon analytics');

    const response = await client.get('/coupons/analytics');

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch coupon analytics');
    }

    console.log('✅ [COUPON] Analytics received');
    return response.data.data;
  } catch (error) {
    console.error('❌ [COUPON] Analytics error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch coupon analytics');
  }
}

export default {
  validateCoupon,
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getCouponAnalytics,
};
