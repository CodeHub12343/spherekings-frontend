# Influencer/Sponsorship System - Codebase Audit

**Date:** March 25, 2026  
**Status:** ⚠️ Partial Implementation - Many Components Missing

---

## Executive Summary

The frontend supports **influencer applications** and **sponsorships**, but the system is **incomplete**. Core API services and hooks exist, but many UI components, admin pages, and notification features are missing.

---

## 1. API SERVICES & HOOKS - ✅ EXISTS

### A. Influencer Service (`src/api/services/influencerService.js`)

**Status:** ✅ Complete with 9 methods

**Available Methods:**
- `submitInfluencerApplication(applicationData)` - POST `/influencer/apply`
- `getMyApplication()` - GET `/influencer/my-application`
- `addContentLink(applicationId, contentData)` - PUT `/influencer/{id}/add-content`
- `listApplications(params)` - GET `/influencer/applications` (admin)
- `getApplication(applicationId)` - GET `/influencer/applications/{id}` (admin)
- `approveApplication(applicationId, approvalData)` - PUT `/influencer/applications/{id}/approve` (admin)
- `rejectApplication(applicationId, rejectionData)` - PUT `/influencer/applications/{id}/reject` (admin)
- `assignProduct(applicationId, {productId, trackingNumber})` - PUT `/influencer/applications/{id}/assign-product` (admin)
- `updateFulfillmentStatus(applicationId, {fulfillmentStatus, trackingNumber})` - PUT `/influencer/applications/{id}/fulfillment` (admin)

**Data Pattern:** Standard { success, data, error, errors, pagination } response format

---

### B. Sponsorship Service (`src/api/services/sponsorshipService.js`)

**Status:** ✅ Complete with 10+ methods

**Available Methods:**
- `getTiers(params)` - GET `/sponsorship/tiers` (public)
- `getTier(tierId)` - GET `/sponsorship/tiers/{tierId}` (public)
- `initiatePurchase(purchaseData)` - POST `/sponsorship/purchase`
- `getMySponsorships()` - GET `/sponsorship/my-sponsorships`
- `listRecords(params)` - GET `/sponsorship/records` (admin)
- `getRecord(recordId)` - GET `/sponsorship/records/{recordId}` (admin)
- `addVideoLink(recordId, videoData)` - PUT `/sponsorship/records/{recordId}/add-video` (admin)
- `updateStatus(recordId, statusData)` - PUT `/sponsorship/records/{recordId}/status` (admin)
- `createTier(tierData)` - POST `/sponsorship/tiers` (admin)
- `updateTier(tierId, tierData)` - PUT `/sponsorship/tiers/{tierId}` (admin)

---

### C. React Query Hooks

#### Influencer Application Hooks (`src/api/hooks/useInfluencerApplication.js`)
✅ **Status:** Complete with 8 hooks

- `useMyInfluencerApplication()` - Query with 1min stale time
- `useSubmitInfluencerApplication()` - Mutation
- `useAddContentLink()` - Mutation
- `useInfluencerApplicationList(params)` - Admin list
- `useInfluencerApplication(applicationId)` - Single detail
- `useApproveApplication()` - Admin mutation
- `useRejectApplication()` - Admin mutation
- `useAssignProduct()` - Admin mutation
- `useUpdateFulfillmentStatus()` - Admin mutation

**Cache Strategy:**
- Query keys: `['influencer', ...]` factory pattern
- Stale times: 1min (my-app), 2min (detail), 3min (detail)
- GC times: 5min-10min
- Auto-invalidation on mutations

#### Sponsorship Hooks (`src/api/hooks/useSponsorship.js`)
✅ **Status:** Complete with 8 hooks

- `useSponsorshipTiers(params)` - Query tiers
- `useSponsorshipTier(tierId)` - Single tier
- `useInitiatePurchase()` - Mutation
- `useMySponsorships()` - User's sponsorships
- `useSponsorshipRecordsList(params)` - Admin list
- `useSponsorshipRecord(recordId)` - Single record
- `useAddVideoLink()` - Admin mutation
- `useUpdateSponsorshipStatus()` - Admin mutation

---

## 2. DATABASE SCHEMA HINTS

### From Service Methods & API Calls

**Influencer Application Schema:**
```javascript
{
  _id: ObjectId,
  userId: String,
  email: String,
  name: String,
  status: 'pending' | 'approved' | 'rejected',
  fulfillmentStatus: 'pending' | 'assigned' | 'shipped' | 'delivered',
  product: {
    _id: ObjectId,
    // Product details
  },
  trackingNumber: String,
  contentLinks: Array,
  createdAt: Date,
  // More fields expected from backend
}
```

**Sponsorship Tier Schema:**
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  features: Array,
  // More fields expected
}
```

**Sponsorship Record Schema:**
```javascript
{
  _id: ObjectId,
  tierId: ObjectId,
  userId: ObjectId,
  status: String,
  videoLink: String,
  // More fields expected
}
```

---

## 3. INFLUENCER DASHBOARD - ⚠️ PARTIAL

### File: `src/app/influencer/dashboard/page.jsx`

**Status:** ✅ Partially implemented

**Currently Displays:**
- ✅ Application status badge (pending/approved/rejected)
- ✅ Fulfillment status badge (pending/assigned/shipped/delivered)
- ✅ Application date
- ✅ Personal information section (structure only)
- ✅ Debug info box with email and token status
- ✅ Empty state with link to apply

**Features:**
- Uses `useMyInfluencerApplication()` hook
- Auto-redirect if not authenticated
- Status-based messaging
- Color-coded status badges

**Missing:**
- ❌ Product details section (commenced but incomplete)
- ❌ Content links section
- ❌ Action buttons (edit, upload content, etc.)
- ❌ Product image display
- ❌ Tracking information
- ❌ Fulfillment timeline

---

## 4. ADMIN DASHBOARD - ⚠️ MINIMAL

### File: `src/app/(admin)/admin/influencer/applications/page.jsx`

**Status:** ⚠️ Partially implemented

**Currently Shows:**
- ✅ Statistics cards (total, pending, approved, rejected)
- ✅ Filter controls (status dropdown)
- ✅ Table with application list
- ✅ Table columns: Email, Name, Phone, Status, Application Date
- ✅ Action buttons: View, Approve, Reject
- ✅ Approval/Rejection modals with forms

**Features:**
- ✅ Fetches applications via axios (not using hook yet)
- ✅ Inline status badges (color-coded)
- ✅ Modal dialogs for approve/reject
- ✅ Reason field validation (10 char min for rejection)
- ✅ Error handling with try/catch

**Issues:**
- ⚠️ Uses `axios` directly instead of service/hook pattern
- ⚠️ Uses native `alert()` instead of toast notifications
- ⚠️ No loading states
- ⚠️ No pagination UI (backend supports it)
- ⚠️ No product assignment UI
- ⚠️ No fulfillment status management

**Missing Admin Pages:**
- ❌ Influencer detail view
- ❌ Product assignment page
- ❌ Fulfillment tracking
- ❌ Content links management
- ❌ Sponsorship tier management
- ❌ Sponsorship records management

---

## 5. NOTIFICATION SYSTEM - ✅ TOAST UTILITY EXISTS

### File: `src/utils/toast.js`

**Status:** ✅ Complete (but underused)

**Implementation:**
- Custom DOM-based toast system
- No external library dependencies
- Supports: 'success', 'error', 'info', 'warning' types
- Auto-dismiss with configurable duration (default 3s)

**API:**
```javascript
showToast({
  title: 'Success',
  message: 'Operation completed',
  type: 'success',      // optional
  duration: 3000        // optional
})
```

**Current Usage:**
- ⚠️ Mostly replaced by `alert()` in admin pages
- ⚠️ Not imported in influencer pages
- ❌ Inconsistent usage across application

**CSS Features:**
- Position: fixed top-right (20px, 20px)
- Colored left-border based on type
- Slide-in animation
- Auto-cleanup after duration

---

## 6. COMPONENT STRUCTURE

### Existing Components

**Sponsorship Components:**
- ✅ [src/components/sponsorship/SponsorshipTierCard.jsx](src/components/sponsorship/SponsorshipTierCard.jsx) - Displays single tier

**Admin Components:**
- ✅ [src/components/admin/AdminStatsCards.jsx](src/components/admin/AdminStatsCards.jsx)
- ✅ [src/components/admin/AffiliatesTable.jsx](src/components/admin/AffiliatesTable.jsx)
- ✅ [src/components/admin/OrdersTable.jsx](src/components/admin/OrdersTable.jsx)
- ✅ [src/components/admin/ProductsTable.jsx](src/components/admin/ProductsTable.jsx)
- ✅ [src/components/admin/StatusBadge.jsx](src/components/admin/StatusBadge.jsx)
- ✅ [src/components/admin/Pagination.jsx](src/components/admin/Pagination.jsx)

**Missing Components:**
- ❌ InfluencerApplicationForm
- ❌ InfluencerApplicationCard
- ❌ InfluencerApplicationDetailCard
- ❌ InfluencerApplicationTable
- ❌ InfluencerApplicationActions
- ❌ ProductAssignmentForm
- ❌ FulfillmentTracker
- ❌ ContentLinkUploadForm
- ❌ SponsorshipTierForm
- ❌ SponsorshipRecordsTable
- ❌ SponsorshipStatusManager
- ❌ NotificationCenter / NotificationList

---

## 7. PAGES & ROUTES

### Existing Influencer Pages

**Directory:** `src/app/influencer/`

| Route | File | Status | Functionality |
|-------|------|--------|--------------|
| `/influencer/dashboard` | `dashboard/page.jsx` | ⚠️ Partial | Status view, incomplete product section |
| `/influencer/apply` | `apply/` | ❓ Unknown | Application form (needs verification) |
| `/influencer/sponsorship` | `sponsorship/` | ❓ Unknown | Sponsorship page (needs verification) |

### Existing Admin Pages

**Directory:** `src/app/(admin)/admin/`

| Route | File | Status | Functionality |
|-------|------|--------|--------------|
| `/admin/influencer/applications` | `influencer/applications/page.jsx` | ⚠️ Partial | List, approve, reject (no hooks, raw alerts) |
| `/admin/sponsorship/` | `sponsorship/` | ❓ Unknown | Needs verification |

---

## 8. STORE MANAGEMENT

**Current Stores:** (`src/stores/`)
- ✅ authStore.js
- ✅ adminStore.js
- ✅ affiliateStore.js
- ✅ cartStore.js
- ✅ checkoutStore.js
- ✅ commissionStore.js
- ✅ orderStore.js
- ✅ payoutStore.js
- ✅ referralStore.js

**Missing:**
- ❌ influencerStore.js
- ❌ sponsorshipStore.js
- ❌ notificationStore.js

---

## 9. WHAT'S MISSING - COMPLETION CHECKLIST

### Critical Missing Features

| Feature | Priority | Impact | Status |
|---------|----------|--------|--------|
| Notification system integration | 🔴 HIGH | Users unaware of application status changes | ❌ Missing |
| Admin influencer detail view | 🔴 HIGH | Can't manage individual applications | ❌ Missing |
| Product assignment UI | 🔴 HIGH | Can't assign products to influencers | ❌ Missing |
| Fulfillment tracking | 🔴 HIGH | No visibility into product delivery | ❌ Missing |
| Toast notifications (admin) | 🔴 HIGH | Silent failures, no feedback | ❌ Unused |
| React Query hooks (admin) | 🟡 MEDIUM | Manual axios calls, no caching | ⚠️ Partial |
| Sponsorship tier management | 🟡 MEDIUM | Can't manage tiers | ❌ Missing |
| Sponsorship records table | 🟡 MEDIUM | Can't view sponsorship records | ❌ Missing |
| Error handling (admin) | 🟡 MEDIUM | Crashes on errors | ⚠️ Basic |
| Pagination UI (admin) | 🟠 LOW | Can't navigate large lists | ❌ Missing |

---

## 10. KEY INSIGHTS & RECOMMENDATIONS

### Current Architecture

**Good:**
- ✅ Consistent service/hook pattern for APIs
- ✅ React Query caching strategy implemented
- ✅ Error handling in services
- ✅ Role-based API endpoints (admin routes)
- ✅ Token-based authentication flow

**Problematic:**
- ⚠️ Admin pages don't follow service/hook pattern
- ⚠️ Native alerts instead of proper notifications
- ⚠️ Incomplete UI implementations
- ⚠️ No stores for influencer/sponsorship state
- ⚠️ Missing error boundaries
- ⚠️ Inconsistent component patterns

### To Complete the System

**Phase 1 (Critical):**
1. Create missing Zustand stores (influencerStore, sponsorshipStore)
2. Convert admin pages to use hooks instead of raw axios
3. Replace all `alert()` calls with `showToast()`
4. Complete influencer dashboard UI
5. Create admin influencer detail view

**Phase 2 (Core Features):**
1. Create product assignment form/page
2. Create fulfillment tracking component
3. Add content links upload component
4. Implement notification center/inbox
5. Complete sponsorship admin pages

**Phase 3 (Polish):**
1. Add error boundaries
2. Add loading skeletons
3. Implement pagination UI
4. Add batch operations
5. Add export/reporting

---

## 11. FILE DIRECTORY REFERENCE

```
src/
├── api/
│   ├── services/
│   │   ├── influencerService.js     ✅ 9 methods
│   │   └── sponsorshipService.js    ✅ 10+ methods
│   └── hooks/
│       ├── useInfluencerApplication.js  ✅ 8 hooks
│       └── useSponsorship.js        ✅ 8 hooks
├── app/
│   ├── (admin)/admin/
│   │   └── influencer/
│   │       └── applications/page.jsx    ⚠️ Partial
│   └── influencer/
│       └── dashboard/page.jsx           ⚠️ Partial
├── components/
│   ├── admin/                           ✅ 9 components
│   ├── influencer/                      ❌ MISSING
│   └── sponsorship/
│       └── SponsorshipTierCard.jsx      ✅ 1 component
├── stores/
│   ├── influencerStore.js               ❌ MISSING
│   └── sponsorshipStore.js              ❌ MISSING
└── utils/
    └── toast.js                         ✅ Complete (underused)
```

---

## 12. API ENDPOINTS SUMMARY

### Influencer Endpoints
```
Public:
POST   /influencer/apply                          (Submit application)
GET    /influencer/my-application                (Get user's application)
PUT    /influencer/{id}/add-content              (Add content links)

Admin:
GET    /influencer/applications                  (List all)
GET    /influencer/applications/{id}             (Get single)
PUT    /influencer/applications/{id}/approve     (Approve)
PUT    /influencer/applications/{id}/reject      (Reject)
PUT    /influencer/applications/{id}/assign-product
PUT    /influencer/applications/{id}/fulfillment (Update fulfillment)
```

### Sponsorship Endpoints
```
Public:
GET    /sponsorship/tiers                        (List tiers)
GET    /sponsorship/tiers/{id}                   (Get tier)
POST   /sponsorship/purchase                     (Create Stripe checkout)
GET    /sponsorship/my-sponsorships              (User's purchases)

Admin:
GET    /sponsorship/records                      (List all)
GET    /sponsorship/records/{id}                 (Get single)
PUT    /sponsorship/records/{id}/add-video       (Add video)
PUT    /sponsorship/records/{id}/status          (Update status)
POST   /sponsorship/tiers                        (Create tier)
PUT    /sponsorship/tiers/{id}                   (Update tier)
```

---

## Summary Statistics

| Category | Count | Status |
|----------|-------|--------|
| API Services | 2 | ✅ Complete |
| Hooks | 16 | ✅ Complete |
| Pages | 3+ | ⚠️ Partial |
| Components | 1 | ❌ Minimal |
| Stores | 0/2 | ❌ Missing |
| Admin Pages | 1 | ⚠️ Partial |
| API Endpoints | 16 | ✅ Available |

**Overall System Status:** ⚠️ **40% Complete** - Backend and API hooks exist, frontend UI is incomplete
