# System Architecture - Dynamic Booking Data

## Overview Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│                    (React/Next.js Pages)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐│
│  │  Quote Page     │  │ Service Details  │  │  Schedule Page  ││
│  │  /booking/quote │  │ /booking/.../    │  │ /booking/.../   ││
│  │                 │  │ details          │  │ schedule        ││
│  └────────┬────────┘  └────────┬─────────┘  └────────┬────────┘│
│           │                    │                      │          │
└───────────┼────────────────────┼──────────────────────┼──────────┘
            │                    │                      │
            │ Fetch Data         │ Fetch Data          │ Fetch Data
            │                    │                      │
            ▼                    ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    HELPER FUNCTIONS LAYER                        │
│               lib/supabase/booking-data.ts                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  getServiceLocations()      getCleaners()                        │
│  getAdditionalServices()    getFrequencyOptions()                │
│  getTimeSlots()             getSystemSettings()                  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  FALLBACK MECHANISM (if Supabase fails)                │     │
│  │  - FALLBACK_LOCATIONS                                   │     │
│  │  - FALLBACK_EXTRAS                                      │     │
│  │  - FALLBACK_TIME_SLOTS                                  │     │
│  │  - FALLBACK_CLEANERS                                    │     │
│  │  - FALLBACK_FREQUENCIES                                 │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                   │
└───────────────────────────┬───────────────────────────────────┬─┘
                            │                                   │
                      Success│                            Failure│
                            │                                   │
                            ▼                                   ▼
┌─────────────────────────────────────────┐     ┌──────────────────┐
│      SUPABASE DATABASE                  │     │  Use Fallback    │
│      (PostgreSQL with RLS)              │     │  Hardcoded Data  │
├─────────────────────────────────────────┤     └──────────────────┘
│                                         │
│  ┌────────────────────────────────┐    │
│  │  service_locations (34)        │    │
│  │  - id, name, slug, city        │    │
│  │  - display_order, is_active    │    │
│  └────────────────────────────────┘    │
│                                         │
│  ┌────────────────────────────────┐    │
│  │  additional_services (7)       │    │
│  │  - service_id, name, icon_name │    │
│  │  - price_modifier              │    │
│  └────────────────────────────────┘    │
│                                         │
│  ┌────────────────────────────────┐    │
│  │  time_slots (18)               │    │
│  │  - time_value, display_label   │    │
│  └────────────────────────────────┘    │
│                                         │
│  ┌────────────────────────────────┐    │
│  │  cleaners (4)                  │    │
│  │  - cleaner_id, name, rating    │    │
│  │  - bio, total_jobs             │    │
│  └────────────────────────────────┘    │
│                                         │
│  ┌────────────────────────────────┐    │
│  │  frequency_options (4)         │    │
│  │  - frequency_id, name          │    │
│  │  - discount_percentage         │    │
│  └────────────────────────────────┘    │
│                                         │
│  ┌────────────────────────────────┐    │
│  │  system_settings (6)           │    │
│  │  - setting_key, setting_value  │    │
│  │  - is_public                   │    │
│  └────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

## Data Flow Sequence

### 1. Page Load Flow

```
User visits page
      │
      ▼
Component mounts
      │
      ▼
useEffect triggers
      │
      ▼
fetchData() called
      │
      ├──────────────────────┐
      │                      │
      ▼                      ▼
Call helper function    Set loading state
      │                      
      ▼                      
lib/supabase/booking-data.ts
      │
      ▼
createClient() → Supabase
      │
      ├─────────────────┬──────────────────┐
      │                 │                  │
   SUCCESS           ERROR             OFFLINE
      │                 │                  │
      ▼                 ▼                  ▼
Return data      Log error &        Return empty array
      │          Return empty             │
      │          array                    │
      ▼                 │                  │
setState(data) ◄────────┴──────────────────┘
      │
      ▼
Check if data.length > 0
      │
      ├─────────────┬──────────────────┐
      │             │                  │
    YES            NO                  
      │             │                  
      ▼             ▼                  
Use DB data    Use FALLBACK_DATA
      │             │
      └──────┬──────┘
             │
             ▼
      Render to UI
```

### 2. Admin Update Flow

```
Admin logs into Supabase
      │
      ▼
Opens Table Editor or SQL Editor
      │
      ▼
Makes changes (INSERT/UPDATE/DELETE)
      │
      ▼
Changes saved to database
      │
      ▼
User refreshes page
      │
      ▼
New data fetched automatically
      │
      ▼
UI updates with new data
```

## Component Integration

### Quote Page
```typescript
// app/booking/quote/page.tsx

┌─────────────────────────────────────┐
│  QuotePage Component                │
├─────────────────────────────────────┤
│                                     │
│  State:                             │
│  - locations []                     │
│  - additionalServices []            │
│  - isLoadingData                    │
│                                     │
│  useEffect(() => {                  │
│    fetchData():                     │
│      - getServiceLocations()        │
│      - getAdditionalServices()      │
│    }                                │
│  }, [])                             │
│                                     │
│  Renders:                           │
│  - Location dropdown                │
│  - Additional services grid         │
│                                     │
└─────────────────────────────────────┘
```

### Service Details Page
```typescript
// app/booking/service/[type]/details/page.tsx

┌─────────────────────────────────────┐
│  ServiceDetailsPage Component       │
├─────────────────────────────────────┤
│                                     │
│  State:                             │
│  - extras []                        │
│  - timeSlots []                     │
│  - isLoadingData                    │
│                                     │
│  useEffect(() => {                  │
│    fetchData():                     │
│      - getAdditionalServices()      │
│      - getTimeSlots()               │
│    }                                │
│  }, [])                             │
│                                     │
│  Renders:                           │
│  - Extras selection grid            │
│  - Time slot dropdown               │
│                                     │
└─────────────────────────────────────┘
```

### Schedule Page
```typescript
// app/booking/service/[type]/schedule/page.tsx

┌─────────────────────────────────────┐
│  SchedulePage Component             │
├─────────────────────────────────────┤
│                                     │
│  State:                             │
│  - cleaners []                      │
│  - frequencies []                   │
│  - frequencyDiscounts {}            │
│  - defaultCity                      │
│  - isLoadingData                    │
│                                     │
│  useEffect(() => {                  │
│    fetchData():                     │
│      - getCleaners()                │
│      - getFrequencyOptions()        │
│      - getSystemSetting('city')     │
│    }                                │
│  }, [])                             │
│                                     │
│  Renders:                           │
│  - Cleaner cards                    │
│  - Frequency options                │
│  - City field (pre-filled)          │
│                                     │
└─────────────────────────────────────┘
```

## Security Layer (RLS)

```
┌─────────────────────────────────────────────────┐
│         Row Level Security (RLS)                │
├─────────────────────────────────────────────────┤
│                                                 │
│  PUBLIC USERS (Unauthenticated)                │
│  ┌───────────────────────────────────────────┐ │
│  │  ✅ SELECT where is_active = true         │ │
│  │  ❌ INSERT                                 │ │
│  │  ❌ UPDATE                                 │ │
│  │  ❌ DELETE                                 │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  AUTHENTICATED USERS (Admins)                  │
│  ┌───────────────────────────────────────────┐ │
│  │  ✅ SELECT all records                    │ │
│  │  ✅ INSERT new records                    │ │
│  │  ✅ UPDATE existing records               │ │
│  │  ✅ DELETE records                        │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Type System

```typescript
┌─────────────────────────────────────────────────┐
│         TypeScript Type Safety                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  Database Tables                                │
│       │                                         │
│       ▼                                         │
│  TypeScript Interfaces                          │
│  - ServiceLocation                              │
│  - AdditionalService                            │
│  - TimeSlot                                     │
│  - Cleaner                                      │
│  - FrequencyOption                              │
│  - SystemSetting                                │
│       │                                         │
│       ▼                                         │
│  React Components                               │
│  - Type checking                                │
│  - Autocomplete                                 │
│  - Compile-time errors                          │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Failure Handling

```
Supabase Call
      │
      ├─────────────┬─────────────┬────────────┐
      │             │             │            │
   SUCCESS      NETWORK        DATABASE     PARSE
                ERROR          ERROR         ERROR
      │             │             │            │
      ▼             ▼             ▼            ▼
Return data   Log error     Log error    Log error
      │             │             │            │
      │             └─────────────┴────────────┘
      │                       │
      │                       ▼
      │              Return empty array
      │                       │
      │                       ▼
      │              Check array.length
      │                       │
      │            ┌──────────┴──────────┐
      │            │                     │
      │          === 0                 > 0
      │            │                     │
      │            ▼                     ▼
      │      Use FALLBACK          Use Data
      │            │                     │
      └────────────┴─────────────────────┘
                   │
                   ▼
            Display to User
            (Always works!)
```

## Performance Optimization

```
┌─────────────────────────────────────────────────┐
│             Current Implementation              │
├─────────────────────────────────────────────────┤
│                                                 │
│  Page Load → Fetch Data → Cache in State       │
│                                                 │
│  - Fetched once per page load                  │
│  - Stored in component state                   │
│  - Re-fetched on page refresh                  │
│                                                 │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│          Future Optimization Options            │
├─────────────────────────────────────────────────┤
│                                                 │
│  1. SWR (Stale-While-Revalidate)               │
│     - Cache data across pages                  │
│     - Background revalidation                  │
│     - Faster page loads                        │
│                                                 │
│  2. React Query                                │
│     - Intelligent caching                      │
│     - Automatic refetching                     │
│     - Optimistic updates                       │
│                                                 │
│  3. Supabase Realtime                          │
│     - Live data updates                        │
│     - No page refresh needed                   │
│     - WebSocket connection                     │
│                                                 │
│  4. Static Generation                          │
│     - Pre-render at build time                 │
│     - Ultra-fast page loads                    │
│     - ISR for data updates                     │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│              Development                        │
├─────────────────────────────────────────────────┤
│                                                 │
│  Local Machine                                  │
│    │                                            │
│    ├─ Code Changes                             │
│    ├─ Test Migration                           │
│    └─ Verify Locally                           │
│                                                 │
└────────────────┬────────────────────────────────┘
                 │
                 ▼ git push
┌─────────────────────────────────────────────────┐
│              Git Repository                     │
├─────────────────────────────────────────────────┤
│  GitHub/GitLab/Bitbucket                        │
└────────────────┬────────────────────────────────┘
                 │
                 ▼ Auto Deploy
┌─────────────────────────────────────────────────┐
│           Hosting Platform                      │
│        (Vercel/Netlify/etc.)                    │
├─────────────────────────────────────────────────┤
│  Frontend (Next.js)                             │
└────────────────┬────────────────────────────────┘
                 │
                 ▼ API Calls
┌─────────────────────────────────────────────────┐
│              Supabase Cloud                     │
├─────────────────────────────────────────────────┤
│  - PostgreSQL Database                          │
│  - Row Level Security                           │
│  - Auto Backups                                 │
│  - Global CDN                                   │
└─────────────────────────────────────────────────┘
```

## Summary

### Key Principles

1. **Separation of Concerns**: Data separate from code
2. **Graceful Degradation**: Fallback data always available
3. **Type Safety**: Full TypeScript support
4. **Security First**: RLS enabled by default
5. **Performance**: Optimized fetching with caching
6. **Maintainability**: Clean, documented code

### Benefits

- ✅ **Zero Downtime**: Updates without deployment
- ✅ **Scalable**: Add any number of records
- ✅ **Secure**: Protected by RLS
- ✅ **Reliable**: Fallback mechanism
- ✅ **Fast**: Efficient data fetching
- ✅ **Maintainable**: Clean architecture

### Trade-offs

- ⚠️ Network dependency (mitigated by fallback)
- ⚠️ Initial fetch delay (can be optimized with caching)
- ⚠️ Requires database management knowledge (documented)

---

**Architecture Version**: 1.0.0  
**Last Updated**: December 13, 2025











