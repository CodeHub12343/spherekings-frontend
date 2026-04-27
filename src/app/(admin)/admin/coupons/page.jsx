/**
 * Admin Coupons Management Page
 * Full CRUD interface for managing coupon/promo codes
 *
 * Features:
 * - Data table with all coupons
 * - Create, Edit, Deactivate actions
 * - Search and filter (active/inactive, sales channel)
 * - Pagination
 * - Link to analytics page
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import CouponForm from '@/components/admin/CouponForm';
import {
  useCouponsList,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
} from '@/hooks/useCoupons';

// ==================== Styled Components ====================

const PageContainer = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 16px;
`;

const HeaderLeft = styled.div`
  h1 {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 4px 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  p {
    color: #666;
    margin: 0;
    font-size: 14px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const PrimaryButton = styled.button`
  padding: 10px 20px;
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

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(91, 77, 255, 0.3);
  }
`;

const SecondaryLink = styled(Link)`
  padding: 10px 20px;
  background: white;
  color: #5b4dff;
  border: 1px solid #5b4dff;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    background: #f8f7ff;
  }
`;

const FiltersBar = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  min-width: 250px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #5b4dff;
    box-shadow: 0 0 0 3px rgba(91, 77, 255, 0.1);
  }

  @media (max-width: 600px) {
    min-width: 100%;
  }
`;

const FilterSelect = styled.select`
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #5b4dff;
  }
`;

const TableCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
`;

const TableWrapper = styled.div`
  overflow-x: auto;

  @media (max-width: 768px) {
    display: none;
  }
`;

// ==================== Mobile Card Styles ====================

const MobileCardList = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
  }
`;

const MobileCard = styled.div`
  background: #fafbfc;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
`;

const CardLabel = styled.span`
  color: #6b7280;
  font-weight: 500;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const CardValue = styled.span`
  color: #1f2937;
  font-weight: 500;
  font-size: 13px;
  text-align: right;
`;

const CardActions = styled.div`
  display: flex;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
`;

const Th = styled.th`
  text-align: left;
  padding: 14px 16px;
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Td = styled.td`
  padding: 14px 16px;
  border-bottom: 1px solid #f3f4f6;
  color: #1f2937;
  vertical-align: middle;
`;

const CodeBadge = styled.span`
  background: #f3f4f6;
  color: #1f2937;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.5px;
  font-family: monospace;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;

  ${(props) =>
    props.$active
      ? `
    background: #ecfdf5;
    color: #059669;
  `
      : `
    background: #fef2f2;
    color: #dc2626;
  `}
`;

const DiscountDisplay = styled.span`
  font-weight: 600;
  color: #5b4dff;
`;

const ChannelTag = styled.span`
  background: #eff6ff;
  color: #2563eb;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  background: white;
  color: ${(props) => props.$danger ? '#dc2626' : '#374151'};
  font-family: inherit;
  transition: all 0.2s;
  margin-right: 6px;

  &:hover {
    background: ${(props) => props.$danger ? '#fef2f2' : '#f3f4f6'};
    border-color: ${(props) => props.$danger ? '#fecaca' : '#d1d5db'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PaginationBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  font-size: 13px;
  color: #6b7280;
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const PageButton = styled.button`
  padding: 6px 14px;
  border: 1px solid ${(props) => props.$active ? '#5b4dff' : '#e5e7eb'};
  border-radius: 6px;
  background: ${(props) => props.$active ? '#5b4dff' : 'white'};
  color: ${(props) => props.$active ? 'white' : '#374151'};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    border-color: #5b4dff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;

  .icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  h3 {
    margin: 0 0 8px;
    color: #1f2937;
    font-size: 18px;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
`;

const LoadingOverlay = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
  font-size: 15px;
`;

const ErrorBanner = styled.div`
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  margin-bottom: 16px;
  font-size: 14px;
`;

// ==================== Component ====================

export default function AdminCouponsPage() {
  const { isAuthenticated, user } = useAuth();

  // List hook
  const { coupons, pagination, isLoading, error: listError, fetchCoupons } = useCouponsList();

  // CRUD hooks
  const { createCoupon, isCreating, error: createError, clearError: clearCreateError } = useCreateCoupon();
  const { updateCoupon, isUpdating, error: updateError, clearError: clearUpdateError } = useUpdateCoupon();
  const { deleteCoupon, isDeleting } = useDeleteCoupon();

  // UI state
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch coupons on mount and when filters change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 20,
      ...(searchQuery && { search: searchQuery }),
      ...(activeFilter !== '' && { isActive: activeFilter === 'true' }),
    };
    fetchCoupons(params);
  }, [currentPage, fetchCoupons]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchCoupons({
        page: 1,
        limit: 20,
        ...(searchQuery && { search: searchQuery }),
        ...(activeFilter !== '' && { isActive: activeFilter === 'true' }),
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, activeFilter, fetchCoupons]);

  const handleCreate = async (formData) => {
    try {
      await createCoupon(formData);
      setShowForm(false);
      fetchCoupons({ page: currentPage, limit: 20 });
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleUpdate = async (formData) => {
    if (!editingCoupon) return;
    try {
      await updateCoupon(editingCoupon._id, formData);
      setEditingCoupon(null);
      setShowForm(false);
      fetchCoupons({ page: currentPage, limit: 20 });
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleDelete = async (couponId) => {
    if (!confirm('Are you sure you want to deactivate this coupon?')) return;
    try {
      await deleteCoupon(couponId);
      fetchCoupons({ page: currentPage, limit: 20 });
    } catch (err) {
      alert('Failed to deactivate coupon: ' + err.message);
    }
  };

  const openCreateForm = () => {
    setEditingCoupon(null);
    clearCreateError();
    setShowForm(true);
  };

  const openEditForm = (coupon) => {
    setEditingCoupon(coupon);
    clearUpdateError();
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCoupon(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDiscount = (coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}%`;
    }
    return `$${coupon.discountValue.toFixed(2)}`;
  };

  // Auth check
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <PageContainer>
        <EmptyState>
          <h3>Access Denied</h3>
          <p>You must be an admin to access this page.</p>
        </EmptyState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header */}
      <Header>
        <HeaderLeft>
          <h1>🏷️ Coupons & Promo Codes</h1>
          <p>Create discount codes, track usage, and measure campaign performance</p>
        </HeaderLeft>
        <HeaderActions>
          <SecondaryLink href="/admin/coupons/analytics">
            📊 Analytics
          </SecondaryLink>
          <PrimaryButton onClick={openCreateForm}>
            + New Coupon
          </PrimaryButton>
        </HeaderActions>
      </Header>

      {/* Error */}
      {listError && <ErrorBanner>⚠️ {listError}</ErrorBanner>}

      {/* Filters */}
      <FiltersBar>
        <SearchInput
          placeholder="Search code, description, or channel..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <FilterSelect
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </FilterSelect>
      </FiltersBar>

      {/* Table */}
      <TableCard>
        {isLoading ? (
          <LoadingOverlay>Loading coupons...</LoadingOverlay>
        ) : coupons.length === 0 ? (
          <EmptyState>
            <div className="icon">🏷️</div>
            <h3>No coupons found</h3>
            <p>Create your first coupon to start offering discounts.</p>
          </EmptyState>
        ) : (
          <>
            {/* Desktop Table */}
            <TableWrapper>
              <Table>
                <thead>
                  <tr>
                    <Th>Code</Th>
                    <Th>Discount</Th>
                    <Th>Status</Th>
                    <Th>Usage</Th>
                    <Th>Channel</Th>
                    <Th>Expires</Th>
                    <Th>Created</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon._id}>
                      <Td>
                        <CodeBadge>{coupon.code}</CodeBadge>
                      </Td>
                      <Td>
                        <DiscountDisplay>{formatDiscount(coupon)}</DiscountDisplay>
                        <span style={{ color: '#9ca3af', fontSize: '12px', marginLeft: '4px' }}>
                          {coupon.discountType}
                        </span>
                      </Td>
                      <Td>
                        <StatusBadge $active={coupon.isActive}>
                          {coupon.isActive ? '● Active' : '○ Inactive'}
                        </StatusBadge>
                      </Td>
                      <Td>
                        <span style={{ fontWeight: 600 }}>{coupon.usageCount}</span>
                        {coupon.maxUses > 0 && (
                          <span style={{ color: '#9ca3af' }}> / {coupon.maxUses}</span>
                        )}
                      </Td>
                      <Td>
                        {coupon.salesChannel ? (
                          <ChannelTag>{coupon.salesChannel}</ChannelTag>
                        ) : (
                          <span style={{ color: '#d1d5db' }}>—</span>
                        )}
                      </Td>
                      <Td style={{ fontSize: '13px', color: '#6b7280' }}>
                        {formatDate(coupon.expiryDate)}
                      </Td>
                      <Td style={{ fontSize: '13px', color: '#6b7280' }}>
                        {formatDate(coupon.createdAt)}
                      </Td>
                      <Td>
                        <ActionButton onClick={() => openEditForm(coupon)}>
                          Edit
                        </ActionButton>
                        {coupon.isActive && (
                          <ActionButton
                            $danger
                            onClick={() => handleDelete(coupon._id)}
                            disabled={isDeleting}
                          >
                            Deactivate
                          </ActionButton>
                        )}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrapper>

            {/* Mobile Cards */}
            <MobileCardList>
              {coupons.map((coupon) => (
                <MobileCard key={coupon._id}>
                  <CardHeader>
                    <CodeBadge>{coupon.code}</CodeBadge>
                    <StatusBadge $active={coupon.isActive}>
                      {coupon.isActive ? '● Active' : '○ Inactive'}
                    </StatusBadge>
                  </CardHeader>

                  <CardRow>
                    <CardLabel>Discount</CardLabel>
                    <CardValue>
                      <DiscountDisplay>{formatDiscount(coupon)}</DiscountDisplay>
                      <span style={{ color: '#9ca3af', fontSize: '12px', marginLeft: '4px' }}>
                        {coupon.discountType}
                      </span>
                    </CardValue>
                  </CardRow>

                  <CardRow>
                    <CardLabel>Usage</CardLabel>
                    <CardValue>
                      <span style={{ fontWeight: 600 }}>{coupon.usageCount}</span>
                      {coupon.maxUses > 0 && (
                        <span style={{ color: '#9ca3af' }}> / {coupon.maxUses}</span>
                      )}
                    </CardValue>
                  </CardRow>

                  <CardRow>
                    <CardLabel>Channel</CardLabel>
                    <CardValue>
                      {coupon.salesChannel ? (
                        <ChannelTag>{coupon.salesChannel}</ChannelTag>
                      ) : (
                        <span style={{ color: '#d1d5db' }}>—</span>
                      )}
                    </CardValue>
                  </CardRow>

                  <CardRow>
                    <CardLabel>Expires</CardLabel>
                    <CardValue style={{ color: '#6b7280' }}>
                      {formatDate(coupon.expiryDate)}
                    </CardValue>
                  </CardRow>

                  <CardRow>
                    <CardLabel>Created</CardLabel>
                    <CardValue style={{ color: '#6b7280' }}>
                      {formatDate(coupon.createdAt)}
                    </CardValue>
                  </CardRow>

                  <CardActions>
                    <ActionButton onClick={() => openEditForm(coupon)} style={{ flex: 1 }}>
                      ✏️ Edit
                    </ActionButton>
                    {coupon.isActive && (
                      <ActionButton
                        $danger
                        onClick={() => handleDelete(coupon._id)}
                        disabled={isDeleting}
                        style={{ flex: 1 }}
                      >
                        🚫 Deactivate
                      </ActionButton>
                    )}
                  </CardActions>
                </MobileCard>
              ))}
            </MobileCardList>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <PaginationBar>
                <span>
                  Showing {(pagination.page - 1) * pagination.limit + 1}–
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total}
                </span>
                <PaginationButtons>
                  <PageButton
                    disabled={pagination.page <= 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    ← Prev
                  </PageButton>
                  {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + 1).map(
                    (page) => (
                      <PageButton
                        key={page}
                        $active={page === pagination.page}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </PageButton>
                    )
                  )}
                  <PageButton
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next →
                  </PageButton>
                </PaginationButtons>
              </PaginationBar>
            )}
          </>
        )}
      </TableCard>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <CouponForm
          coupon={editingCoupon}
          onSubmit={editingCoupon ? handleUpdate : handleCreate}
          onClose={closeForm}
          isSubmitting={isCreating || isUpdating}
          submitError={editingCoupon ? updateError : createError}
        />
      )}
    </PageContainer>
  );
}
