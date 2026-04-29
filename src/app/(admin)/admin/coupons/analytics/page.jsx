/**
 * Admin Coupon Analytics Page
 * Displays coupon performance metrics, revenue attribution, and sales channel breakdown
 *
 * Features:
 * - Summary stat cards (total coupons, usage, revenue, discounts)
 * - Coupon performance table with revenue data
 * - Sales channel breakdown
 * - Link back to coupon management
 */

'use client';

import { useEffect } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCouponAnalytics } from '@/hooks/useCoupons';

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
    margin: 0 0 4px;
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

const BackLink = styled(Link)`
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

  .label {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #6b7280;
    margin-bottom: 8px;
  }

  .value {
    font-size: 28px;
    font-weight: 700;
    color: ${(props) => props.$color || '#1f2937'};
    line-height: 1;
  }

  .sub {
    font-size: 12px;
    color: #9ca3af;
    margin-top: 4px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
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
`;

/* ---- Mobile card layout for coupon performance ---- */

const MobileCardList = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
  }
`;

const CouponCard = styled.div`
  background: #fafafa;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
`;

const CouponCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f3f4f6;
`;

const CouponCardRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  font-size: 13px;

  .card-label {
    color: #6b7280;
    font-weight: 500;
  }

  .card-value {
    font-weight: 600;
    color: #1f2937;
  }
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

const ChannelCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
`;

const ChannelItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }

  .name {
    font-weight: 600;
    color: #1f2937;
    font-size: 14px;
    text-transform: capitalize;
  }

  .stats {
    text-align: right;
    font-size: 13px;

    .revenue {
      font-weight: 700;
      color: #059669;
    }

    .orders {
      color: #6b7280;
      font-size: 12px;
    }
  }
`;

const ChannelBar = styled.div`
  height: 6px;
  background: #f3f4f6;
  border-radius: 3px;
  margin-top: 6px;
  overflow: hidden;

  .fill {
    height: 100%;
    background: linear-gradient(90deg, #5b4dff, #10b981);
    border-radius: 3px;
    transition: width 0.5s ease;
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;

  ${(props) =>
    props.$active
      ? `background: #ecfdf5; color: #059669;`
      : `background: #fef2f2; color: #dc2626;`}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;

  h3 {
    margin: 0 0 8px;
    color: #1f2937;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #6b7280;
  font-size: 16px;
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

export default function AdminCouponAnalyticsPage() {
  const { isAuthenticated, user } = useAuth();
  const { analytics, isLoading, error, fetchAnalytics } = useCouponAnalytics();

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
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

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState>📊 Loading coupon analytics...</LoadingState>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorBanner>⚠️ {error}</ErrorBanner>
      </PageContainer>
    );
  }

  const summary = analytics?.summary || {};
  const couponsList = analytics?.coupons || [];
  const salesChannels = analytics?.bySalesChannel || [];
  const maxChannelRevenue = salesChannels.length > 0
    ? Math.max(...salesChannels.map((c) => c.totalRevenue))
    : 0;

  return (
    <PageContainer>
      {/* Header */}
      <Header>
        <HeaderLeft>
          <h1>📊 Coupon Analytics</h1>
          <p>Track coupon performance, revenue attribution, and sales channel insights</p>
        </HeaderLeft>
        <BackLink href="/admin/coupons">
          ← Back to Coupons
        </BackLink>
      </Header>

      {/* Summary Stats */}
      <StatsGrid>
        <StatCard>
          <div className="label">Total Coupons</div>
          <div className="value">{summary.totalCoupons || 0}</div>
          <div className="sub">{summary.activeCoupons || 0} active</div>
        </StatCard>
        <StatCard $color="#5b4dff">
          <div className="label">Total Uses</div>
          <div className="value">{summary.totalUsage || 0}</div>
          <div className="sub">across all coupons</div>
        </StatCard>
        <StatCard $color="#059669">
          <div className="label">Revenue Attributed</div>
          <div className="value">{formatCurrency(summary.totalRevenue)}</div>
          <div className="sub">from coupon orders</div>
        </StatCard>
        <StatCard $color="#d97706">
          <div className="label">Total Discounts Given</div>
          <div className="value">{formatCurrency(summary.totalDiscount)}</div>
          <div className="sub">savings for customers</div>
        </StatCard>
      </StatsGrid>

      {/* Performance Table + Channel Breakdown */}
      <SectionGrid>
        {/* Coupon Performance Table */}
        <div>
          <SectionTitle>🏷️ Coupon Performance</SectionTitle>
          <TableCard>
            {couponsList.length === 0 ? (
              <EmptyState>
                <h3>No data yet</h3>
                <p>Coupon usage data will appear here once coupons are used.</p>
              </EmptyState>
            ) : (
              <>
                {/* Desktop table */}
                <TableWrapper>
                  <Table>
                    <thead>
                      <tr>
                        <Th>Code</Th>
                        <Th>Discount</Th>
                        <Th>Status</Th>
                        <Th>Uses</Th>
                        <Th>Orders</Th>
                        <Th>Revenue</Th>
                        <Th>Avg Order</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {couponsList.map((coupon) => (
                        <tr key={coupon._id}>
                          <Td>
                            <CodeBadge>{coupon.code}</CodeBadge>
                          </Td>
                          <Td>
                            <span style={{ fontWeight: 600, color: '#5b4dff' }}>
                              {coupon.discountType === 'percentage'
                                ? `${coupon.discountValue}%`
                                : formatCurrency(coupon.discountValue)}
                            </span>
                          </Td>
                          <Td>
                            <StatusBadge $active={coupon.isActive}>
                              {coupon.isActive ? 'Active' : 'Inactive'}
                            </StatusBadge>
                          </Td>
                          <Td style={{ fontWeight: 600 }}>{coupon.usageCount}</Td>
                          <Td>{coupon.totalOrders}</Td>
                          <Td style={{ fontWeight: 600, color: '#059669' }}>
                            {formatCurrency(coupon.totalRevenue)}
                          </Td>
                          <Td>{formatCurrency(coupon.averageOrderValue)}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </TableWrapper>

                {/* Mobile cards */}
                <MobileCardList>
                  {couponsList.map((coupon) => (
                    <CouponCard key={coupon._id}>
                      <CouponCardHeader>
                        <CodeBadge>{coupon.code}</CodeBadge>
                        <StatusBadge $active={coupon.isActive}>
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </StatusBadge>
                      </CouponCardHeader>
                      <CouponCardRow>
                        <span className="card-label">Discount</span>
                        <span className="card-value" style={{ color: '#5b4dff' }}>
                          {coupon.discountType === 'percentage'
                            ? `${coupon.discountValue}%`
                            : formatCurrency(coupon.discountValue)}
                        </span>
                      </CouponCardRow>
                      <CouponCardRow>
                        <span className="card-label">Uses</span>
                        <span className="card-value">{coupon.usageCount}</span>
                      </CouponCardRow>
                      <CouponCardRow>
                        <span className="card-label">Orders</span>
                        <span className="card-value">{coupon.totalOrders}</span>
                      </CouponCardRow>
                      <CouponCardRow>
                        <span className="card-label">Revenue</span>
                        <span className="card-value" style={{ color: '#059669' }}>
                          {formatCurrency(coupon.totalRevenue)}
                        </span>
                      </CouponCardRow>
                      <CouponCardRow>
                        <span className="card-label">Avg Order</span>
                        <span className="card-value">
                          {formatCurrency(coupon.averageOrderValue)}
                        </span>
                      </CouponCardRow>
                    </CouponCard>
                  ))}
                </MobileCardList>
              </>
            )}
          </TableCard>
        </div>

        {/* Sales Channel Breakdown */}
        <div>
          <SectionTitle>📡 Sales Channels</SectionTitle>
          <ChannelCard>
            {salesChannels.length === 0 ? (
              <EmptyState style={{ padding: '40px 20px' }}>
                <p>No channel data yet. Add a sales channel to your coupons to track here.</p>
              </EmptyState>
            ) : (
              salesChannels.map((channel) => (
                <ChannelItem key={channel._id}>
                  <div>
                    <div className="name">{channel._id || 'Unknown'}</div>
                    <ChannelBar>
                      <div
                        className="fill"
                        style={{
                          width: `${maxChannelRevenue > 0
                            ? (channel.totalRevenue / maxChannelRevenue) * 100
                            : 0}%`,
                        }}
                      />
                    </ChannelBar>
                  </div>
                  <div className="stats">
                    <div className="revenue">{formatCurrency(channel.totalRevenue)}</div>
                    <div className="orders">{channel.totalOrders} orders</div>
                  </div>
                </ChannelItem>
              ))
            )}
          </ChannelCard>
        </div>
      </SectionGrid>
    </PageContainer>
  );
}
