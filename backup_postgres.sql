--
-- PostgreSQL database dump
--

\restrict 6eMoev4sIjnhDnfA16WhTbyEWvAcMyRk3WThkAQIm71kVaFc1th8CbqapADeDA5

-- Dumped from database version 15.17
-- Dumped by pg_dump version 15.17

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: ActivityLocationProofType; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."ActivityLocationProofType" AS ENUM (
    'DOCUMENT',
    'MAP_COORDINATES'
);


ALTER TYPE public."ActivityLocationProofType" OWNER TO admin;

--
-- Name: BikeStatus; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."BikeStatus" AS ENUM (
    'AVAILABLE',
    'IN_USE',
    'MAINTENANCE',
    'UNAVAILABLE'
);


ALTER TYPE public."BikeStatus" OWNER TO admin;

--
-- Name: DiscountType; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."DiscountType" AS ENUM (
    'PERCENTAGE',
    'FIXED_AMOUNT'
);


ALTER TYPE public."DiscountType" OWNER TO admin;

--
-- Name: DocumentStatus; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."DocumentStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."DocumentStatus" OWNER TO admin;

--
-- Name: DocumentType; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."DocumentType" AS ENUM (
    'CNI',
    'RECEPISSE'
);


ALTER TYPE public."DocumentType" OWNER TO admin;

--
-- Name: IncidentStatus; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."IncidentStatus" AS ENUM (
    'OPEN',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED'
);


ALTER TYPE public."IncidentStatus" OWNER TO admin;

--
-- Name: RequestStatus; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."RequestStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."RequestStatus" OWNER TO admin;

--
-- Name: ResidenceProofType; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."ResidenceProofType" AS ENUM (
    'DOCUMENT',
    'MAP_COORDINATES'
);


ALTER TYPE public."ResidenceProofType" OWNER TO admin;

--
-- Name: ReviewStatus; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."ReviewStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."ReviewStatus" OWNER TO admin;

--
-- Name: RideStatus; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."RideStatus" AS ENUM (
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."RideStatus" OWNER TO admin;

--
-- Name: SubscriptionType; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."SubscriptionType" AS ENUM (
    'HOURLY',
    'DAILY',
    'WEEKLY',
    'MONTHLY'
);


ALTER TYPE public."SubscriptionType" OWNER TO admin;

--
-- Name: TransactionStatus; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."TransactionStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED',
    'CANCELLED'
);


ALTER TYPE public."TransactionStatus" OWNER TO admin;

--
-- Name: TransactionType; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."TransactionType" AS ENUM (
    'DEPOSIT',
    'WITHDRAWAL',
    'RIDE_PAYMENT',
    'REFUND',
    'DEPOSIT_RECHARGE',
    'DAMAGE_CHARGE',
    'SUBSCRIPTION_PAYMENT'
);


ALTER TYPE public."TransactionType" OWNER TO admin;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."UserRole" AS ENUM (
    'USER',
    'ADMIN',
    'SUPER_ADMIN',
    'EMPLOYEE'
);


ALTER TYPE public."UserRole" OWNER TO admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_location_proofs; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.activity_location_proofs (
    id text NOT NULL,
    "userId" text NOT NULL,
    "proofType" public."ActivityLocationProofType" NOT NULL,
    "documentFile" text,
    latitude double precision,
    longitude double precision,
    address text,
    details text,
    status public."DocumentStatus" DEFAULT 'PENDING'::public."DocumentStatus" NOT NULL,
    "rejectionReason" text,
    "reviewedBy" text,
    "reviewedAt" timestamp(3) without time zone,
    "submittedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.activity_location_proofs OWNER TO admin;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.activity_logs (
    id text NOT NULL,
    "userId" text,
    action text NOT NULL,
    resource text NOT NULL,
    "resourceId" text,
    details text,
    metadata jsonb,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.activity_logs OWNER TO admin;

--
-- Name: bikes; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.bikes (
    id text NOT NULL,
    code text NOT NULL,
    model text NOT NULL,
    status public."BikeStatus" DEFAULT 'AVAILABLE'::public."BikeStatus" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "batteryLevel" integer DEFAULT 100 NOT NULL,
    latitude double precision,
    longitude double precision,
    "locationName" text,
    equipment jsonb,
    "lastMaintenanceAt" timestamp(3) without time zone,
    "lastSeenAt" timestamp(3) without time zone,
    "qrCode" text NOT NULL,
    "gpsDeviceId" text,
    "pricingPlanId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.bikes OWNER TO admin;

--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.chat_messages (
    id text NOT NULL,
    "userId" text NOT NULL,
    message text NOT NULL,
    "isAdmin" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.chat_messages OWNER TO admin;

--
-- Name: free_days_beneficiaries; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.free_days_beneficiaries (
    id text NOT NULL,
    "ruleId" character varying(36) NOT NULL,
    "userId" character varying(191) NOT NULL,
    "daysGranted" integer NOT NULL,
    "daysRemaining" integer NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "appliedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "lastFreeDayUsedAt" timestamp(3) without time zone,
    "subscriptionPausedAt" timestamp(3) without time zone,
    "subscriptionResumedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.free_days_beneficiaries OWNER TO admin;

--
-- Name: free_days_rules; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.free_days_rules (
    id text NOT NULL,
    name character varying(36) NOT NULL,
    description text,
    "numberOfDays" integer NOT NULL,
    "startType" text DEFAULT 'ON_USE'::text NOT NULL,
    "targetType" text DEFAULT 'NEW_USERS'::text NOT NULL,
    "targetDaysSinceRegistration" integer,
    "targetMinSpend" double precision,
    "startHour" integer,
    "endHour" integer,
    "isActive" boolean DEFAULT true NOT NULL,
    "validFrom" timestamp(3) without time zone,
    "validUntil" timestamp(3) without time zone,
    "maxBeneficiaries" integer,
    "currentBeneficiaries" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.free_days_rules OWNER TO admin;

--
-- Name: identity_documents; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.identity_documents (
    id text NOT NULL,
    "userId" text NOT NULL,
    "documentType" public."DocumentType" NOT NULL,
    "frontImage" text NOT NULL,
    "backImage" text,
    "selfieImage" text,
    status public."DocumentStatus" DEFAULT 'PENDING'::public."DocumentStatus" NOT NULL,
    "rejectionReason" text,
    "reviewedBy" text,
    "reviewedAt" timestamp(3) without time zone,
    "submittedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.identity_documents OWNER TO admin;

--
-- Name: incidents; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.incidents (
    id text NOT NULL,
    "userId" text NOT NULL,
    "bikeId" text,
    type text NOT NULL,
    description text NOT NULL,
    status public."IncidentStatus" DEFAULT 'OPEN'::public."IncidentStatus" NOT NULL,
    priority text DEFAULT 'MEDIUM'::text NOT NULL,
    "resolvedAt" timestamp(3) without time zone,
    "refundAmount" double precision,
    "adminNote" text,
    "resolvedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.incidents OWNER TO admin;

--
-- Name: lock_requests; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.lock_requests (
    id text NOT NULL,
    "userId" text NOT NULL,
    "bikeId" text NOT NULL,
    "rideId" text,
    latitude double precision,
    longitude double precision,
    "returnLocation" jsonb,
    status public."RequestStatus" DEFAULT 'PENDING'::public."RequestStatus" NOT NULL,
    "requestedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "validatedAt" timestamp(3) without time zone,
    "rejectedAt" timestamp(3) without time zone,
    "validatedBy" text,
    "adminNote" text,
    "rejectionReason" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.lock_requests OWNER TO admin;

--
-- Name: maintenance_logs; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.maintenance_logs (
    id text NOT NULL,
    "bikeId" text NOT NULL,
    type text NOT NULL,
    description text NOT NULL,
    cost double precision,
    "performedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.maintenance_logs OWNER TO admin;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notifications OWNER TO admin;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.permissions (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    resource text NOT NULL,
    action text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.permissions OWNER TO admin;

--
-- Name: plan_overrides; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.plan_overrides (
    id text NOT NULL,
    "planId" text NOT NULL,
    "overTimeType" text NOT NULL,
    "overTimeValue" double precision NOT NULL,
    "hourlyStartHour" integer,
    "hourlyEndHour" integer,
    "dailyStartHour" integer,
    "dailyEndHour" integer,
    "weeklyStartHour" integer,
    "weeklyEndHour" integer,
    "monthlyStartHour" integer,
    "monthlyEndHour" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.plan_overrides OWNER TO admin;

--
-- Name: pricing_configs; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.pricing_configs (
    id text NOT NULL,
    "unlockFee" double precision DEFAULT 100 NOT NULL,
    "baseHourlyRate" double precision DEFAULT 200 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.pricing_configs OWNER TO admin;

--
-- Name: pricing_plans; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.pricing_plans (
    id text NOT NULL,
    "pricingConfigId" text,
    name text NOT NULL,
    type public."SubscriptionType" DEFAULT 'HOURLY'::public."SubscriptionType" NOT NULL,
    "hourlyRate" double precision NOT NULL,
    "dailyRate" double precision NOT NULL,
    "weeklyRate" double precision NOT NULL,
    "monthlyRate" double precision NOT NULL,
    "minimumHours" integer DEFAULT 1 NOT NULL,
    discount double precision DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    conditions jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.pricing_plans OWNER TO admin;

--
-- Name: pricing_rules; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.pricing_rules (
    id text NOT NULL,
    "pricingConfigId" text NOT NULL,
    name text NOT NULL,
    "dayOfWeek" integer,
    "startHour" integer,
    "endHour" integer,
    multiplier double precision DEFAULT 1 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.pricing_rules OWNER TO admin;

--
-- Name: pricing_tiers; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.pricing_tiers (
    id text NOT NULL,
    name text,
    "durationMinutes" integer NOT NULL,
    price double precision NOT NULL,
    "dayStartHour" integer,
    "dayEndHour" integer,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.pricing_tiers OWNER TO admin;

--
-- Name: promotion_package_relations; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.promotion_package_relations (
    id text NOT NULL,
    "promotionId" character varying(36) NOT NULL,
    "packageId" character varying(36),
    "formulaId" character varying(36),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.promotion_package_relations OWNER TO admin;

--
-- Name: promotion_plans; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.promotion_plans (
    id text NOT NULL,
    "promotionId" character varying(100) NOT NULL,
    "planId" character varying(100) NOT NULL
);


ALTER TABLE public.promotion_plans OWNER TO admin;

--
-- Name: promotions; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.promotions (
    id text NOT NULL,
    "pricingConfigId" text NOT NULL,
    name text NOT NULL,
    description text,
    "discountType" public."DiscountType" DEFAULT 'PERCENTAGE'::public."DiscountType" NOT NULL,
    "discountValue" double precision NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "usageLimit" integer,
    "usageCount" integer DEFAULT 0 NOT NULL,
    conditions jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.promotions OWNER TO admin;

--
-- Name: push_tokens; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.push_tokens (
    id text NOT NULL,
    "userId" text NOT NULL,
    token text NOT NULL,
    device text,
    platform text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.push_tokens OWNER TO admin;

--
-- Name: reservations; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.reservations (
    id text NOT NULL,
    "userId" text NOT NULL,
    "bikeId" text NOT NULL,
    "planId" text NOT NULL,
    "packageType" text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.reservations OWNER TO admin;

--
-- Name: residence_proofs; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.residence_proofs (
    id text NOT NULL,
    "userId" text NOT NULL,
    "proofType" public."ResidenceProofType" NOT NULL,
    "documentFile" text,
    latitude double precision,
    longitude double precision,
    address text,
    details text,
    status public."DocumentStatus" DEFAULT 'PENDING'::public."DocumentStatus" NOT NULL,
    "rejectionReason" text,
    "reviewedBy" text,
    "reviewedAt" timestamp(3) without time zone,
    "submittedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.residence_proofs OWNER TO admin;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.reviews (
    id text NOT NULL,
    "userId" text,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    "socialStatus" text NOT NULL,
    photo text,
    rating integer NOT NULL,
    comment text NOT NULL,
    status public."ReviewStatus" DEFAULT 'PENDING'::public."ReviewStatus" NOT NULL,
    "reviewedBy" text,
    "reviewedAt" timestamp(3) without time zone,
    "moderatorComment" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.reviews OWNER TO admin;

--
-- Name: rides; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.rides (
    id text NOT NULL,
    "userId" text NOT NULL,
    "bikeId" text NOT NULL,
    "planId" text,
    "startTime" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endTime" timestamp(3) without time zone,
    "startLatitude" double precision NOT NULL,
    "startLongitude" double precision NOT NULL,
    "endLatitude" double precision,
    "endLongitude" double precision,
    distance double precision,
    duration integer,
    cost double precision,
    status public."RideStatus" DEFAULT 'IN_PROGRESS'::public."RideStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.rides OWNER TO admin;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.role_permissions (
    id text NOT NULL,
    "roleId" character varying(36) NOT NULL,
    "permissionId" character varying(36) NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO admin;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.roles (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.roles OWNER TO admin;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    "userId" text NOT NULL,
    token text NOT NULL,
    device text,
    location text,
    "ipAddress" text,
    "userAgent" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO admin;

--
-- Name: settings; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.settings (
    id text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.settings OWNER TO admin;

--
-- Name: subscription_formulas; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.subscription_formulas (
    id text NOT NULL,
    "packageId" character varying(191) NOT NULL,
    name text NOT NULL,
    description text,
    "formulaType" text DEFAULT 'TIME_WINDOW'::text NOT NULL,
    "numberOfDays" integer DEFAULT 1 NOT NULL,
    "dayStartHour" integer,
    "dayEndHour" integer,
    "chargeAfterHours" boolean DEFAULT false NOT NULL,
    "afterHoursPrice" double precision,
    "afterHoursType" text DEFAULT 'FIXED_PRICE'::text,
    "maxRideDurationHours" double precision,
    price double precision NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.subscription_formulas OWNER TO admin;

--
-- Name: subscription_packages; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.subscription_packages (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.subscription_packages OWNER TO admin;

--
-- Name: subscription_promotion_rules; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.subscription_promotion_rules (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "discountType" text DEFAULT 'PERCENTAGE'::text NOT NULL,
    "discountValue" double precision NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "usageLimit" integer,
    "usageCount" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.subscription_promotion_rules OWNER TO admin;

--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.subscriptions (
    id text NOT NULL,
    "userId" character varying(191) NOT NULL,
    "packageId" character varying(191) DEFAULT ''::character varying,
    "formulaId" character varying(191) DEFAULT ''::character varying,
    "planId" character varying(191),
    type public."SubscriptionType" DEFAULT 'DAILY'::public."SubscriptionType" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "dayResetTime" timestamp(3) without time zone,
    "currentDay" integer DEFAULT 1 NOT NULL,
    "usedRideMinutes" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.subscriptions OWNER TO admin;

--
-- Name: transactions; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.transactions (
    id text NOT NULL,
    "walletId" text NOT NULL,
    type public."TransactionType" NOT NULL,
    amount double precision NOT NULL,
    fees double precision DEFAULT 0 NOT NULL,
    "totalAmount" double precision NOT NULL,
    status public."TransactionStatus" DEFAULT 'PENDING'::public."TransactionStatus" NOT NULL,
    "paymentMethod" text,
    "paymentProvider" text,
    "externalId" text,
    metadata jsonb,
    "requestedBy" text,
    "validatedBy" text,
    "validatedAt" timestamp(3) without time zone,
    "rejectionReason" text,
    "canModify" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.transactions OWNER TO admin;

--
-- Name: unlock_requests; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.unlock_requests (
    id text NOT NULL,
    "userId" text NOT NULL,
    "bikeId" text NOT NULL,
    "reservationId" text,
    status public."RequestStatus" DEFAULT 'PENDING'::public."RequestStatus" NOT NULL,
    "requestedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "validatedAt" timestamp(3) without time zone,
    "rejectedAt" timestamp(3) without time zone,
    "validatedBy" text,
    "adminNote" text,
    "rejectionReason" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.unlock_requests OWNER TO admin;

--
-- Name: user_preferences; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.user_preferences (
    id text NOT NULL,
    "userId" text NOT NULL,
    "rideNotifications" boolean DEFAULT true NOT NULL,
    "promotionalNotifications" boolean DEFAULT true NOT NULL,
    "securityNotifications" boolean DEFAULT true NOT NULL,
    "systemNotifications" boolean DEFAULT true NOT NULL,
    "emailNotifications" boolean DEFAULT true NOT NULL,
    "pushNotifications" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.user_preferences OWNER TO admin;

--
-- Name: users; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    phone text,
    address text,
    avatar text,
    role public."UserRole" DEFAULT 'USER'::public."UserRole" NOT NULL,
    status text DEFAULT 'pending_verification'::text NOT NULL,
    "isActive" boolean DEFAULT false NOT NULL,
    "emailVerified" boolean DEFAULT false NOT NULL,
    "emailVerificationToken" text,
    "emailVerificationExpires" timestamp(3) without time zone,
    "phoneVerified" boolean DEFAULT false NOT NULL,
    "phoneVerificationCode" text,
    "phoneVerificationExpires" timestamp(3) without time zone,
    "phoneVerifiedBy" text,
    "phoneVerifiedAt" timestamp(3) without time zone,
    "accountVerified" boolean DEFAULT false NOT NULL,
    "accountVerifiedAt" timestamp(3) without time zone,
    "accountVerifiedBy" text,
    language text DEFAULT 'fr'::text NOT NULL,
    "depositBalance" double precision DEFAULT 0 NOT NULL,
    "depositExemptionUntil" timestamp(3) without time zone,
    "depositExemptionGrantedBy" text,
    "depositExemptionGrantedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "roleId" text
);


ALTER TABLE public.users OWNER TO admin;

--
-- Name: wallets; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.wallets (
    id text NOT NULL,
    "userId" text NOT NULL,
    balance double precision DEFAULT 0 NOT NULL,
    deposit double precision DEFAULT 0 NOT NULL,
    "negativeBalance" double precision DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.wallets OWNER TO admin;

--
-- Data for Name: activity_location_proofs; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.activity_location_proofs (id, "userId", "proofType", "documentFile", latitude, longitude, address, details, status, "rejectionReason", "reviewedBy", "reviewedAt", "submittedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.activity_logs (id, "userId", action, resource, "resourceId", details, metadata, "ipAddress", "userAgent", "createdAt") FROM stdin;
aa802cb6-e574-4338-b657-04acca5694ee	\N	VIEW	SETTINGS		Viewed application settings	null	162.158.214.140	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-25 17:28:18.137
0ec6ca54-f68d-4f2e-80dc-41b7a29ddf3b	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 08:04:32.574
89f62b2a-94a5-44ed-943e-0ded4f176f30	3c695091-d0de-4f35-a124-de6079a518d0	LOGIN	AUTH	3c695091-d0de-4f35-a124-de6079a518d0	User logged in successfully	{"email": "admin@freebike.cm"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-25 19:44:48.084
c158b699-5661-417b-a436-6f10cd6e6d22	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	pricing		Attempted read on pricing without permission	{"userPermissions": [], "requiredPermission": "pricing:read"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-25 19:44:48.933
5f8940f1-1119-489b-95a3-8ef78994b56a	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-25 19:44:48.953
4d1ecd77-d61d-415b-bfa7-a13d2eb7fd5b	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	pricing		Attempted read on pricing without permission	{"userPermissions": [], "requiredPermission": "pricing:read"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-25 19:44:49.338
a7b0b690-68e5-4ccb-9e31-6917697c9931	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PROFILE	3c695091-d0de-4f35-a124-de6079a518d0	User viewed their profile	null	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-25 19:45:07.709
bc84973c-021a-4a39-a911-7bbdf859e759	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-25 19:45:08.347
ac70f79b-2233-40fa-9145-0829e51b77dd	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-25 19:45:08.538
c79c616d-abfa-48e1-95b2-02bae963fd69	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	subscriptions		Attempted read on subscriptions without permission	{"userPermissions": [], "requiredPermission": "subscriptions:read"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-25 19:45:11.602
6ea7ea7d-feaf-41e5-bb53-7d8402268cb4	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PROFILE	3c695091-d0de-4f35-a124-de6079a518d0	User viewed their profile	null	172.69.37.137	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 09:12:47.579
3f00f674-4afe-49f7-bf91-282ca453e176	\N	VIEW	SETTINGS		Viewed application settings	null	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 10:46:59.554
b44774b5-0e04-47f5-8c0c-e03248015cb0	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed admin dashboard stats	null	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 10:47:00.719
2ac3fb9d-5946-4b11-8404-36025a2fcd7e	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 10:47:00.728
76a54b11-c498-4e52-a5e8-848e2fd3d7f2	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed complete dashboard	{"totalBikes": 11, "totalRides": 0, "totalUsers": 6}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 09:11:44.66
4b601920-cb0e-487f-a272-bb254c06c990	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed complete dashboard	{"totalBikes": 11, "totalRides": 0, "totalUsers": 6}	172.69.37.137	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 09:12:25.118
49ec27f0-06a8-4b13-bbee-3271a48edff5	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed admin dashboard stats	null	172.69.37.136	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 09:12:25.987
c8257338-aeba-4ba7-a6b2-b1e5f81feba4	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	172.69.37.137	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 09:12:26.179
ef6a9d88-166e-4678-9f09-43d69e353752	\N	VIEW	SETTINGS		Viewed application settings	null	172.69.37.137	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 09:12:48.428
b2aba0d5-58c2-461e-893f-c4fc39aa422f	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed admin dashboard stats	null	172.69.37.137	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 09:12:49.451
b0e4af1d-8482-4d7d-8c15-bb460e6b08bc	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed complete dashboard	{"totalBikes": 11, "totalRides": 0, "totalUsers": 6}	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 10:46:59.846
3e14b3fc-4a93-4ef4-8806-b5e705aac2a1	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed admin dashboard stats	null	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 09:11:45.061
e0f331ff-052f-406d-b7f9-ffd5a50c8757	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	INCIDENTS		Viewed incidents list (page 1, status: OPEN)	{"page": 1, "limit": 5, "total": 0, "status": "OPEN"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 09:11:45.178
be4e900b-ccf0-48d7-b4f3-d102dd1638e0	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 11}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 09:11:49.214
198c5448-9b45-42a7-90d3-3ea8b92a523c	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PROFILE	3c695091-d0de-4f35-a124-de6079a518d0	User viewed their profile	null	172.69.37.136	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 09:12:23.914
86db9bb2-35aa-42e0-b51b-9c509938835b	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	INCIDENTS		Viewed incidents list (page 1, status: OPEN)	{"page": 1, "limit": 5, "total": 0, "status": "OPEN"}	172.69.37.137	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 09:12:25.995
6de8ef25-7c02-46fb-b3cd-84345fe39003	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-25 19:44:48.876
68db2dad-5ac6-440b-8c9c-65a2c84cbf4e	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	subscriptions		Attempted read on subscriptions without permission	{"userPermissions": [], "requiredPermission": "subscriptions:read"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-25 19:44:48.918
22bbf9c7-18f2-40a1-8f71-292829277c5a	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	pricing		Attempted read on pricing without permission	{"userPermissions": [], "requiredPermission": "pricing:read"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-25 19:44:48.933
262b32e4-e50b-4c43-b419-03e955f7bd6b	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	pricing		Attempted read on pricing without permission	{"userPermissions": [], "requiredPermission": "pricing:read"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-25 19:45:17.472
98dec797-2e71-4237-ba60-24a2e0b283e9	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	wallet		Attempted read on wallet without permission	{"userPermissions": [], "requiredPermission": "wallet:read"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-25 19:45:40.037
63bc0438-5fae-41bd-804c-339fbd9a2d37	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	wallet		Attempted read on wallet without permission	{"userPermissions": [], "requiredPermission": "wallet:read"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-25 19:45:40.044
1980b04f-f0fe-4bc2-9cea-15fef41b8e76	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-25 19:46:03.662
3ae15525-305a-499b-b64c-fa1059045009	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	subscriptions		Attempted read on subscriptions without permission	{"userPermissions": [], "requiredPermission": "subscriptions:read"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-25 19:46:03.673
5c760e20-c471-4b3e-8687-de267d500f0c	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	pricing		Attempted read on pricing without permission	{"userPermissions": [], "requiredPermission": "pricing:read"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-25 19:46:03.738
48db262e-08b1-4045-8e5f-0d6d40bc5071	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PROFILE	3c695091-d0de-4f35-a124-de6079a518d0	User viewed their profile	null	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 10:23:50.932
ff236609-63fb-4129-b4a9-25a41356be2d	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed complete dashboard	{"totalBikes": 11, "totalRides": 0, "totalUsers": 6}	172.69.37.137	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 09:12:48.779
8ac94515-62b7-4b6d-93f4-86f34928ece3	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	INCIDENTS		Viewed incidents list (page 1, status: OPEN)	{"page": 1, "limit": 5, "total": 0, "status": "OPEN"}	172.69.37.137	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 09:12:49.448
56a6c895-a9c5-4ed8-8752-e918829dca29	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	172.69.37.137	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 09:12:49.487
552a282a-40dd-4f5a-bbbb-c5802f2dd475	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 11}	172.69.37.137	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 09:12:51.927
bc41f1d1-ad65-4dcc-a1db-25bc3ec3861e	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PROFILE	3c695091-d0de-4f35-a124-de6079a518d0	User viewed their profile	null	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 12:08:02.563
e89155e5-9191-4fd9-b7e8-8266a429a82b	\N	VIEW	SETTINGS		Viewed application settings	null	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 12:08:03.884
cd5495ea-3b46-4f67-98d3-abe2fc79be91	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PROFILE	3c695091-d0de-4f35-a124-de6079a518d0	User viewed their profile	null	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 09:39:49.849
b965ce54-cbe7-4fb5-93f9-09c385a37f08	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 09:39:50.865
3b0b5993-e943-40b9-8907-e92329d3b363	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed complete dashboard	{"totalBikes": 11, "totalRides": 0, "totalUsers": 6}	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 12:08:04.154
fac96c54-acb5-43d9-a307-868ea9c5f412	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed admin dashboard stats	null	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 12:08:04.975
dff0e4cb-dcd8-4463-8290-6bb4488bc4b4	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 12:08:05.104
ca44e64b-7949-495a-8756-f917a03b4227	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 11}	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 12:08:08.809
9d8234bf-a9f8-4a9e-998e-285d1f20e4c0	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed complete dashboard	{"totalBikes": 11, "totalRides": 0, "totalUsers": 6}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 09:39:50.899
11058e27-1afa-4380-aa5f-bef87605fbc7	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	pricing		Attempted read on pricing without permission	{"userPermissions": [], "requiredPermission": "pricing:read"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-25 19:45:17.414
65879126-bddf-4c5c-af84-43a0871a4e9b	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	pricing		Attempted read on pricing without permission	{"userPermissions": [], "requiredPermission": "pricing:read"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-25 19:45:17.463
fffe5600-1262-43c2-9082-fe35ff0e32ec	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	wallet		Attempted view_transactions on wallet without permission	{"userPermissions": [], "requiredPermission": "wallet:view_transactions"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-25 19:45:40.035
01b7ce36-cfe7-4d8d-9fea-9a0349cdf0ca	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	pricing		Attempted read on pricing without permission	{"userPermissions": [], "requiredPermission": "pricing:read"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-25 19:46:03.751
6ffb6875-2978-4252-912d-11a7f203a540	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	pricing		Attempted read on pricing without permission	{"userPermissions": [], "requiredPermission": "pricing:read"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-25 19:46:04.113
fad5b102-f5b9-4028-af5e-c38749ba62f4	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	wallet		Attempted manage on wallet without permission	{"userPermissions": [], "requiredPermission": "wallet:manage"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-25 19:46:05.873
0bc95bde-b50e-40dc-b0e3-068cce9f2c54	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	wallet		Attempted read on wallet without permission	{"userPermissions": [], "requiredPermission": "wallet:read"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-25 19:46:05.879
d7acf8b4-f978-4888-9a42-19395286bf76	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES		Viewed bikes list (page 1, status: all)	{"page": 1, "count": 9, "limit": 9}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-25 19:48:24.803
55e54e2b-94c5-42d5-9df0-dd5d52c01030	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 10:23:51.603
82422822-5c63-4c83-add0-f89ac57183f2	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 10:23:52.009
84e74e2b-f4c3-4947-bc4f-3f3c29ca8bab	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	incidents		Attempted read on incidents without permission	{"userPermissions": [], "requiredPermission": "incidents:read"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 10:23:52.013
fbcb6df1-6fc8-423b-b15d-44fca0b34f58	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 09:39:51.698
55c9b437-7ef0-4b9b-93ad-5262e40517ba	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed admin dashboard stats	null	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 09:39:51.729
2314cd18-424a-4d9c-a96e-6a0e77d37b50	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	INCIDENTS		Viewed incidents list (page 1, status: OPEN)	{"page": 1, "limit": 5, "total": 0, "status": "OPEN"}	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 12:08:04.976
322fea73-bbd5-4d6c-91bc-cc73b878cc60	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	INCIDENTS		Viewed incidents list (page 1, status: OPEN)	{"page": 1, "limit": 5, "total": 0, "status": "OPEN"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 09:39:51.722
5a050d95-4ae5-4707-bb46-0c3b590e9a7a	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 11}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 09:39:53.81
318a8f4a-6a6b-4d3d-a053-a17457de1c07	3c695091-d0de-4f35-a124-de6079a518d0	LOGIN	AUTH	3c695091-d0de-4f35-a124-de6079a518d0	User logged in successfully	{"email": "admin@freebike.cm"}	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 13:05:26.283
16f646ea-3647-4a59-b982-95708c6474d0	\N	VIEW	SETTINGS		Viewed application settings	null	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 13:05:27.455
41ac6c7f-7497-4878-ab42-7351038f5200	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 13:05:28.926
197c57ab-e02f-443a-bb65-a9fac92c5840	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	INCIDENTS		Viewed incidents list (page 1, status: OPEN)	{"page": 1, "limit": 5, "total": 0, "status": "OPEN"}	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 13:05:28.933
74e66a2c-f4e7-48f8-a659-98ccc0a7738e	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 11}	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 13:05:34.17
36be44d3-170b-4ba0-9175-f7dae66a1f77	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES		Viewed bikes list (page 1, status: all)	{"page": 1, "count": 9, "limit": 9}	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 13:05:50.659
eb429b98-a106-41ea-9493-8c9b75e367a0	\N	VIEW	SETTINGS		Viewed application settings	null	172.69.65.26	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36	2026-04-25 21:06:39.642
fd01bee0-d4de-4deb-baa5-8264b4d4363f	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 10:23:51.607
e13b7ce9-976f-4983-a58b-399aa1598606	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 10:23:52.021
523a97f8-fb4c-422d-a9c6-6f95f3e9d5b8	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PROFILE	3c695091-d0de-4f35-a124-de6079a518d0	User viewed their profile	null	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 11:54:27.861
7238702d-1c42-470a-a753-73337c997475	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 11:54:29.673
f5fbd50e-e8e9-4484-9d57-6d30e1fc8cc8	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed complete dashboard	{"totalBikes": 11, "totalRides": 0, "totalUsers": 6}	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 13:05:28.086
5848d34f-82c5-40df-9970-0146d3db31d5	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 11:54:28.898
570640b0-7cc7-4130-98a7-42cad36c9c8e	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	INCIDENTS		Viewed incidents list (page 1, status: OPEN)	{"page": 1, "limit": 5, "total": 0, "status": "OPEN"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 11:54:29.674
a0add366-98ae-4251-9727-4e3e2bfdc706	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed admin dashboard stats	null	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 13:05:28.926
2f400dd5-9d30-4cbb-a554-64448b651491	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed complete dashboard	{"totalBikes": 11, "totalRides": 0, "totalUsers": 6}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 11:54:29.172
6a238d47-2835-4795-8793-532b6bdccdf6	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed admin dashboard stats	null	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 11:54:29.68
9f662f43-fef6-4815-a913-1f5350f8eea5	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-26 07:08:14.532
7eb5817a-7738-489f-9763-d0130566f338	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	bikes		Attempted read on bikes without permission	{"userPermissions": [], "requiredPermission": "bikes:read"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 10:23:52.19
7e80c81a-a2ba-435b-a5ac-87a3587d0b56	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 11}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 11:54:34.123
46807cdc-10d8-492a-82eb-916c894ad529	\N	VIEW	SETTINGS		Viewed application settings	null	104.23.229.14	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.3	2026-04-20 18:31:08.762
29549cb0-813a-4568-b8ef-4fa706d56c84	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES		Viewed bikes list (page 1, status: all)	{"page": 1, "count": 9, "limit": 9}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-26 07:08:15.757
d9409d9c-c995-428f-bbf1-afeeb158049f	3c695091-d0de-4f35-a124-de6079a518d0	LOGOUT	AUTH	3c695091-d0de-4f35-a124-de6079a518d0	User logged out successfully	null	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 10:32:37.843
95caeacd-6366-47a4-a875-30b21fe9369a	3c695091-d0de-4f35-a124-de6079a518d0	LOGIN	AUTH	3c695091-d0de-4f35-a124-de6079a518d0	User logged in successfully	{"email": "admin@freebike.cm"}	172.68.134.32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 10:34:35.977
76b487b0-f05f-41e1-89ee-0014dfc0a8bc	3c695091-d0de-4f35-a124-de6079a518d0	LOGIN	AUTH	3c695091-d0de-4f35-a124-de6079a518d0	User logged in successfully	{"email": "admin@freebike.cm"}	104.22.76.145	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 11:07:45.555
e1774953-be1c-4b6d-ba5a-7da28332b50f	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	bikes		Attempted read on bikes without permission	{"userPermissions": [], "requiredPermission": "bikes:read"}	104.22.76.145	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 11:07:47.782
da0b500e-1099-4d22-a59e-817ac798c5e9	\N	VIEW	SETTINGS		Viewed application settings	null	162.158.122.178	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 10:34:36.817
fb420093-dfb5-48e9-9f1e-ea37deff28ae	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	162.158.122.177	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 10:34:36.914
b471c7eb-343b-46ad-b39b-44f6fa6c9ada	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	162.158.122.178	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 10:34:37.734
15871686-69e0-42dd-8e6b-caa73fec37cc	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	162.158.122.177	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 10:34:37.87
cec3cc8a-5055-49eb-8106-bf9ee8032b60	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	incidents		Attempted read on incidents without permission	{"userPermissions": [], "requiredPermission": "incidents:read"}	162.158.122.178	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 10:34:37.912
bb52f14d-812d-44bc-9f92-ae8bd6413ca7	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	bikes		Attempted read on bikes without permission	{"userPermissions": [], "requiredPermission": "bikes:read"}	162.158.122.178	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 10:34:38.417
cb93f973-54a0-4700-b8e9-5a82321bc321	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	104.22.76.144	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 11:07:46.153
eb977b63-6f55-4011-be9c-ecb20646d1b0	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.76.145	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 11:07:46.161
07e374b3-4bc5-4d85-b932-f13603232bc4	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	incidents		Attempted read on incidents without permission	{"userPermissions": [], "requiredPermission": "incidents:read"}	104.22.76.145	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 11:07:47.78
945eae2c-3676-4394-aff4-4026a56f7d85	3c695091-d0de-4f35-a124-de6079a518d0	LOGIN	AUTH	3c695091-d0de-4f35-a124-de6079a518d0	User logged in successfully	{"email": "admin@freebike.cm"}	172.69.112.183	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-28 13:33:04.204
c88e68d4-6675-49c2-9983-50ef781cc7fb	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	104.22.76.144	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 11:07:47.784
54a6a8df-0074-44f5-a262-d519db415f5f	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	104.22.76.145	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 11:07:47.918
0bcf0bea-be1d-41cb-9286-23c0787bdd86	\N	VIEW	SETTINGS		Viewed application settings	null	172.69.112.148	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-28 13:33:05.212
44e807a7-5abd-4e78-9bff-86b015da2249	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	172.69.112.148	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-28 13:33:05.568
2d869c7e-ebff-48b5-a1cd-adc747d863ce	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	172.69.112.148	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-28 13:33:06.329
2f6d5f1e-ecdd-4ead-9e06-b4e1815a7930	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	172.69.112.148	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-28 13:33:06.388
0116786f-1c3b-4f67-b21f-f26a6eef989b	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PROFILE	3c695091-d0de-4f35-a124-de6079a518d0	User viewed their profile	null	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-26 12:26:53.416
4dd757a9-8f14-416f-900b-ec4fcc58441f	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES		Viewed bikes list (page 1, status: all)	{"page": 1, "count": 9, "limit": 9}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-26 12:26:56.518
83704366-d023-4a68-913c-5e826e0825d9	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	incidents		Attempted read on incidents without permission	{"userPermissions": [], "requiredPermission": "incidents:read"}	172.69.112.148	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-28 13:33:06.4
4a240ba6-b53f-4aae-9882-914c53fb64a7	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	bikes		Attempted read on bikes without permission	{"userPermissions": [], "requiredPermission": "bikes:read"}	172.69.112.149	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-28 13:33:06.582
81dfa980-55b0-4c74-860f-2ec689e5438a	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-26 12:26:55.928
222b9dc1-0931-4341-b185-33cb42830cb8	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.20.211	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.7390.0 Safari/537.36	2026-04-28 15:02:34.097
cf4115e8-6cfe-429d-afa5-ea6fe6e5058b	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.17.46	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.7390.0 Safari/537.36	2026-04-28 15:02:34.348
82026889-80ac-427b-b766-45fb66d185ed	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PROFILE	3c695091-d0de-4f35-a124-de6079a518d0	User viewed their profile	null	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 15:02:49.29
3acafdfc-3471-4941-a3ac-ad070133af54	\N	VIEW	SETTINGS		Viewed application settings	null	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 15:02:50.136
0a6acfdf-d853-4723-97e5-23a4e7562eed	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 15:02:51.276
1cd4970b-0eff-472a-a5dc-e9fcf2155554	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	incidents		Attempted read on incidents without permission	{"userPermissions": [], "requiredPermission": "incidents:read"}	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 15:02:51.449
b20d67b5-60c7-4955-be30-42c3868b690e	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	bikes		Attempted read on bikes without permission	{"userPermissions": [], "requiredPermission": "bikes:read"}	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 15:02:51.465
6d36698e-eb82-422c-8a5f-cad0aef7c172	3c695091-d0de-4f35-a124-de6079a518d0	LOGIN	AUTH	3c695091-d0de-4f35-a124-de6079a518d0	User logged in successfully	{"email": "admin@freebike.cm"}	104.22.76.145	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 13:34:48.119
476f078f-3bef-4023-9a9a-389e8091a7ab	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.76.145	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 13:34:48.643
9f0755f4-137f-4df9-81a8-bcfc38986ae0	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	104.22.76.145	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 13:34:48.767
5fc2b42f-b6fd-4f84-b65c-b760028e36b9	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	104.22.76.145	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 13:34:49.23
be0054fb-c298-423f-9dd5-cd3b4b2d4850	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	bikes		Attempted read on bikes without permission	{"userPermissions": [], "requiredPermission": "bikes:read"}	104.22.76.145	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 13:34:49.346
797ecda5-9998-4ecb-9f37-04aa0ad24ff3	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PROFILE	3c695091-d0de-4f35-a124-de6079a518d0	User viewed their profile	null	104.22.76.144	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 13:34:57.366
963dff07-6179-4286-9e66-77706e8136b5	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.76.144	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 13:35:55.585
2730e1bd-9baa-407f-91e0-d94d90e95f0b	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	104.22.76.144	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 13:35:56.072
eab3c58e-f381-413c-babf-3be28eb07487	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 15:02:50.431
495c629e-a2ac-4107-8441-c2d963454890	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 15:02:51.258
68da72c5-6523-4695-8f7b-cfb88d6a5155	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	incidents		Attempted read on incidents without permission	{"userPermissions": [], "requiredPermission": "incidents:read"}	104.22.76.145	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 13:34:49.228
9aa9a936-8df4-49d9-8502-a56165fdc587	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	104.22.76.145	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 13:34:58.004
f10ba0dd-cc6e-4121-8621-1ee1d72401bb	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	104.22.76.145	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 13:34:58.475
d7767430-182f-4e68-b3d8-0245a44d0065	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	104.22.76.145	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 13:34:58.586
d93ad214-5b89-485e-8e07-a48cf8557f98	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	104.22.76.144	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 13:35:32.847
5697fb5d-2ef0-427a-8181-193d85c8e869	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PROFILE	3c695091-d0de-4f35-a124-de6079a518d0	User viewed their profile	null	104.22.76.145	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 13:35:54.925
3d21e341-d93c-4098-be02-8b84470c9b7c	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	104.22.76.145	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 13:35:55.584
f4d05f75-5b60-4cd0-a066-e78b2704d159	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	104.22.76.145	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 13:35:56.093
831f82c6-4ccc-4d2d-aff3-1209817c2128	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	bikes		Attempted read on bikes without permission	{"userPermissions": [], "requiredPermission": "bikes:read"}	104.22.76.144	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 13:35:56.103
9be70191-e66e-408a-b12e-66964b3f99fc	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	incidents		Attempted read on incidents without permission	{"userPermissions": [], "requiredPermission": "incidents:read"}	104.22.76.144	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 13:35:56.213
9d3d085d-2a4a-4016-96e6-4eca942ba71f	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PROFILE	3c695091-d0de-4f35-a124-de6079a518d0	User viewed their profile	null	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 15:47:22.674
bf5333b1-4612-46a3-a143-6252f824e3c4	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 15:47:24.495
c56771b9-7b76-48e7-b21c-4938df4d8620	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	104.22.76.145	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 13:34:49.269
55bf6bc2-266c-41be-b2fe-a572821a9af7	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.76.145	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 13:34:58.004
06a5e11b-791c-486c-8019-87509ceba951	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	incidents		Attempted read on incidents without permission	{"userPermissions": [], "requiredPermission": "incidents:read"}	104.22.76.144	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 13:34:58.431
7ecb6c31-b9ae-44c4-8c51-ffa77822d6fe	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	bikes		Attempted read on bikes without permission	{"userPermissions": [], "requiredPermission": "bikes:read"}	104.22.76.145	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 13:34:58.454
9a82f2a6-612c-4a26-8b33-e4d613f08061	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES		Viewed bikes list (page 1, status: all)	{"page": 1, "count": 9, "limit": 9}	104.22.76.145	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 13:35:12.117
a771614b-de6b-4684-bfb0-45f4c5e00ffd	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	104.22.76.145	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 13:35:32.215
e5356306-e95e-4bf1-be77-973dc34efa1f	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	104.22.76.145	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 13:35:32.643
bcc0e8a4-f563-4875-aa32-008d4d339fb0	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	incidents		Attempted read on incidents without permission	{"userPermissions": [], "requiredPermission": "incidents:read"}	104.22.76.144	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 13:35:32.813
933522c4-fdac-43b1-9ea3-3886ea36e84d	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	bikes		Attempted read on bikes without permission	{"userPermissions": [], "requiredPermission": "bikes:read"}	104.22.76.145	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 13:35:32.827
29c006ad-0e4f-4b53-8d1c-cc74517bfaf2	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.76.144	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 13:36:17.336
7c03356f-f342-4528-93ae-2495b84b76ce	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PROFILE	3c695091-d0de-4f35-a124-de6079a518d0	User viewed their profile	null	104.22.76.145	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 13:36:17.384
06a2bc92-b689-40c8-a50d-270c6569771a	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 15:47:23.369
8191f3db-aa21-4827-9018-aaf9a15d74b7	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 15:47:23.55
90ec12fb-fbb4-4348-8d35-512b2703dde4	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 15:47:24.252
732cdb85-a021-41f2-8341-0b6b9eabeaec	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	bikes		Attempted read on bikes without permission	{"userPermissions": [], "requiredPermission": "bikes:read"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 15:47:24.299
6dd8018a-7e9a-466b-bbbc-0c51b066eccd	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	incidents		Attempted read on incidents without permission	{"userPermissions": [], "requiredPermission": "incidents:read"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 15:47:24.409
ae340259-a6a0-4eb9-b890-a18e60bf82c8	\N	VIEW	SETTINGS		Viewed application settings	null	108.162.246.157	Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/136.0.0.0 Safari/537.36	2026-04-26 18:03:53.412
72176dc1-2d6c-4541-b624-9411b26c13f0	\N	VIEW	SETTINGS		Viewed application settings	null	104.23.213.92	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0	2026-04-28 21:44:33.904
3ce6f735-423d-4329-b384-a0cf08dbca2b	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.76.139	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 19:08:56.975
b0dbc2b1-0b94-425e-a39a-7fc7cd53c9bf	3c695091-d0de-4f35-a124-de6079a518d0	LOGIN	AUTH	3c695091-d0de-4f35-a124-de6079a518d0	User logged in successfully	{"email": "admin@freebike.cm"}	104.22.76.144	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 19:09:28.991
bd357d81-898d-41f3-8da0-2359e25624ed	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	104.22.76.145	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 19:09:29.78
426ccc2c-855c-455e-98aa-7d447bf2de94	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.76.144	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 19:09:29.797
b515fa40-6efe-429c-bd26-0efe06379b35	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	incidents		Attempted read on incidents without permission	{"userPermissions": [], "requiredPermission": "incidents:read"}	104.22.76.145	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 19:09:30.234
ec0eaf1e-9e0c-4f2c-8a5e-474a95aa5dc3	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	104.22.76.144	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 19:09:30.26
9d527e6b-0df7-4b75-8ee0-c4b61ade7f13	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	bikes		Attempted read on bikes without permission	{"userPermissions": [], "requiredPermission": "bikes:read"}	104.22.76.144	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 19:09:30.683
c863c275-501d-42b4-b9c7-f7be2c283e02	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.76.145	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 19:09:09.865
d8412965-ddb3-40c3-9c39-439a081f4c53	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	104.22.76.144	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-26 19:09:30.25
de8bee03-b752-4658-a523-e6415543eaf4	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 0}	162.158.214.133	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 19:07:02.902
258b483c-eca0-4aa9-b77b-3dc43a40b0c5	\N	VIEW	SETTINGS		Viewed application settings	null	162.158.214.132	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 19:09:10.66
667a5159-c5c4-48c5-bad7-9d92df6f506e	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PRICING	31c654aa-ee98-4247-a65b-7dcaa1816008	Viewed pricing configuration	null	162.158.214.132	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 19:09:11.071
0db76f7f-727b-4a43-8161-fcec6a91f316	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed admin dashboard stats	null	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 15:12:46.478
30afe162-6369-4ce4-b295-3d73838f75df	\N	VIEW	SETTINGS		Viewed application settings	null	162.158.214.141	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-26 22:40:59.061
57a25dd2-4b12-46ae-9424-36a739a820d7	3c695091-d0de-4f35-a124-de6079a518d0	LOGIN	AUTH	3c695091-d0de-4f35-a124-de6079a518d0	User logged in successfully	{"email": "admin@freebike.cm"}	162.158.214.133	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 12:18:31.391
f7fc2f39-1d09-43bb-a6b2-1c7a51e57c1b	\N	VIEW	SETTINGS		Viewed application settings	null	162.158.214.133	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 12:18:32.283
98044858-7dbc-446f-9b62-765ef83bfe4d	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed complete dashboard	{"totalBikes": 0, "totalRides": 0, "totalUsers": 6}	162.158.214.133	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 12:18:32.756
8407fe58-ce26-46d2-b401-a6f165580a74	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed admin dashboard stats	null	162.158.214.133	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 12:18:34.301
7be2ee07-9fd6-4f7c-a173-23b5d7722b8d	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	INCIDENTS		Viewed incidents list (page 1, status: OPEN)	{"page": 1, "limit": 5, "total": 0, "status": "OPEN"}	162.158.214.133	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 12:18:34.325
0175bac9-38cd-44a4-971b-c2a7a4a522ee	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	162.158.214.133	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 12:18:34.47
aa899647-3948-49e8-94c9-d179b4396a22	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 0}	162.158.214.133	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 12:18:34.605
9fdc1a6b-b532-45c3-a753-fd00129a6984	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PROFILE	3c695091-d0de-4f35-a124-de6079a518d0	User viewed their profile	null	162.158.214.133	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 12:20:09.327
d5142fff-f516-468a-831f-d25473077536	\N	VIEW	SETTINGS		Viewed application settings	null	162.158.214.133	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 12:20:10.083
769442d4-fff5-4548-b520-67e633ade71e	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed complete dashboard	{"totalBikes": 0, "totalRides": 0, "totalUsers": 6}	162.158.214.133	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 12:20:10.275
79eddd9a-93da-48fe-8ac9-950a86a57574	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	162.158.214.132	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 12:20:11
41a3a710-c574-4455-946c-d3529fc29f77	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed admin dashboard stats	null	162.158.214.133	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 12:20:11.003
0f986480-be26-42de-b577-d07816648170	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	INCIDENTS		Viewed incidents list (page 1, status: OPEN)	{"page": 1, "limit": 5, "total": 0, "status": "OPEN"}	162.158.214.133	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 12:20:11.008
c603c72d-0acb-4f85-838d-48a699ad0b2d	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 0}	162.158.214.132	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 12:20:11.24
f11ab31a-a3e2-4307-95ca-05e83caed6a0	3c695091-d0de-4f35-a124-de6079a518d0	LOGIN	AUTH	3c695091-d0de-4f35-a124-de6079a518d0	User logged in successfully	{"email": "admin@freebike.cm"}	172.68.42.84	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 12:38:35.413
ff1c7217-3aa0-4463-b5f0-9c51e5c0300b	3c695091-d0de-4f35-a124-de6079a518d0	LOGIN	AUTH	3c695091-d0de-4f35-a124-de6079a518d0	User logged in successfully	{"email": "admin@freebike.cm"}	162.158.214.140	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-27 07:54:46.529
bb1c5f48-c420-406c-92fe-eeac5e731f7c	\N	VIEW	SETTINGS		Viewed application settings	null	172.68.42.84	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 12:38:36.39
cb9f6b3e-eef3-4475-9bc3-2b8c4ae07817	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed complete dashboard	{"totalBikes": 0, "totalRides": 0, "totalUsers": 6}	172.68.42.84	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 12:38:36.745
fa0236b9-57de-4b2b-99ff-c2b023534f89	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	172.68.42.84	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 12:38:37.75
6f33f41c-5315-4dae-9698-a79e64b1acb1	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	INCIDENTS		Viewed incidents list (page 1, status: OPEN)	{"page": 1, "limit": 5, "total": 0, "status": "OPEN"}	172.68.42.84	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 12:38:37.773
89391fd1-5b29-4a65-9aa5-c9ef20cc414e	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed admin dashboard stats	null	172.68.42.84	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 12:38:37.773
fea22a63-7544-4836-b381-9f34fa556f20	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 0}	172.68.42.84	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 12:38:37.903
87048e9b-3c3f-4cf0-a003-a08723de820c	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	USERS		Viewed all users (page 1, role: USER)	{"page": 1, "role": "USER", "limit": 10, "total": 2}	172.68.42.30	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 12:38:51.337
c12b81a2-4c50-4710-9888-d5905c0865aa	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES		Viewed bikes list (page 1, status: all)	{"page": 1, "count": 0, "limit": 9}	172.68.42.31	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 12:39:00.131
a7de418e-f0c7-4efa-824c-dbab5ac76812	\N	VIEW	SETTINGS		Viewed application settings	null	172.68.151.13	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.3	2026-04-20 18:31:08.675
d9a75249-28cd-48f7-aa8f-13098744602b	\N	VIEW	SETTINGS		Viewed application settings	null	104.23.225.131	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.3	2026-04-20 18:31:08.779
68ce0965-e595-435d-808b-dc2efda9a44d	\N	VIEW	SETTINGS		Viewed application settings	null	172.71.232.9	Mozilla/5.0 (iPhone; CPU iPhone OS 26_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/147.0.7727.99 Mobile/15E148 Safari/604.1	2026-04-21 14:58:06.733
59629023-d383-4033-8ca1-b477a82d0d36	3c695091-d0de-4f35-a124-de6079a518d0	LOGIN	AUTH	3c695091-d0de-4f35-a124-de6079a518d0	User logged in successfully	{"email": "admin@freebike.cm"}	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 15:17:51.639
6d5f290d-9c64-4d9f-b591-577af2b72d3b	\N	VIEW	SETTINGS		Viewed application settings	null	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 15:17:52.598
e3fdde63-65a7-4db6-99cc-ea9f51000995	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed complete dashboard	{"totalBikes": 11, "totalRides": 0, "totalUsers": 6}	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 15:17:52.674
47588c24-b9aa-4ec5-9c15-8a6c9fd6769e	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed admin dashboard stats	null	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 15:17:53.335
d90e96f6-fd20-4eff-83b9-a810c5e3ff66	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PROFILE	3c695091-d0de-4f35-a124-de6079a518d0	User viewed their profile	null	162.158.214.132	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 19:07:00.961
b3fb951b-0d32-44c1-a808-549683598d29	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed complete dashboard	{"totalBikes": 0, "totalRides": 0, "totalUsers": 6}	162.158.214.133	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 19:07:01.976
5b708e82-979e-4a9b-bf31-22824f8f6d92	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PRICING	31c654aa-ee98-4247-a65b-7dcaa1816008	Viewed pricing configuration	null	162.158.214.133	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 19:07:27.428
981ca10b-09ee-47ed-b670-7caedbe1a9f4	3c695091-d0de-4f35-a124-de6079a518d0	CREATE	SUBSCRIPTION_PACKAGE	88e15336-0115-4ae6-950a-34862fe36ddf	Created package Standard	{"name": "Standard", "description": ""}	162.158.214.132	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 19:07:53.485
beaddd29-bf24-4e94-9eea-dd4afd6648cb	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PROFILE	3c695091-d0de-4f35-a124-de6079a518d0	User viewed their profile	null	162.158.214.132	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 19:09:09.835
7a23e0db-f552-4587-a8f5-377a621674da	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed complete dashboard	{"totalBikes": 11, "totalRides": 0, "totalUsers": 6}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 15:12:43.224
d4f06887-a48e-4bfb-b5c5-c3bfbeaf8420	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 15:12:46.281
c45ff310-2df2-4085-bdce-91d0d24a18f9	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES		Viewed bikes list (page 1, status: all)	{"page": 1, "count": 9, "limit": 9}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 15:13:17.364
4c88a39e-eab2-4748-9f3b-3eff5ee15205	\N	VIEW	SETTINGS		Viewed application settings	null	162.158.214.132	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-27 07:54:48.066
868774ac-87b3-4fa9-a5df-0781d96284c6	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	162.158.214.132	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-27 07:54:49.734
69a13c6c-1d31-4499-8a0e-16eefe3d790f	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	bikes		Attempted read on bikes without permission	{"userPermissions": [], "requiredPermission": "bikes:read"}	162.158.214.133	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-27 07:54:49.904
50b4d3d4-9834-4180-9d73-c10eef569f4a	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	incidents		Attempted read on incidents without permission	{"userPermissions": [], "requiredPermission": "incidents:read"}	162.158.214.133	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-27 07:54:49.923
50aeacba-0bd0-4a40-93f8-ade141f52101	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	INCIDENTS		Viewed incidents list (page 1, status: OPEN)	{"page": 1, "limit": 5, "total": 0, "status": "OPEN"}	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 15:17:53.39
1b59e40b-20b1-4813-9e9e-f5578aa5d043	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 15:17:53.396
89879a85-99ba-4639-baa1-fe1207bf3732	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 11}	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 15:17:58.648
8cb5d145-6da0-48b3-9e01-ae4b5cc615e4	\N	VIEW	SETTINGS		Viewed application settings	null	162.158.214.133	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 19:07:01.895
3402e17f-fc44-4ac0-9643-fe314d15b948	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed admin dashboard stats	null	162.158.214.132	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 19:07:02.658
53278273-cb16-4a8a-b939-24c57eb7dbd9	3c695091-d0de-4f35-a124-de6079a518d0	CREATE	SUBSCRIPTION_FORMULA	b87d1a57-2d42-433c-bb5b-2b8c0c32bf47	Created formula Forfait Jour	{"name": "Forfait Jour", "price": 1000, "packageId": "88e15336-0115-4ae6-950a-34862fe36ddf", "numberOfDays": 1}	162.158.214.133	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 19:10:00.337
3014ed6b-691f-4056-8b8d-5329b6ed3cbc	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	162.158.214.132	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-27 07:54:48.767
9ebfb40e-96ad-419e-9e7e-abe0d9cfb4d5	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	162.158.214.132	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-27 07:54:49.711
7094fb28-fe3a-4249-9a48-c15793d03768	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES		Viewed bikes list (page 1, status: all)	{"page": 1, "count": 0, "limit": 9}	162.158.214.132	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 19:10:16.462
f64d7506-a494-4fe9-a3ac-81514a3e99e0	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	INCIDENTS		Viewed incidents list (page 1, status: OPEN)	{"page": 1, "limit": 5, "total": 0, "status": "OPEN"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 15:12:46.457
345c5268-5854-499d-9fd4-26ea46964f22	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	USERS		Viewed all users (page 1, role: USER)	{"page": 1, "role": "USER", "limit": 10, "total": 2}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 15:13:18.39
a740dda3-a5e5-401e-818b-dd5a4ea19557	\N	VIEW	SETTINGS		Viewed application settings	null	172.68.70.150	Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.7680.177 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)	2026-04-24 05:52:13.601
09278319-95e3-4e0d-a90a-dcbcd1afc615	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	INCIDENTS		Viewed incidents list (page 1, status: OPEN)	{"page": 1, "limit": 5, "total": 0, "status": "OPEN"}	162.158.214.133	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 19:07:02.719
c54aad5a-978d-419a-91dd-153ede17395f	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	162.158.214.133	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 19:07:02.734
c0cf9ae1-b2ad-49ab-9b11-ebba96fafef2	\N	VIEW	SETTINGS		Viewed application settings	null	172.69.70.194	Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.7680.177 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)	2026-04-27 11:26:13.549
41206a36-317d-4407-997a-864beb02ac6d	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 11}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 15:12:51.72
03a96c87-7f87-4b05-8ef2-4b162601f2f5	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PROFILE	3c695091-d0de-4f35-a124-de6079a518d0	User viewed their profile	null	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 07:02:28.567
c456d05f-3154-49ca-8412-9dfa3c6ee52d	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed admin dashboard stats	null	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 07:02:30.86
08846338-9193-40f8-806f-07019c24132d	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	USERS		Viewed all users (page 1, role: USER)	{"page": 1, "role": "USER", "limit": 10, "total": 2}	162.158.214.133	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 19:10:29.886
84280111-f9fd-433f-82fc-b765d2bc8a65	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	USERS		Viewed all users (page 1, role: all)	{"page": 1, "limit": 10, "total": 6}	162.158.214.133	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 19:10:34.82
e2363827-d234-44ad-8535-efddf544f6b9	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	ROLES		Viewed roles list	null	162.158.214.132	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 19:10:34.89
b277f3a4-b52c-4f19-b45c-b0713e94d7c0	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PRICING	31c654aa-ee98-4247-a65b-7dcaa1816008	Viewed pricing configuration	null	162.158.214.132	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-20 19:15:17.19
320b02ec-1884-4e1e-8a45-ebfedb959072	\N	VIEW	SETTINGS		Viewed application settings	null	141.101.69.36	Mozilla/5.0 (iPhone; CPU iPhone OS 26_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/147.0.7727.99 Mobile/15E148 Safari/604.1	2026-04-21 17:27:54.021
58c65bc4-1791-4598-9a43-eb0b178d9fc4	\N	VIEW	SETTINGS		Viewed application settings	null	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 07:02:29.793
eca15f22-965b-47fa-8052-8cdbb28ac0b1	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed complete dashboard	{"totalBikes": 11, "totalRides": 0, "totalUsers": 6}	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 07:02:30.159
7e149934-df53-4bdd-8578-89e97ea1ffa4	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 07:02:30.871
7769ad28-dc97-4d86-b35e-5d75e4171de6	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PROFILE	3c695091-d0de-4f35-a124-de6079a518d0	User viewed their profile	null	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 07:56:30.259
4fbf1c09-614d-4503-8e02-94bce1da4e69	\N	VIEW	SETTINGS		Viewed application settings	null	172.71.154.70	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.7390.0 Safari/537.36	2026-04-27 22:25:47.841
3d9b6596-567b-4d53-9558-5152f2bfbf9d	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES		Viewed bikes list (page 1, status: all)	{"page": 1, "count": 1, "limit": 9}	172.69.37.137	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:00:04.658
67a06ebe-ae79-435f-a820-93dda680f935	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	INCIDENTS		Viewed incidents list (page 1, status: OPEN)	{"page": 1, "limit": 5, "total": 0, "status": "OPEN"}	172.69.37.136	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:00:11.99
e47d6fdd-e0b4-47d1-8462-6e64a87eaf0c	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 1}	172.69.37.137	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:00:12.316
7a046ce1-6334-47fe-b960-e764444227c0	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES		Viewed bikes list (page 1, status: all)	{"page": 1, "count": 1, "limit": 9}	172.69.37.136	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:00:19.954
78b68363-0550-4b38-bf63-a48601ed7bf6	\N	VIEW	SETTINGS		Viewed application settings	null	172.71.232.8	Mozilla/5.0 (iPhone; CPU iPhone OS 26_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/147.0.7727.99 Mobile/15E148 Safari/604.1	2026-04-21 19:44:25.548
23d5db70-4b0e-49f6-b35e-6bbedb170ab6	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	INCIDENTS		Viewed incidents list (page 1, status: OPEN)	{"page": 1, "limit": 5, "total": 0, "status": "OPEN"}	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 07:02:30.872
da4ada99-baf6-4063-9f3c-a1fc8591e6fb	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 11}	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 07:02:35.223
23030bf6-7a1d-472c-9290-f5a442d4acb7	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 07:56:30.857
a9d96f23-d2d1-496b-a326-4b9d3ad1ab6c	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES		Viewed bikes list (page 1, status: all)	{"page": 1, "count": 0, "limit": 9}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 07:56:31.036
3a34f289-134e-4f1d-bb2e-644e46c36cee	3c695091-d0de-4f35-a124-de6079a518d0	CREATE	BIKE	e7f80fdc-fec0-4102-a83a-a1370c83421a	Created new bike: bike01	{"code": "bike01", "model": "36V20A16BN", "status": "AVAILABLE"}	172.69.37.137	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:00:03.047
a4b6220b-539c-4b37-bc3a-98d40c029cef	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.17.47	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.7390.0 Safari/537.36	2026-04-27 22:25:48.973
bb70f7a7-7eb0-4cc0-a623-f9d3e8db66ce	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed admin dashboard stats	null	172.69.37.137	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:00:11.75
27d5deeb-f763-4e01-88b5-17702843400a	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	172.69.37.136	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:00:11.986
e6b9e945-b567-4c71-a54b-429499b1ec66	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed complete dashboard	{"totalBikes": 11, "totalRides": 0, "totalUsers": 6}	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 06:54:51.416
a68aec4b-1f42-4205-8ee2-56ee422e39ea	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	INCIDENTS		Viewed incidents list (page 1, status: OPEN)	{"page": 1, "limit": 5, "total": 0, "status": "OPEN"}	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 06:54:52.702
45eb396e-4b16-4b6c-9e29-839dcf4f33cc	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PROFILE	3c695091-d0de-4f35-a124-de6079a518d0	User viewed their profile	null	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 08:01:38.828
ec98bfb2-492f-48a2-b656-421b74e97141	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 08:01:40.143
0837832b-d013-444c-85fe-dd8e4af232f1	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed complete dashboard	{"totalBikes": 1, "totalRides": 0, "totalUsers": 6}	172.69.37.137	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:00:11.044
f3e9475a-ad93-4b83-8e29-dea0fa6e562f	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 06:54:52.281
5b651675-c2f0-4ac6-9a46-dc9dc5356cec	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed admin dashboard stats	null	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 06:54:52.703
8895f293-c3c2-4925-b833-771bc05ce387	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 11}	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 06:54:58.476
13f24b86-f69d-4332-8c2d-2fc79b4517b6	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed complete dashboard	{"totalBikes": 11, "totalRides": 0, "totalUsers": 6}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 08:01:40.232
009a71c2-7a43-4f90-a18e-18056fba212b	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	INCIDENTS		Viewed incidents list (page 1, status: OPEN)	{"page": 1, "limit": 5, "total": 0, "status": "OPEN"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 08:01:41.243
69adc7ce-7bbd-401f-a409-7a6c2481e7c8	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 11}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 08:01:46.146
d44041e5-b34a-495d-b813-8be4cf6401be	3c695091-d0de-4f35-a124-de6079a518d0	CREATE	BIKE	2143c072-23c4-40f6-af26-ebf72a8cf85c	Created new bike: bike02	{"code": "bike02", "model": "36V20A21GN", "status": "AVAILABLE"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:02:18.152
942d881c-8d07-4e2b-8f82-b9fc740f2a5b	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES		Viewed bikes list (page 1, status: all)	{"page": 1, "count": 2, "limit": 9}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:02:19.384
3ae6268c-5ffb-4c03-8baf-cd9180be4494	\N	SEARCH	AREAS		Searched areas with query: pk12 entr&	{"count": 0, "query": "pk12 entr&", "country": "CM"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:03:29.825
5fa5e66a-6fd7-49f7-9fe8-099371ac721f	\N	SEARCH	AREAS		Searched areas with query: pk12 entr	{"count": 0, "query": "pk12 entr", "country": "CM"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:03:30.155
16236bfd-ff70-4946-b4c6-6eca5ebc77fa	3c695091-d0de-4f35-a124-de6079a518d0	LOGIN	AUTH	3c695091-d0de-4f35-a124-de6079a518d0	User logged in successfully	{"email": "admin@freebike.cm"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-27 23:06:54.32
966cf8d5-5727-4ea3-bded-c44b91467dce	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-27 23:06:55.254
e4d4a189-7373-433c-9687-e5033150ea40	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES		Viewed bikes list (page 1, status: all)	{"page": 1, "count": 9, "limit": 9}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-27 23:06:55.781
1baa4c64-88f6-4d1e-915d-060a8993269f	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	wallet		Attempted read on wallet without permission	{"userPermissions": [], "requiredPermission": "wallet:read"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-27 23:07:16.424
a270f521-9d76-43d2-a5ea-bb92acfa2bc2	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	wallet		Attempted manage on wallet without permission	{"userPermissions": [], "requiredPermission": "wallet:manage"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-27 23:07:44.07
7bed5c2b-fceb-4449-907a-50e1ca8420d8	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	wallet		Attempted read on wallet without permission	{"userPermissions": [], "requiredPermission": "wallet:read"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-27 23:07:44.089
860cca83-97a7-4844-b618-89078dd71b79	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-27 23:07:44.295
ab972f19-7ece-4de1-8f2d-fb450629ac3c	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	bikes		Attempted read on bikes without permission	{"userPermissions": [], "requiredPermission": "bikes:read"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-27 23:09:09.476
bd49aa08-944a-42a7-b722-e7220a35f726	\N	SEARCH	AREAS		Searched areas with query: pk12 entré	{"count": 3, "query": "pk12 entré", "country": "CM"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:03:30.912
7042da4d-7591-4244-9ca4-e3c7df0470c0	\N	SEARCH	AREAS		Searched areas with query: pk12 entrée lycée	{"count": 1, "query": "pk12 entrée lycée", "country": "CM"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:03:33.198
6ba261b1-90da-4c86-9c6e-6e0351ed40a1	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PROFILE	3c695091-d0de-4f35-a124-de6079a518d0	User viewed their profile	null	104.22.76.139	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 07:16:13.204
027a9126-f718-47b2-b1dd-880952520174	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 07:16:13.673
5acb2908-fa0e-4d00-8996-15e8bb115e58	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed admin dashboard stats	null	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 07:16:14.556
3f8e91c4-ce43-4683-ab16-4b2e9df70142	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 11}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 07:16:18.247
b1e021c8-aeed-4a31-a15b-42c014469c00	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed admin dashboard stats	null	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 08:01:41.223
a80a9aac-520c-4eb7-8e0d-e15c2c6b61f5	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 08:01:41.243
6d658594-912b-4419-b19f-26eca053ba48	3c695091-d0de-4f35-a124-de6079a518d0	CREATE	BIKE	e2070b5b-121d-4dee-8b08-eb43da56c412	Created new bike: bike03	{"code": "bike03", "model": "36V20A16BN", "status": "AVAILABLE"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:03:38.772
a83e819f-cd74-43f5-9238-61fdb7f1812a	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed complete dashboard	{"totalBikes": 11, "totalRides": 0, "totalUsers": 6}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 07:16:13.983
55f901ec-1193-4804-b36d-64567291f6f7	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 07:16:14.565
8a92ab85-d02b-4062-9247-8c4e0e814425	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PROFILE	3c695091-d0de-4f35-a124-de6079a518d0	User viewed their profile	null	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 12:49:04.009
b51be3fc-a366-4d1a-948b-d405748f0576	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 12:49:05.032
97cd0708-ba57-4726-a738-fae62d6177b0	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 12:49:12.864
1606e9ae-084f-4c59-a99a-eae6620fd189	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 11}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 12:49:18.956
5e77cc05-b9ca-464b-b217-fe1d46d63ed3	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 11}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 12:49:31.315
baa3c9e7-6da0-4d67-a8fe-98cb09b21218	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	wallet		Attempted read on wallet without permission	{"userPermissions": [], "requiredPermission": "wallet:read"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-27 23:07:16.318
28bbd316-9386-4c0a-8c6a-35520191c495	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	wallet		Attempted view_transactions on wallet without permission	{"userPermissions": [], "requiredPermission": "wallet:view_transactions"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-27 23:07:16.426
060275db-e258-4b03-8333-a4b30829433c	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	wallet		Attempted manage on wallet without permission	{"userPermissions": [], "requiredPermission": "wallet:manage"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-27 23:07:28.67
bb246dc7-f895-4a25-87ee-1cd5c72563c7	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	wallet		Attempted read on wallet without permission	{"userPermissions": [], "requiredPermission": "wallet:read"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-27 23:07:28.809
4163ee62-6788-4598-8165-52ca18929886	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PROFILE	3c695091-d0de-4f35-a124-de6079a518d0	User viewed their profile	null	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-27 23:07:43.031
8edbe1da-4c66-4572-9d51-dd2fddd64b8c	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-27 23:09:12.845
368525aa-8809-4785-8172-f44f5937c5ed	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES		Viewed bikes list (page 1, status: all)	{"page": 1, "count": 3, "limit": 9}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:03:39.982
646f52fa-1a6e-482e-9310-852e4c8d060f	3c695091-d0de-4f35-a124-de6079a518d0	UPDATE	BIKE	e2070b5b-121d-4dee-8b08-eb43da56c412	Updated bike: bike03	{"newData": {"id": "e2070b5b-121d-4dee-8b08-eb43da56c412", "code": "bike03", "model": "36V20A16BN", "qrCode": "ECOMOBILE-bike03-baeb9726-0add-4c2e-b6f0-32263eca00ac", "status": "AVAILABLE", "isActive": true, "latitude": 4.0657783, "createdAt": "2026-04-21T08:03:38.770Z", "equipment": ["headlight", "taillight", "bell", "lock", "basket", "rack", "mudguards", "reflectors"], "longitude": 9.7880833, "updatedAt": "2026-04-21T08:04:12.555Z", "lastSeenAt": null, "gpsDeviceId": "9170164466", "batteryLevel": 0, "locationName": "Position personnalisée", "pricingPlanId": null, "lastMaintenanceAt": null}, "oldData": {"id": "e2070b5b-121d-4dee-8b08-eb43da56c412", "code": "bike03", "model": "36V20A16BN", "speed": 0, "qrCode": "ECOMOBILE-bike03-baeb9726-0add-4c2e-b6f0-32263eca00ac", "status": "AVAILABLE", "isActive": true, "latitude": 4.0657783, "createdAt": "2026-04-21T08:03:38.770Z", "equipment": ["headlight", "taillight", "bell", "lock", "basket", "rack", "mudguards", "reflectors"], "gpsSignal": 0, "gsmSignal": 0, "longitude": 9.7880833, "updatedAt": "2026-04-21T08:03:39.804Z", "lastSeenAt": null, "gpsDeviceId": "9170164466", "pricingPlan": null, "batteryLevel": 0, "locationName": "Position personnalisée", "lastGpsUpdate": "2026-04-21T08:02:05.000Z", "pricingPlanId": null, "currentPricing": {"isNight": false, "unlockFee": 100, "isFallback": true, "displayPrice": 250, "durationHours": 1}, "maintenanceLogs": [], "lastMaintenanceAt": null}}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:04:12.558
d72ae93d-5194-4b3b-8234-599514f2f121	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES		Viewed bikes list (page 1, status: all)	{"page": 1, "count": 3, "limit": 9}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:04:13.409
fae7449f-a3df-46be-a78d-d1cb7bdba14a	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	INCIDENTS		Viewed incidents list (page 1, status: OPEN)	{"page": 1, "limit": 5, "total": 0, "status": "OPEN"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 07:16:14.547
5a3fc493-36fe-4727-9aef-2b6bca024ac6	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed complete dashboard	{"totalBikes": 11, "totalRides": 0, "totalUsers": 6}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 12:49:06.632
f1f36b0e-a73d-4c44-8ed8-5e5c2830f032	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed admin dashboard stats	null	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 12:49:12.87
e7687ca4-c755-4cc8-b14c-61e7337d6321	3c695091-d0de-4f35-a124-de6079a518d0	CREATE	BIKE	d1d6bd6a-d439-4f1f-be97-d4202e53e53f	Created new bike: bike04	{"code": "bike04", "model": "36V20A16BN", "status": "AVAILABLE"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:05:27.905
b02da7b4-9f4f-435a-a267-4a3e4366bd4c	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES		Viewed bikes list (page 1, status: all)	{"page": 1, "count": 4, "limit": 9}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:05:29.262
9e14ec9f-730c-4aae-9bf3-164014567e61	3c695091-d0de-4f35-a124-de6079a518d0	CREATE	BIKE	1fbb069e-fac7-4633-9902-2d0f04b1999b	Created new bike: bike05	{"code": "bike05", "model": "36V20A16BN", "status": "AVAILABLE"}	172.69.37.137	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:08:05.955
ae15fd51-c6ce-4a3d-85cc-e0f8ae355350	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed admin dashboard stats	null	172.69.37.137	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:08:17.657
99d7166a-289e-4c00-9dbc-e354ccfc0eb7	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	172.69.37.137	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:08:17.843
c32c57ef-3199-4015-8fdc-a03f3ee07dcf	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	incidents		Attempted read on incidents without permission	{"userPermissions": [], "requiredPermission": "incidents:read"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-27 23:09:12.84
a26d95d6-ad8c-4800-b2d0-63779599142e	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 5}	172.69.37.136	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:08:19.703
7331d741-797d-4a0b-ad00-3ebe62d3a35f	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PROFILE	3c695091-d0de-4f35-a124-de6079a518d0	User viewed their profile	null	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 08:04:16.653
c7685085-5028-47d9-8526-f394ef114273	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 08:04:17.104
54399883-0075-41f4-af81-78f3fb210b93	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 08:04:18.227
f32cf4ea-6d2a-47e0-9d1a-3ef42bad44cd	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	INCIDENTS		Viewed incidents list (page 1, status: OPEN)	{"page": 1, "limit": 5, "total": 0, "status": "OPEN"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 12:49:12.604
c0312c13-e943-4cbc-8d91-0285be3d8ba2	\N	VIEW	SETTINGS		Viewed application settings	null	162.158.214.132	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-24 12:50:02.127
34d95750-30fc-4ba4-a514-b47372bca590	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES		Viewed bikes list (page 1, status: all)	{"page": 1, "count": 5, "limit": 9}	172.69.37.137	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:08:07.196
f8f78bcf-e56c-434d-92cf-0ca105a993cb	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES		Viewed bikes list (page 1, status: all)	{"page": 1, "count": 5, "limit": 9}	172.69.37.136	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:09:54.418
caf729d8-f0d6-46f5-a418-567a9c6f9731	3c695091-d0de-4f35-a124-de6079a518d0	CREATE	BIKE	3cbda165-ff5f-4c39-a7d4-596d58c1a748	Created new bike: bike06	{"code": "bike06", "model": "36V20A21GB", "status": "AVAILABLE"}	172.69.37.137	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:11:43.748
4f42baaf-e1f5-4076-a689-d39e4353dbef	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed complete dashboard	{"totalBikes": 11, "totalRides": 0, "totalUsers": 6}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 08:04:17.577
2e1064f3-ad67-4188-8717-c080f6c61dd7	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed admin dashboard stats	null	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 08:04:18.224
ffb228a3-f49d-422b-aa40-0007e6cf0bc3	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES		Viewed bikes list (page 1, status: all)	{"page": 1, "count": 9, "limit": 9}	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 12:54:10.377
360fa58f-7782-4934-a6f7-0aae2906fec9	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PROFILE	3c695091-d0de-4f35-a124-de6079a518d0	User viewed their profile	null	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 12:54:11.615
df852609-7d0b-49c2-b2b1-7ef13c8a92ab	\N	VIEW	SETTINGS		Viewed application settings	null	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 12:54:12.722
59e1194f-a9be-4add-8ef2-27b9f819606f	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed complete dashboard	{"totalBikes": 11, "totalRides": 0, "totalUsers": 6}	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 12:54:12.874
1c8b4845-3ac8-4668-90cb-8df40bce94ae	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed complete dashboard	{"totalBikes": 5, "totalRides": 0, "totalUsers": 6}	172.69.37.137	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:08:16.652
e0d94181-9344-4aa6-85ef-c335f4d0be12	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	INCIDENTS		Viewed incidents list (page 1, status: OPEN)	{"page": 1, "limit": 5, "total": 0, "status": "OPEN"}	172.69.37.137	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:08:17.841
119d2221-aa8b-4513-bf4a-edc1a2c8ff82	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-27 23:09:12.84
9ce318bd-dabd-4eaf-ba6b-b0450c41cddc	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	bikes		Attempted read on bikes without permission	{"userPermissions": [], "requiredPermission": "bikes:read"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-27 23:10:56.535
cd7ab843-4e2b-416d-b5ed-f0d9903bc77c	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	INCIDENTS		Viewed incidents list (page 1, status: OPEN)	{"page": 1, "limit": 5, "total": 0, "status": "OPEN"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 08:04:18.225
8a9613f2-6e25-4742-9d98-793f94e39746	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 11}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 08:04:21.162
cfd8938c-3581-4a9d-8638-6a00727d507f	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed admin dashboard stats	null	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 12:54:14.563
c75fc429-635e-4d54-831c-aaf3b459839a	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	USERS		Viewed all users (page 1, role: USER)	{"page": 1, "role": "USER", "limit": 10, "total": 2}	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 12:55:14.614
86c7784b-9071-4447-98f9-8c42ff561872	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed complete dashboard	{"totalBikes": 11, "totalRides": 0, "totalUsers": 6}	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 12:55:20.758
c884f5be-9646-4a22-938c-ce9e2233aff9	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 12:55:22.508
07bcae48-6b78-441b-985f-f85a6df0693b	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES		Viewed bikes list (page 1, status: all)	{"page": 1, "count": 6, "limit": 9}	172.69.37.137	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:11:44.919
9302e3a3-4a71-4a48-911c-76971c8caea9	3c695091-d0de-4f35-a124-de6079a518d0	CREATE	BIKE	72efad84-1ef7-4a95-a278-83140857ac1b	Created new bike: bike07	{"code": "bike07", "model": "36V20A21GN", "status": "AVAILABLE"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:15:39.027
85fdaaa0-bf36-4e81-b985-0a700c60bf24	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PROFILE	3c695091-d0de-4f35-a124-de6079a518d0	User viewed their profile	null	104.22.76.138	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 08:55:58.922
83cf8817-a4de-4f0a-8fb4-d762b094e8ae	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	INCIDENTS		Viewed incidents list (page 1, status: OPEN)	{"page": 1, "limit": 5, "total": 0, "status": "OPEN"}	104.22.76.138	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 08:56:01.29
365e2551-ca6d-4a66-b379-586706bb06ba	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-27 23:44:53.91
e827a08c-49c3-4ed4-a78a-abc74fcd821a	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-27 23:44:54.303
0feb92e9-d064-45af-9ac1-773add5d57b1	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 11}	104.22.76.138	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 08:56:04.833
de672437-e3aa-417e-a497-c79cf7efdd65	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 12:54:14.565
2f06a3c7-62d5-4d8f-8528-1f857477d2c6	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	INCIDENTS		Viewed incidents list (page 1, status: OPEN)	{"page": 1, "limit": 5, "total": 0, "status": "OPEN"}	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 12:54:14.598
eb08d40f-5b14-45d8-8fb5-fc6474362f7a	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 11}	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 12:54:34.179
9d2d09de-33e9-4eae-8ce1-a048d1ee45f4	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.20.211	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.7390.0 Safari/537.36	2026-04-28 06:02:08.277
b9554df3-b42e-4e10-9c37-2eae0b77dc03	\N	VIEW	SETTINGS		Viewed application settings	null	162.158.167.116	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.7390.0 Safari/537.36	2026-04-28 06:02:19.063
d52a9067-35e7-4509-a9aa-e97f25ad79c7	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 11}	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 12:54:52.866
5cf60638-c17c-4a8a-8dce-99c84ba8c2da	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed admin dashboard stats	null	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 12:55:22.413
201cefad-61ba-4b47-bf5e-4253cedff183	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	INCIDENTS		Viewed incidents list (page 1, status: OPEN)	{"page": 1, "limit": 5, "total": 0, "status": "OPEN"}	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 12:55:22.508
7cdb0e24-7b54-4d69-81a2-3b9275eff2a4	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 11}	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 12:55:42.359
0190cef0-0378-443d-b044-c035a352cf63	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 11}	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-24 12:56:03.168
b4baf691-f4c5-454c-b506-1636bfafeb72	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES		Viewed bikes list (page 1, status: all)	{"page": 1, "count": 7, "limit": 9}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:15:40.22
d34b8116-3262-4256-bbac-36d648bbde2a	\N	SEARCH	AREAS		Searched areas with query: pk12	{"count": 4, "query": "pk12", "country": "CM"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:17:01.861
55dea046-9f68-4f25-bc3a-28d9804cfc10	\N	SEARCH	AREAS		Searched areas with query: pk12 entrée	{"count": 10, "query": "pk12 entrée", "country": "CM"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:17:03.569
6f821d3e-97eb-4e74-926f-e19d188f7729	\N	SEARCH	AREAS		Searched areas with query: pk12 entrée 	{"count": 10, "query": "pk12 entrée ", "country": "CM"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:17:04.277
25ebf6e0-b9fc-41a5-a05f-c21065a12b84	\N	SEARCH	AREAS		Searched areas with query: pk12 entrée lycée	{"count": 1, "query": "pk12 entrée lycée", "country": "CM"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:17:05.702
cc05ceb0-aa4b-472f-9fd2-0ea6f79d373b	3c695091-d0de-4f35-a124-de6079a518d0	CREATE	BIKE	54171842-1b96-4b55-a5d7-323aab0c0013	Created new bike: bike08	{"code": "bike08", "model": "36V20A21GN", "status": "AVAILABLE"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:17:10.809
547a7757-fe3b-43ae-a8ad-8b0c00573d97	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.76.138	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 08:55:59.853
d6dcaf3b-8dab-4856-9a6c-6eb5872b5020	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES		Viewed bikes list (page 1, status: all)	{"page": 1, "count": 8, "limit": 9}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:17:11.851
ee51fb98-12df-4ef5-a154-331cbe2d02bf	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed complete dashboard	{"totalBikes": 11, "totalRides": 0, "totalUsers": 6}	104.22.76.138	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 08:56:00.127
e681331a-363f-497c-bcd6-015c96f0bceb	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed admin dashboard stats	null	104.22.76.138	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 08:56:01.261
7f70bc45-a307-40ff-a86b-a48e738e6861	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	104.22.76.138	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 08:56:01.287
63c110f9-27dc-4dda-88e8-bbb5084f6547	\N	SEARCH	AREAS		Searched areas with query: pk12 en	{"count": 0, "query": "pk12 en", "country": "CM"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:24:05.578
09e8fc23-1b4f-4b55-b283-2f8dd3d9e218	\N	SEARCH	AREAS		Searched areas with query: pk12 entrée lycée	{"count": 1, "query": "pk12 entrée lycée", "country": "CM"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:24:07.691
dd96d680-ca43-4617-894a-58175445027d	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.17.46	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.7390.0 Safari/537.36	2026-04-28 06:02:08.372
390f6e99-28c4-481b-9917-76d5d8130609	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.17.46	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.7390.0 Safari/537.36	2026-04-28 06:02:18.989
806cc9d7-3086-40f9-9b20-d7d10a8a1c88	3c695091-d0de-4f35-a124-de6079a518d0	CREATE	BIKE	8d5b24aa-db1e-4c47-a07e-ecf216965bd4	Created new bike: bike09	{"code": "bike09", "model": "36V20A21GN", "status": "AVAILABLE"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:24:13.9
90145af2-7b1a-4278-9266-bdb503a6c3a8	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PROFILE	3c695091-d0de-4f35-a124-de6079a518d0	User viewed their profile	null	172.69.112.183	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 11:47:59.717
a765c8c8-4393-4892-a576-16600639f7b3	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	INCIDENTS		Viewed incidents list (page 1, status: OPEN)	{"page": 1, "limit": 5, "total": 0, "status": "OPEN"}	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 11:48:02.285
5a2c3abb-112d-4014-b6d8-de9d39aeeb92	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 11}	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 11:48:08.178
898aaa4e-2c93-4ce8-baae-7aa8354d77e4	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES		Viewed bikes list (page 1, status: all)	{"page": 1, "count": 9, "limit": 9}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:24:14.971
64ffdba9-95ab-49de-8998-53df0c9ee904	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES		Viewed bikes list (page 1, status: all)	{"page": 1, "count": 9, "limit": 9}	172.69.37.137	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:25:11.195
c8a76435-7e51-424c-a376-20ee7835c5c2	3c695091-d0de-4f35-a124-de6079a518d0	CREATE	BIKE	fd8c6bf6-25e2-4e93-90f7-e8ae82ccf8b9	Created new bike: bike10	{"code": "bike10", "model": "36V20A21GN", "status": "AVAILABLE"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:26:56.162
ca06f2f9-cf7d-4741-9898-e1c233bdc84b	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES		Viewed bikes list (page 1, status: all)	{"page": 1, "count": 9, "limit": 9}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:28:19.939
65601661-00dd-4030-9b9e-977eb9cf4244	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.76.144	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-28 07:19:25.267
b28983aa-c4e1-4959-aa9a-b3fa9c54f9f4	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	104.22.76.144	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-28 07:23:27.774
b88c6bc0-899b-4494-831f-463dbd6e812a	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	104.22.76.145	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-28 07:23:28.182
e64a7319-93b7-4ac5-a404-d4a54065ca8b	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	bikes		Attempted read on bikes without permission	{"userPermissions": [], "requiredPermission": "bikes:read"}	104.22.76.144	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-28 07:23:28.284
60e2fd5a-b941-407a-92e8-209ca241e408	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES		Viewed bikes list (page 1, status: all)	{"page": 1, "count": 9, "limit": 9}	104.22.76.144	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-28 07:23:44.488
e28cc714-a3aa-4cf3-a60b-809875356bd6	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	104.22.76.144	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-28 07:23:50.3
fde25a19-fec1-45d0-807a-377681660ebb	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	incidents		Attempted read on incidents without permission	{"userPermissions": [], "requiredPermission": "incidents:read"}	104.22.76.144	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-28 07:23:50.851
ab2089c3-b076-4dad-99b4-b7339c3216bf	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	104.22.76.145	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-28 07:23:50.859
fed67ed8-dfd3-4569-90cb-200def106d58	\N	VIEW	SETTINGS		Viewed application settings	null	172.69.112.183	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 11:48:00.846
8d40747a-1752-4c62-a69c-62e080d28364	3c695091-d0de-4f35-a124-de6079a518d0	UPDATE	BIKE	8d5b24aa-db1e-4c47-a07e-ecf216965bd4	Updated bike: bike09	{"newData": {"id": "8d5b24aa-db1e-4c47-a07e-ecf216965bd4", "code": "bike09", "model": "36V20A21GB", "qrCode": "ECOMOBILE-bike09-97dfa032-10cf-4f09-8585-5ccf118c3631", "status": "AVAILABLE", "isActive": true, "latitude": 4.064735, "createdAt": "2026-04-21T08:24:13.898Z", "equipment": ["headlight", "taillight", "bell", "lock", "basket", "rack", "mudguards", "reflectors"], "longitude": 9.7425433, "updatedAt": "2026-04-21T08:24:48.290Z", "lastSeenAt": null, "gpsDeviceId": "9170163284", "batteryLevel": 0, "locationName": "Position personnalisée", "pricingPlanId": null, "lastMaintenanceAt": null}, "oldData": {"id": "8d5b24aa-db1e-4c47-a07e-ecf216965bd4", "code": "bike09", "model": "36V20A21GN", "speed": 0, "qrCode": "ECOMOBILE-bike09-97dfa032-10cf-4f09-8585-5ccf118c3631", "status": "AVAILABLE", "isActive": true, "latitude": 4.064735, "createdAt": "2026-04-21T08:24:13.898Z", "equipment": ["headlight", "taillight", "bell", "lock", "basket", "rack", "mudguards", "reflectors"], "gpsSignal": 0, "gsmSignal": 0, "longitude": 9.7425433, "updatedAt": "2026-04-21T08:24:14.703Z", "lastSeenAt": null, "gpsDeviceId": "9170163284", "pricingPlan": null, "batteryLevel": 0, "locationName": "Position personnalisée", "lastGpsUpdate": "2026-04-21T08:24:02.000Z", "pricingPlanId": null, "currentPricing": {"isNight": false, "unlockFee": 100, "isFallback": true, "displayPrice": 250, "durationHours": 1}, "maintenanceLogs": [], "lastMaintenanceAt": null}}	172.69.37.136	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:24:48.293
e62e226c-f08a-4eac-b96d-014f4599c8b9	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES		Viewed bikes list (page 1, status: all)	{"page": 1, "count": 9, "limit": 9}	172.69.37.136	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:24:49.407
244c9135-719e-4721-9cad-55e8025b53d9	3c695091-d0de-4f35-a124-de6079a518d0	LOGIN	AUTH	3c695091-d0de-4f35-a124-de6079a518d0	User logged in successfully	{"email": "admin@freebike.cm"}	104.22.76.145	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-28 07:23:27.182
fb6cae76-5ccf-489c-9e12-74e50ee3a8ea	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.76.145	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-28 07:23:27.588
e9aee32c-a5d4-4826-be8d-4ae0e3d52ba0	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	104.22.76.145	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-28 07:23:28.135
4d0daeb2-3fe2-4341-8040-bc482260c2fe	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	incidents		Attempted read on incidents without permission	{"userPermissions": [], "requiredPermission": "incidents:read"}	104.22.76.144	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-28 07:23:28.165
6e42e875-3a9f-4364-8a59-8be644b2ccbd	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	104.22.76.144	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-28 07:23:50.695
c5aa77dd-36bf-4a7c-8b3c-889bcf41beba	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	bikes		Attempted read on bikes without permission	{"userPermissions": [], "requiredPermission": "bikes:read"}	104.22.76.144	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-28 07:23:50.834
a165d489-588b-47d6-8a66-54aee5f0c776	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.76.145	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-28 07:56:34.275
5c3bed64-b0f4-43b6-ba38-73b69893a262	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	104.22.76.145	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-28 07:56:46.318
73c6797a-9122-4ef6-9708-22ab97403ab8	3c695091-d0de-4f35-a124-de6079a518d0	UPDATE	BIKE	54171842-1b96-4b55-a5d7-323aab0c0013	Updated bike: bike08	{"newData": {"id": "54171842-1b96-4b55-a5d7-323aab0c0013", "code": "bike08", "model": "36V20A21GB", "qrCode": "ECOMOBILE-bike08-26cebd21-492e-44d7-b712-ad0d3f8a6005", "status": "AVAILABLE", "isActive": true, "latitude": 4.0656883, "createdAt": "2026-04-21T08:17:10.805Z", "equipment": ["headlight", "taillight", "bell", "lock", "basket", "rack", "mudguards", "reflectors"], "longitude": 9.7880333, "updatedAt": "2026-04-21T08:24:59.141Z", "lastSeenAt": null, "gpsDeviceId": "", "batteryLevel": 100, "locationName": "Position personnalisée", "pricingPlanId": null, "lastMaintenanceAt": null}, "oldData": {"id": "54171842-1b96-4b55-a5d7-323aab0c0013", "code": "bike08", "model": "36V20A21GN", "qrCode": "ECOMOBILE-bike08-26cebd21-492e-44d7-b712-ad0d3f8a6005", "status": "AVAILABLE", "isActive": true, "latitude": 4.0656883, "createdAt": "2026-04-21T08:17:10.805Z", "equipment": ["headlight", "taillight", "bell", "lock", "basket", "rack", "mudguards", "reflectors"], "longitude": 9.7880333, "updatedAt": "2026-04-21T08:17:10.805Z", "lastSeenAt": null, "gpsDeviceId": "", "pricingPlan": null, "batteryLevel": 100, "locationName": "Position personnalisée", "pricingPlanId": null, "currentPricing": {"isNight": false, "unlockFee": 100, "isFallback": true, "displayPrice": 250, "durationHours": 1}, "maintenanceLogs": [], "lastMaintenanceAt": null}}	172.69.37.136	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:24:59.145
e77f52d8-191a-4ba6-9b49-b12e34eeb002	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES		Viewed bikes list (page 1, status: all)	{"page": 1, "count": 9, "limit": 9}	172.69.37.136	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:25:00.283
1e9a9899-bb75-4421-b05c-bdbefe7133cc	3c695091-d0de-4f35-a124-de6079a518d0	UPDATE	BIKE	72efad84-1ef7-4a95-a278-83140857ac1b	Updated bike: bike07	{"newData": {"id": "72efad84-1ef7-4a95-a278-83140857ac1b", "code": "bike07", "model": "36V20A21GB", "qrCode": "ECOMOBILE-bike07-3f9500ff-f267-41aa-9716-f53e01ee5b67", "status": "AVAILABLE", "isActive": true, "latitude": 4.0660167, "createdAt": "2026-04-21T08:15:39.021Z", "equipment": ["headlight", "taillight", "bell", "lock", "basket", "rack", "mudguards", "reflectors"], "longitude": 9.7881333, "updatedAt": "2026-04-21T08:25:09.998Z", "lastSeenAt": null, "gpsDeviceId": "9170163348", "batteryLevel": 0, "locationName": "Position personnalisée", "pricingPlanId": null, "lastMaintenanceAt": null}, "oldData": {"id": "72efad84-1ef7-4a95-a278-83140857ac1b", "code": "bike07", "model": "36V20A21GN", "speed": 0, "qrCode": "ECOMOBILE-bike07-3f9500ff-f267-41aa-9716-f53e01ee5b67", "status": "AVAILABLE", "isActive": true, "latitude": 4.0660167, "createdAt": "2026-04-21T08:15:39.021Z", "equipment": ["headlight", "taillight", "bell", "lock", "basket", "rack", "mudguards", "reflectors"], "gpsSignal": 0, "gsmSignal": 0, "longitude": 9.7881333, "updatedAt": "2026-04-21T08:15:39.975Z", "lastSeenAt": null, "gpsDeviceId": "9170163348", "pricingPlan": null, "batteryLevel": 0, "locationName": "Position personnalisée", "lastGpsUpdate": "2026-04-21T08:09:52.000Z", "pricingPlanId": null, "currentPricing": {"isNight": false, "unlockFee": 100, "isFallback": true, "displayPrice": 250, "durationHours": 1}, "maintenanceLogs": [], "lastMaintenanceAt": null}}	172.69.37.137	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:25:10.001
ed19e3ec-1e7c-4c54-bc74-0445a7bcf461	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES		Viewed bikes list (page 1, status: all)	{"page": 1, "count": 9, "limit": 9}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:26:57.192
5a725856-7f75-422a-b990-c9621dccb584	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed complete dashboard	{"totalBikes": 11, "totalRides": 0, "totalUsers": 6}	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 11:48:01.337
2d15972a-b7c6-49da-a021-8c4c8d02c4a3	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed admin dashboard stats	null	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 11:48:02.244
38a74eef-7646-430f-a585-5e5703ac8415	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 11:48:02.245
4283b073-87b0-48ca-854b-3d3ca722aa39	3c695091-d0de-4f35-a124-de6079a518d0	CREATE	BIKE	8325d57b-bb82-4548-ad5d-90deba87f5d6	Created new bike: bike11	{"code": "bike11", "model": "36V20A21GN", "status": "AVAILABLE"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:28:19.045
a977aec1-e11e-4633-8318-3b6e7b308f1f	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES		Viewed bikes list (page 1, status: all)	{"page": 1, "count": 9, "limit": 9}	172.69.37.136	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:30:06.143
e243f35d-a670-41be-be9b-6dd5270479eb	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PROFILE	3c695091-d0de-4f35-a124-de6079a518d0	User viewed their profile	null	104.22.76.144	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-28 07:56:34.299
8dc0a407-11c5-4f16-9294-939f5fd77fb9	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PROFILE	3c695091-d0de-4f35-a124-de6079a518d0	User viewed their profile	null	104.22.76.145	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-28 07:56:45.347
f6015f67-d5c9-4cda-b79d-b6c89722ffef	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.76.144	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-28 07:56:45.91
dc159472-31b9-4721-92db-ccdefc872d11	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	104.22.76.144	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-28 07:56:45.915
d8f8a9b4-1a68-466a-bdce-503af85d096a	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	bikes		Attempted read on bikes without permission	{"userPermissions": [], "requiredPermission": "bikes:read"}	104.22.76.144	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-28 07:56:46.317
2f3ff49e-7e07-4ce5-a366-693a39572db0	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	bikes		Attempted read on bikes without permission	{"userPermissions": [], "requiredPermission": "bikes:read"}	104.22.76.144	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-28 07:56:46.555
56187d24-0dda-480d-9b6f-e9506e80f9f0	3c695091-d0de-4f35-a124-de6079a518d0	DELETE	BIKE	54171842-1b96-4b55-a5d7-323aab0c0013	Deleted bike: bike08	{"deletedBike": {"id": "54171842-1b96-4b55-a5d7-323aab0c0013", "code": "bike08", "model": "36V20A21GB", "qrCode": "ECOMOBILE-bike08-26cebd21-492e-44d7-b712-ad0d3f8a6005", "status": "AVAILABLE", "isActive": true, "latitude": 4.0656883, "createdAt": "2026-04-21T08:17:10.805Z", "equipment": ["headlight", "taillight", "bell", "lock", "basket", "rack", "mudguards", "reflectors"], "longitude": 9.7880333, "updatedAt": "2026-04-21T08:24:59.141Z", "lastSeenAt": null, "gpsDeviceId": "", "pricingPlan": null, "batteryLevel": 100, "locationName": "Position personnalisée", "pricingPlanId": null, "currentPricing": {"isNight": false, "unlockFee": 100, "isFallback": true, "displayPrice": 250, "durationHours": 1}, "maintenanceLogs": [], "lastMaintenanceAt": null}}	172.69.37.136	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:30:33.47
7d9fa8d4-8e99-490d-9bd8-89bc1322c9bf	3c695091-d0de-4f35-a124-de6079a518d0	CREATE	BIKE	398bb1fc-66e6-4aae-a742-75024261ea4e	Created new bike: bike08	{"code": "bike08", "model": "36V20A21GB", "status": "AVAILABLE"}	172.69.37.136	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:32:08.535
170a7bcd-f3af-4ee4-a622-61f00a656f74	3c695091-d0de-4f35-a124-de6079a518d0	LOGIN	AUTH	3c695091-d0de-4f35-a124-de6079a518d0	User logged in successfully	{"email": "admin@freebike.cm"}	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 13:43:21.963
3824893c-8288-418b-a227-e7c43ba4b637	\N	VIEW	SETTINGS		Viewed application settings	null	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 13:43:22.754
ef1c5d6e-8728-40a2-b927-37606e83e5b4	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed admin dashboard stats	null	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 13:43:23.743
d6ae565c-9e5f-4c84-8423-fc2b0fe78784	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed complete dashboard	{"totalBikes": 11, "totalRides": 0, "totalUsers": 6}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:29:18.544
810cce98-7850-4896-a059-839edde08e7e	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	INCIDENTS		Viewed incidents list (page 1, status: OPEN)	{"page": 1, "limit": 5, "total": 0, "status": "OPEN"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:29:18.926
35693d4a-99ba-4fdd-96eb-fdddffd6aeb9	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed admin dashboard stats	null	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:29:19.065
007f2fcd-f8c6-49e1-8d22-289d8fd3088d	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	104.22.76.144	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-28 07:56:46.326
3fa05e5d-560f-465e-9a3b-65349d474c5b	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	incidents		Attempted read on incidents without permission	{"userPermissions": [], "requiredPermission": "incidents:read"}	104.22.76.144	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	2026-04-28 07:56:46.424
69fdaa59-548f-4cd9-9a03-e58350c0a999	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 11}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:29:22.131
34e86972-c36c-4148-98ba-55bd605196f0	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES		Viewed bikes list (page 1, status: all)	{"page": 1, "count": 9, "limit": 9}	172.69.37.136	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:30:34.681
27d3ca24-3614-4576-813a-da7a0df35e0f	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed complete dashboard	{"totalBikes": 11, "totalRides": 0, "totalUsers": 6}	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 13:43:23.018
91d1e449-1f2c-4387-80b2-c96541feec4a	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:29:19.055
4556a905-b897-4b88-8720-382024769e78	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES		Viewed bikes list (page 1, status: all)	{"page": 1, "count": 9, "limit": 9}	172.69.37.136	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:32:09.766
dc4bfe84-d6d5-4c20-a8b4-9c398587db02	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKE	398bb1fc-66e6-4aae-a742-75024261ea4e	Viewed bike details: bike08	{"model": "36V20A21GB", "bikeCode": "bike08"}	172.69.37.137	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:34:01.59
4635c9df-8a62-4d20-9b82-278aa4866621	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 13:43:23.744
99bd9bc9-fe22-495d-9d9c-65990890c681	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	INCIDENTS		Viewed incidents list (page 1, status: OPEN)	{"page": 1, "limit": 5, "total": 0, "status": "OPEN"}	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 13:43:23.934
06882b6a-8b46-4925-8f18-82fe24688721	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 11}	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 13:43:29.194
b1cc8e5a-4bb8-40d5-b929-a27d04c87225	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKE_STATS	398bb1fc-66e6-4aae-a742-75024261ea4e	Viewed statistics for bike 398bb1fc-66e6-4aae-a742-75024261ea4e	{"stats": {"bike": {"id": "398bb1fc-66e6-4aae-a742-75024261ea4e", "code": "bike08", "model": "36V20A21GB", "qrCode": "ECOMOBILE-bike08-fe24d2c3-b4a6-4ac5-b6e0-e6c0679b312f", "status": "AVAILABLE", "isActive": true, "latitude": 4.0761567, "createdAt": "2026-04-21T08:32:08.528Z", "equipment": ["headlight", "taillight", "bell", "lock", "basket", "rack", "mudguards", "reflectors"], "longitude": 9.7287833, "updatedAt": "2026-04-21T08:32:09.555Z", "lastSeenAt": null, "gpsDeviceId": "9170163270", "batteryLevel": 0, "locationName": "Position personnalisée", "pricingPlanId": null, "lastMaintenanceAt": null}, "totalRides": 0, "totalRevenue": 0, "totalDistance": 0}}	172.69.37.136	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:34:01.274
c9123c07-276e-4419-a12f-cb83bd6af033	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PROFILE	3c695091-d0de-4f35-a124-de6079a518d0	User viewed their profile	null	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 14:19:26.89
e972340e-71eb-442c-b8e4-b98a8059f2b5	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed complete dashboard	{"totalBikes": 11, "totalRides": 0, "totalUsers": 6}	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 14:19:28.204
f27477b4-7ba5-45a4-aac2-b906e30245c4	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed admin dashboard stats	null	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 14:19:29.002
c26e93da-3a4d-43ab-adfc-26648b91c85e	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 14:19:29.051
d4198053-ac4d-4f45-a1c2-e4127c322e27	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES		Viewed bikes list (page 1, status: all)	{"page": 1, "count": 9, "limit": 9}	172.69.37.137	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:34:23.846
8c5546e4-657e-48af-8bcd-a83e61321444	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PROFILE	3c695091-d0de-4f35-a124-de6079a518d0	User viewed their profile	null	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 08:02:59.744
fa00b7c3-d59b-4c24-a0b0-8ca8116a6efa	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 08:03:00.163
6312ad72-309c-42aa-aa77-8a28c92ca90b	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 08:03:00.658
d0954add-7c32-4dfe-a13a-31f12f001f6b	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 08:03:00.672
da77523c-3a90-4963-ac3d-1f01ff508c97	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	incidents		Attempted read on incidents without permission	{"userPermissions": [], "requiredPermission": "incidents:read"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 08:03:00.683
bba6f163-3b86-4df5-bea4-0020b97277e3	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	bikes		Attempted read on bikes without permission	{"userPermissions": [], "requiredPermission": "bikes:read"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 08:03:00.812
2c7ee14e-ef12-4c13-b78f-931653e39027	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PROFILE	3c695091-d0de-4f35-a124-de6079a518d0	User viewed their profile	null	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 08:03:09.943
f578f1ad-5877-4729-9b40-261fe1d8e03e	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 08:03:10.739
fea18c0c-e280-41c8-a354-eeb2fb14810f	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	bikes		Attempted read on bikes without permission	{"userPermissions": [], "requiredPermission": "bikes:read"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 08:03:11.219
f6b550c2-0719-4367-b050-befa8a32c066	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 08:03:11.223
a1a21118-6f4d-47f1-b773-372e532763d5	\N	VIEW	SETTINGS		Viewed application settings	null	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 14:19:28.104
25470456-eb47-46ad-bd2e-744b01bdd1f2	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	INCIDENTS		Viewed incidents list (page 1, status: OPEN)	{"page": 1, "limit": 5, "total": 0, "status": "OPEN"}	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 14:19:29.134
1c5dae0b-d2d5-4c24-9993-cd7eb05c3f8e	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 11}	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 14:19:31.972
9dc8e981-9fc6-4bea-9af1-ecf1e8c17f63	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PROFILE	3c695091-d0de-4f35-a124-de6079a518d0	User viewed their profile	null	172.69.37.136	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:39:46.277
4d2a2e04-2bc7-4769-bed4-dee02f53caf5	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	172.69.37.136	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:39:47.853
96f2f0f5-6f69-46ff-97d9-4b7cd8915ef2	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	INCIDENTS		Viewed incidents list (page 1, status: OPEN)	{"page": 1, "limit": 5, "total": 0, "status": "OPEN"}	172.69.37.137	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:39:47.981
3e86b280-b33d-44cb-b83c-3b7f8cc65e66	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 11}	172.69.37.136	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:39:51.027
1f255611-3046-4a91-b75d-b9db0a9c32fb	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 14:53:28.759
f29df7a9-f89e-4223-b3a7-7c0062529539	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed complete dashboard	{"totalBikes": 11, "totalRides": 0, "totalUsers": 6}	172.69.37.136	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:39:46.972
c776429d-c6d4-4671-bc28-5b11847503fe	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 08:03:00.292
9f89bb2d-8f12-49c7-bdc4-c7a24df8aac0	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 08:03:10.86
04221724-f0fc-4246-940d-40c9f34f8a4f	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed complete dashboard	{"totalBikes": 11, "totalRides": 0, "totalUsers": 6}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 14:53:28.968
5d0453fc-8277-4677-9a26-4d1fda371b43	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 14:53:30.121
84e9630d-7911-4992-a5af-f6b2d1c9fe5c	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 11}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 14:53:35.56
bc3ae643-4a09-45f6-b03f-22d4bf3a0b4a	\N	VIEW	SETTINGS		Viewed application settings	null	172.69.37.136	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:39:47.24
3a6292ac-f868-4ee7-a6ea-e4fdece8305f	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed admin dashboard stats	null	172.69.37.136	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 08:39:47.852
c154ba94-8136-4c71-b23c-a92f28b1db1e	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed admin dashboard stats	null	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 14:53:30.093
cf69a4d1-ebc9-4f05-9f0e-6def8a39cb24	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	INCIDENTS		Viewed incidents list (page 1, status: OPEN)	{"page": 1, "limit": 5, "total": 0, "status": "OPEN"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-22 14:53:30.222
30f86168-0578-4902-8ea1-5ea953367be7	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed complete dashboard	{"totalBikes": 11, "totalRides": 0, "totalUsers": 6}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 09:42:47.159
07c42d75-dfcb-4bfd-83c3-298aeb3f4bd1	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES		Viewed bikes list (page 1, status: all)	{"page": 1, "count": 9, "limit": 9}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 09:42:47.29
0e87bdbc-a15e-43b0-a635-7a3148f0bc9f	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed admin dashboard stats	null	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 09:42:47.927
0f741a6b-4b88-4f52-aaa8-9196a3093421	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 11}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 09:42:53.42
0bff1dc9-d0fc-4055-af62-380623dcd30e	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PROFILE	3c695091-d0de-4f35-a124-de6079a518d0	User viewed their profile	null	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 08:12:22.518
7364a5e7-e381-4415-b388-206111e47e47	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed admin dashboard stats	null	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 08:12:26.713
ebf60397-c7f4-4669-aabf-30dec75e6540	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 08:13:27.99
42d22d09-46a6-4e78-8d23-47c44219dfae	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 09:42:47.891
8d2fb922-62c2-4feb-884e-0100eb3d1d10	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 08:12:25.812
ec3facf0-7a88-4252-b6d1-96945872dd89	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 08:12:26.706
c27e6966-5288-402c-b3c0-896a7c003648	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	INCIDENTS		Viewed incidents list (page 1, status: OPEN)	{"page": 1, "limit": 5, "total": 0, "status": "OPEN"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 08:12:26.72
59024021-7ba0-47f2-ba9a-0bba203cf98b	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 11}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 08:12:30.36
a2701f4e-7d7d-4a19-8f17-6d48bd80439f	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 08:03:11.241
472e606b-bf29-4da5-88a7-04b34ab901c8	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	incidents		Attempted read on incidents without permission	{"userPermissions": [], "requiredPermission": "incidents:read"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 08:03:11.341
cc16ef2c-f51d-433e-979d-03bc0acf5e6b	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	bikes		Attempted read on bikes without permission	{"userPermissions": [], "requiredPermission": "bikes:read"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 08:03:11.476
4f92c83d-757e-45ab-809c-08e48c2cd992	3c695091-d0de-4f35-a124-de6079a518d0	LOGOUT	AUTH	3c695091-d0de-4f35-a124-de6079a518d0	User logged out successfully	null	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 08:04:02.231
7a6f6233-6db4-4ad8-ba8e-74973a2d982f	3c695091-d0de-4f35-a124-de6079a518d0	LOGIN	AUTH	3c695091-d0de-4f35-a124-de6079a518d0	User logged in successfully	{"email": "admin@freebike.cm"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 08:04:31.624
afb9d8f8-804d-4a32-8ab3-ed3bf8a1b5b6	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 08:04:32.043
38f6cf70-83c9-4719-830e-fcfea1077b01	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 08:04:32.179
b7d2fdc5-1df9-43f5-af8f-ba88498556a6	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 11}	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 08:13:22.48
cebfcaff-abcd-43e3-aeca-2563b331a1ca	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PROFILE	3c695091-d0de-4f35-a124-de6079a518d0	User viewed their profile	null	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 08:13:23.845
b28c6d00-1476-4ecb-b11b-6eaa63f9cf2b	\N	VIEW	SETTINGS		Viewed application settings	null	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 08:13:25.136
2cce8c23-e6b5-43b9-8887-04533feb6c11	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed complete dashboard	{"totalBikes": 11, "totalRides": 0, "totalUsers": 6}	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 08:13:25.502
0e7df3e5-26d7-40ef-96cd-aa602583cb43	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	INCIDENTS		Viewed incidents list (page 1, status: OPEN)	{"page": 1, "limit": 5, "total": 0, "status": "OPEN"}	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 08:13:27.991
28936383-57a5-4d20-af75-b07523437239	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 11}	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 08:13:34.097
2bac8984-c649-4e2a-93cd-adb5632e3f10	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	INCIDENTS		Viewed incidents list (page 1, status: OPEN)	{"page": 1, "limit": 5, "total": 0, "status": "OPEN"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 09:42:47.9
48dfa217-6da9-4f6d-adee-8d37cf7539ef	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed complete dashboard	{"totalBikes": 11, "totalRides": 0, "totalUsers": 6}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 08:12:25.845
e5dbb1e8-7406-472c-a325-e01791226a96	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	DASHBOARD		Viewed admin dashboard stats	null	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 08:13:27.988
05ac1adf-b462-435d-a78f-332c6851568b	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PROFILE	3c695091-d0de-4f35-a124-de6079a518d0	User viewed their profile	null	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 10:46:57.936
5c27c745-4a70-4843-9271-2e0a3c69dee1	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	INCIDENTS		Viewed incidents list (page 1, status: OPEN)	{"page": 1, "limit": 5, "total": 0, "status": "OPEN"}	172.69.112.149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 10:47:00.861
a11f455d-8bed-4f7b-a884-cdbeb115fb2b	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 11}	172.69.112.148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-21 10:47:04.994
a386dcf2-2454-43ec-9452-cc41756f0d43	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	PROFILE	3c695091-d0de-4f35-a124-de6079a518d0	User viewed their profile	null	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 09:11:43.06
cda9d329-8cc1-4ddb-ba37-117a3aed8658	\N	VIEW	SETTINGS		Viewed application settings	null	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 09:11:44.53
5673e6e2-839f-4a11-bf9d-4c84dedfc458	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	RIDE_HISTORY		Viewed ride history (page 1)	{"page": 1, "limit": 10, "total": 0}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 09:11:45.054
ebb8784f-89c7-473c-8c76-3c592c29131c	\N	VIEW	SETTINGS		Viewed application settings	null	172.69.37.137	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 09:12:25.102
6c9fdfc1-3ed5-4a91-9e33-5961f5f01be1	3c695091-d0de-4f35-a124-de6079a518d0	VIEW	BIKES_REALTIME		Viewed real-time bike positions	{"bikeCount": 11}	172.69.37.137	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-23 09:12:28.065
f0530e29-fea0-4702-89e6-946285e990e6	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	incidents		Attempted read on incidents without permission	{"userPermissions": [], "requiredPermission": "incidents:read"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 08:04:32.544
42340620-1e9e-4063-b5e7-07dc416300a7	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	admin		Attempted read on admin without permission	{"userPermissions": [], "requiredPermission": "admin:read"}	104.22.76.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 08:04:32.575
fa563e77-674e-425a-a63d-d9bf215bae43	3c695091-d0de-4f35-a124-de6079a518d0	ACCESS_DENIED	bikes		Attempted read on bikes without permission	{"userPermissions": [], "requiredPermission": "bikes:read"}	104.22.76.144	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-28 08:04:32.697
\.


--
-- Data for Name: bikes; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.bikes (id, code, model, status, "isActive", "batteryLevel", latitude, longitude, "locationName", equipment, "lastMaintenanceAt", "lastSeenAt", "qrCode", "gpsDeviceId", "pricingPlanId", "createdAt", "updatedAt") FROM stdin;
2143c072-23c4-40f6-af26-ebf72a8cf85c	bike02	36V20A21GN	AVAILABLE	t	0	4.065815	9.7881317	4.0658, 9.7881	["headlight", "taillight", "bell", "lock", "basket", "rack", "mudguards", "reflectors"]	\N	\N	ECOMOBILE-bike02-c6449e2c-3cd7-4946-bace-6a030849ab84	9170164480	\N	2026-04-21 08:02:18.147	2026-04-24 12:55:55.85
e7f80fdc-fec0-4102-a83a-a1370c83421a	bike01	36V20A16BN	AVAILABLE	t	0	4.065925	9.7882333	4.0659, 9.7882	["headlight", "taillight", "bell", "lock", "basket", "rack", "mudguards", "reflectors"]	\N	\N	ECOMOBILE-bike01-234451c4-0f0a-4331-909e-1789b84c583b	9170163280	\N	2026-04-21 08:00:03.025	2026-04-24 12:55:57.71
398bb1fc-66e6-4aae-a742-75024261ea4e	bike08	36V20A21GB	AVAILABLE	t	0	4.0697217	9.7175667	4.0754, 9.7293	["headlight", "taillight", "bell", "lock", "basket", "rack", "mudguards", "reflectors"]	\N	\N	ECOMOBILE-bike08-fe24d2c3-b4a6-4ac5-b6e0-e6c0679b312f	9170163270	\N	2026-04-21 08:32:08.528	2026-04-28 07:23:44.285
fd8c6bf6-25e2-4e93-90f7-e8ae82ccf8b9	bike10	36V20A21GN	AVAILABLE	t	0	4.0658483	9.7881417	4.0645, 9.7425	["headlight", "taillight", "bell", "lock", "basket", "rack", "mudguards", "reflectors"]	\N	\N	ECOMOBILE-bike10-d32b4e5d-e94e-42a1-9463-8981622a4e8f	9170164450	\N	2026-04-21 08:26:56.158	2026-04-28 07:23:44.28
e2070b5b-121d-4dee-8b08-eb43da56c412	bike03	36V20A16BN	AVAILABLE	t	0	4.0660283	9.7880783	4.0658, 9.7881	["headlight", "taillight", "bell", "lock", "basket", "rack", "mudguards", "reflectors"]	\N	\N	ECOMOBILE-bike03-baeb9726-0add-4c2e-b6f0-32263eca00ac	9170164466	\N	2026-04-21 08:03:38.77	2026-04-28 07:23:44.291
8d5b24aa-db1e-4c47-a07e-ecf216965bd4	bike09	36V20A21GB	AVAILABLE	t	0	4.0657967	9.7881767	4.0659, 9.7881	["headlight", "taillight", "bell", "lock", "basket", "rack", "mudguards", "reflectors"]	\N	\N	ECOMOBILE-bike09-97dfa032-10cf-4f09-8585-5ccf118c3631	9170163284	\N	2026-04-21 08:24:13.898	2026-04-27 23:06:55.576
72efad84-1ef7-4a95-a278-83140857ac1b	bike07	36V20A21GB	AVAILABLE	t	0	4.0660933	9.7883	4.0665, 9.7880	["headlight", "taillight", "bell", "lock", "basket", "rack", "mudguards", "reflectors"]	\N	\N	ECOMOBILE-bike07-3f9500ff-f267-41aa-9716-f53e01ee5b67	9170163348	\N	2026-04-21 08:15:39.021	2026-04-27 23:06:55.579
3cbda165-ff5f-4c39-a7d4-596d58c1a748	bike06	36V20A21GB	AVAILABLE	t	0	4.06593	9.7881433	4.0657, 9.7880	["headlight", "taillight", "bell", "lock", "basket", "rack", "mudguards", "reflectors"]	\N	\N	ECOMOBILE-bike06-a1b9d38b-37e2-4a38-a6b4-17c9f3239652	9170163357	\N	2026-04-21 08:11:43.746	2026-04-27 23:06:55.581
1fbb069e-fac7-4633-9902-2d0f04b1999b	bike05	36V20A16BN	AVAILABLE	t	0	4.0658083	9.7881017	4.0757, 9.7931	["headlight", "taillight", "bell", "lock", "basket", "rack", "mudguards", "reflectors"]	\N	\N	ECOMOBILE-bike05-a62c4d11-89ba-4176-ad4b-0cbcf2424944	9170163269	\N	2026-04-21 08:08:05.952	2026-04-28 07:23:44.297
d1d6bd6a-d439-4f1f-be97-d4202e53e53f	bike04	36V20A16BN	AVAILABLE	t	0	4.0297383	9.7230667	4.0257, 9.7088	["headlight", "taillight", "bell", "lock", "basket", "rack", "mudguards", "reflectors"]	\N	\N	ECOMOBILE-bike04-85bebad5-4f99-4677-b4f6-395cbc0a8481	9170164459	\N	2026-04-21 08:05:27.902	2026-04-28 07:23:44.289
8325d57b-bb82-4548-ad5d-90deba87f5d6	bike11	36V20A21GN	AVAILABLE	t	0	4.06584	9.7880983	4.0651, 9.7879	["headlight", "taillight", "bell", "lock", "basket", "rack", "mudguards", "reflectors"]	\N	\N	ECOMOBILE-bike11-52beafac-8696-4534-976a-ab6428e15522	9170164479	\N	2026-04-21 08:28:19.041	2026-04-27 23:06:55.586
\.


--
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.chat_messages (id, "userId", message, "isAdmin", "createdAt") FROM stdin;
\.


--
-- Data for Name: free_days_beneficiaries; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.free_days_beneficiaries (id, "ruleId", "userId", "daysGranted", "daysRemaining", "startDate", "expiresAt", "isActive", "appliedAt", "lastFreeDayUsedAt", "subscriptionPausedAt", "subscriptionResumedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: free_days_rules; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.free_days_rules (id, name, description, "numberOfDays", "startType", "targetType", "targetDaysSinceRegistration", "targetMinSpend", "startHour", "endHour", "isActive", "validFrom", "validUntil", "maxBeneficiaries", "currentBeneficiaries", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: identity_documents; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.identity_documents (id, "userId", "documentType", "frontImage", "backImage", "selfieImage", status, "rejectionReason", "reviewedBy", "reviewedAt", "submittedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: incidents; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.incidents (id, "userId", "bikeId", type, description, status, priority, "resolvedAt", "refundAmount", "adminNote", "resolvedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: lock_requests; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.lock_requests (id, "userId", "bikeId", "rideId", latitude, longitude, "returnLocation", status, "requestedAt", "validatedAt", "rejectedAt", "validatedBy", "adminNote", "rejectionReason", metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: maintenance_logs; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.maintenance_logs (id, "bikeId", type, description, cost, "performedBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.notifications (id, "userId", title, message, type, "isRead", metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.permissions (id, name, description, resource, action, "createdAt") FROM stdin;
e90306f5-1cea-4f02-a5f0-8087701beba8	admin:manage	Accès administrateur complet	admin	manage	2026-04-20 12:17:54.387
70082da0-8d02-47e0-be8d-31faad192327	admin:read	Voir le tableau de bord admin	admin	read	2026-04-20 12:17:54.392
2be46795-9ba0-487d-bf5b-9a29e525a6a8	dashboard:read	Voir le tableau de bord	dashboard	read	2026-04-20 12:17:54.394
8dba1e5f-30bb-4bb2-896c-3c75450eb6cd	dashboard:export	Exporter les données du tableau de bord	dashboard	export	2026-04-20 12:17:54.396
4ae6333c-4717-4acd-a3cd-804d27952130	users:create	Créer des utilisateurs	users	create	2026-04-20 12:17:54.398
229d5946-e702-4e4a-8cad-f1b5737d1100	users:read	Voir les utilisateurs	users	read	2026-04-20 12:17:54.4
a7b7d5c1-8323-48b1-bfc7-75e8efe24b53	users:update	Modifier les utilisateurs	users	update	2026-04-20 12:17:54.402
0dc4d5f7-ffa7-4e52-a793-14b42596aaa6	users:delete	Supprimer des utilisateurs	users	delete	2026-04-20 12:17:54.403
19930b34-2ffc-4e78-aaa1-ef78c22a2e80	users:export	Exporter la liste des utilisateurs	users	export	2026-04-20 12:17:54.42
be1b4cfe-2e01-4d1d-b32c-8f0ba45b722e	users:manage	Gestion complète des utilisateurs	users	manage	2026-04-20 12:17:54.422
d99dceb7-6a22-41cb-a07d-a560d193c69e	users:ban	Bloquer/débloquer des utilisateurs	users	ban	2026-04-20 12:17:54.424
d2febc18-728e-4f2a-8905-8bc00ac447a9	users:verify	Vérifier manuellement les comptes utilisateurs	users	verify	2026-04-20 12:17:54.427
23c778ff-1a41-4432-961f-a90839e303e1	users:reset_password	Réinitialiser le mot de passe d'un utilisateur	users	reset_password	2026-04-20 12:17:54.428
6c59eff4-42b4-46ec-ae76-0070ccaec418	users:manage_deposit	Gérer la caution des utilisateurs	users	manage_deposit	2026-04-20 12:17:54.43
4b779cd3-4db2-4695-8453-1e7300416766	users:manage_wallet	Gérer le portefeuille des utilisateurs	users	manage_wallet	2026-04-20 12:17:54.432
e4559a8c-eee1-4971-961b-e55e322fb135	users:view_documents	Voir les documents des utilisateurs	users	view_documents	2026-04-20 12:17:54.434
51ec93f4-66d5-4be5-879b-1de32036e158	users:validate_documents	Valider les documents des utilisateurs	users	validate_documents	2026-04-20 12:17:54.437
2d8d33db-a727-49c3-9307-577a5e7b4ac0	bikes:create	Ajouter des vélos	bikes	create	2026-04-20 12:17:54.438
2c9cf870-d095-465d-ba17-fe74c609f7a2	bikes:read	Voir les vélos	bikes	read	2026-04-20 12:17:54.44
6dd21728-b753-45c8-af5d-c2befd51d0a5	bikes:update	Modifier les vélos	bikes	update	2026-04-20 12:17:54.442
2b9ba887-8885-4bed-9729-f97ed5a0ea02	bikes:delete	Supprimer des vélos	bikes	delete	2026-04-20 12:17:54.443
e74e008d-333a-482e-928d-8503c0e713d4	bikes:export	Exporter la liste des vélos	bikes	export	2026-04-20 12:17:54.445
830d561c-7432-471d-92d0-97a232d0ee6f	bikes:manage	Gestion complète des vélos	bikes	manage	2026-04-20 12:17:54.447
cc5e2b7f-7541-4ca4-9714-8d00a829327c	bikes:view_map	Voir la carte des vélos	bikes	view_map	2026-04-20 12:17:54.448
90be9fa2-d1b3-4dcc-82e8-fe0307dcf8f9	bikes:view_trips	Voir l'historique des trajets d'un vélo	bikes	view_trips	2026-04-20 12:17:54.45
99fb24ff-2bcd-4223-b7fa-f4b519cff00f	bikes:view_maintenance	Voir l'historique de maintenance d'un vélo	bikes	view_maintenance	2026-04-20 12:17:54.452
20a011a0-04bd-4fa0-aa2d-f4740bd73521	bikes:manage_actions	Gérer les actions sur les vélos (verrouillage, déverrouillage)	bikes	manage_actions	2026-04-20 12:17:54.454
5d129409-ca34-48c6-ac52-701bbd21208b	reservations:create	Créer des réservations	reservations	create	2026-04-20 12:17:54.455
083b77a5-1ffa-4050-838b-f42914d89065	reservations:read	Voir les réservations	reservations	read	2026-04-20 12:17:54.458
51e3a6eb-327a-485c-90ba-7e654cc053d5	reservations:update	Modifier les réservations	reservations	update	2026-04-20 12:17:54.46
7a579421-7f3c-4b9a-b810-7e0d2e83a334	reservations:delete	Supprimer des réservations	reservations	delete	2026-04-20 12:17:54.462
17682675-df4e-45d5-9cdc-509753dfcc2e	reservations:export	Exporter les réservations	reservations	export	2026-04-20 12:17:54.464
2bb35ec3-a2d3-4dda-95ea-689dea22035c	reservations:manage	Gestion complète des réservations	reservations	manage	2026-04-20 12:17:54.465
66eb7524-9698-4a5a-bc48-c36d126ea4b2	reservations:cancel	Annuler des réservations	reservations	cancel	2026-04-20 12:17:54.468
c420b87e-0661-4cff-aa68-58fc059344f5	rides:create	Créer des trajets	rides	create	2026-04-20 12:17:54.469
6d03a79c-c4cc-4d8a-bc4c-d1be1c535d80	rides:read	Voir les trajets	rides	read	2026-04-20 12:17:54.471
5e1d4ff5-caa8-4538-8dcf-d728d7ca3e35	rides:update	Modifier les trajets	rides	update	2026-04-20 12:17:54.473
c2c34670-6111-4ec8-9cf9-84673e9997d9	rides:delete	Supprimer des trajets	rides	delete	2026-04-20 12:17:54.476
b8473518-39f6-40a5-8406-98fa89f799ec	rides:export	Exporter les trajets	rides	export	2026-04-20 12:17:54.478
7da7861e-29c3-48f2-9489-665c7e49b01e	rides:manage	Gestion complète des trajets	rides	manage	2026-04-20 12:17:54.479
00b2f75d-d19e-4da8-8e49-e53bf8d46855	maintenance:create	Ajouter des entrées de maintenance	maintenance	create	2026-04-20 12:17:54.481
05337d2e-eeb6-4ed5-956f-c5ddb2c0ec71	maintenance:read	Voir les entrées de maintenance	maintenance	read	2026-04-20 12:17:54.483
39216aaa-e0f1-48ea-abf6-b14b6cb318e5	maintenance:update	Modifier les entrées de maintenance	maintenance	update	2026-04-20 12:17:54.484
5d6c1e3d-09a4-4c87-9298-64348369f083	maintenance:delete	Supprimer des entrées de maintenance	maintenance	delete	2026-04-20 12:17:54.487
c7f545ca-32e8-4d7b-aeea-503bd85d3169	maintenance:export	Exporter les données de maintenance	maintenance	export	2026-04-20 12:17:54.488
f5319a0a-c232-4735-afae-948b2524809d	maintenance:manage	Gestion complète de la maintenance	maintenance	manage	2026-04-20 12:17:54.49
8293ce8b-cec8-42bd-8525-928c03e74722	chat:create	Envoyer des messages	chat	create	2026-04-20 12:17:54.492
64008f4b-8813-48aa-9051-c8c8d4b4b432	chat:read	Voir les conversations	chat	read	2026-04-20 12:17:54.494
b521a061-5b91-4019-9e83-97096a64e8c6	chat:update	Modifier des messages	chat	update	2026-04-20 12:17:54.496
c56b5357-26a7-40f8-8a46-d1f752fc8d2b	chat:delete	Supprimer des messages	chat	delete	2026-04-20 12:17:54.497
cad9589d-1d1e-4a33-876c-1526e5c50fbb	chat:manage	Gestion complète du chat	chat	manage	2026-04-20 12:17:54.499
6874f17f-7205-4cdf-b792-05ec400edd8d	notifications:create	Envoyer des notifications	notifications	create	2026-04-20 12:17:54.501
03888d29-f94b-4a4c-bfaf-834d91b63ef0	notifications:read	Voir les notifications	notifications	read	2026-04-20 12:17:54.503
87ca1092-4971-4f8a-acee-ed0241d48783	notifications:update	Modifier des notifications	notifications	update	2026-04-20 12:17:54.505
13d1312b-7e85-4cb6-803f-58327040286f	notifications:delete	Supprimer des notifications	notifications	delete	2026-04-20 12:17:54.506
7367ce47-5a0b-4224-b391-fe5836bb846f	notifications:manage	Gestion complète des notifications	notifications	manage	2026-04-20 12:17:54.508
14fc6541-160c-416f-981e-fbd7886fbd2c	notifications:send_bulk	Envoyer des notifications en masse	notifications	send_bulk	2026-04-20 12:17:54.511
587903e3-82fb-4949-9c98-e754158281bc	wallet:read	Voir les données du portefeuille	wallet	read	2026-04-20 12:17:54.513
7cb75df8-5fac-4965-b00c-03266b59de27	wallet:update	Modifier le portefeuille	wallet	update	2026-04-20 12:17:54.514
8a626b06-8f8d-4180-88ab-1e19be97af21	wallet:manage	Gestion complète du portefeuille	wallet	manage	2026-04-20 12:17:54.518
3474eb73-6a6b-4bcd-8975-c475ddbcd933	wallet:export	Exporter les données financières	wallet	export	2026-04-20 12:17:54.52
d1ff14bb-9c3b-496e-9980-6d1cb1b0ed78	wallet:refund	Effectuer des remboursements	wallet	refund	2026-04-20 12:17:54.522
548af476-8964-4475-8a0c-c21c2a7603e9	settings:read	Voir les paramètres	settings	read	2026-04-20 12:17:54.528
ffed896d-2121-4620-8c47-801a2b43fff5	settings:update	Modifier les paramètres	settings	update	2026-04-20 12:17:54.53
1ab9e7a0-911f-419e-87eb-98536b53ca8f	settings:manage	Gestion complète des paramètres	settings	manage	2026-04-20 12:17:54.532
707249e6-2004-4ae6-89fc-27435a4aa27e	pricing:read	Voir la tarification	pricing	read	2026-04-20 12:17:54.533
f0b6ba70-900d-4f3c-b154-a2121889062b	pricing:manage	Gestion complète de la tarification	pricing	manage	2026-04-20 12:17:54.54
28e95a59-9aac-49e8-9b1f-a0176c4c9936	pricing:manage_free_days	Gérer les règles de jours gratuits	pricing	manage_free_days	2026-04-20 12:17:54.542
915bc18a-b23d-4f3f-8a13-8470f2a3672e	incidents:create	Créer des incidents	incidents	create	2026-04-20 12:17:54.544
ed71c96a-5158-4e13-8108-2e0a7f206483	incidents:read	Voir les incidents	incidents	read	2026-04-20 12:17:54.546
27b4c560-bcc8-41f4-a220-b3eb97dee4cc	incidents:update	Modifier les incidents	incidents	update	2026-04-20 12:17:54.547
7228042d-6603-4c0b-b6f9-2472140dab78	incidents:delete	Supprimer des incidents	incidents	delete	2026-04-20 12:17:54.549
8badfc21-fe68-48fe-9306-3e2934be8b30	reviews:read	Voir les avis	reviews	read	2026-04-20 12:17:54.558
58c65f24-7166-4881-b5da-09669e8f59a7	reviews:update	Modifier des avis	reviews	update	2026-04-20 12:17:54.56
2c9670f1-21c4-4375-8606-e2c966271e03	reviews:delete	Supprimer des avis	reviews	delete	2026-04-20 12:17:54.562
215a1771-bb90-48f1-9bc3-b3bde0958365	reviews:export	Exporter les avis	reviews	export	2026-04-20 12:17:54.564
642cdb6a-51b1-482b-aa3e-6c1e0da69188	logs:delete	Supprimer des journaux d'activité	logs	delete	2026-04-20 12:17:54.577
f3597cf4-e7b9-43b7-b4b9-6aaec6178bde	roles:create	Créer des rôles	roles	create	2026-04-20 12:17:54.579
77ae9a94-c90d-4dba-b378-f19d8259cab7	roles:read	Voir les rôles	roles	read	2026-04-20 12:17:54.582
c7481421-8254-40f7-a992-10eb6f03147a	roles:manage	Gestion complète des rôles	roles	manage	2026-04-20 12:17:54.587
e0294030-091d-4bf7-9497-834f29a46920	roles:assign	Assigner des rôles aux employés	roles	assign	2026-04-20 12:17:54.589
77524300-6b79-4bce-8b22-17e10a8cc170	permissions:read	Voir les permissions	permissions	read	2026-04-20 12:17:54.591
7280ee3e-dbac-40fd-bfa1-3cf50643df08	employees:delete	Supprimer des employés	employees	delete	2026-04-20 12:17:54.598
7ed35511-c647-421b-b2be-4f50e503b527	employees:export	Exporter la liste des employés	employees	export	2026-04-20 12:17:54.6
ec331e9d-a228-49d0-a01f-c05444bc0ffd	employees:manage	Gestion complète des employés	employees	manage	2026-04-20 12:17:54.602
01f5ec9f-bea8-49b2-9ce4-75c1847c6027	employees:reset_password	Réinitialiser le mot de passe d'un employé	employees	reset_password	2026-04-20 12:17:54.603
3dad357b-9749-4478-835d-9eb59a1c0d7c	subscriptions:delete	Supprimer des abonnements	subscriptions	delete	2026-04-20 12:17:54.611
392fc6c0-d4ba-4c68-b777-1cc38e03bc11	subscriptions:export	Exporter les abonnements	subscriptions	export	2026-04-20 12:17:54.613
6062988c-d8ed-484e-bb85-df3621ca7c96	subscriptions:manage	Gestion complète des abonnements	subscriptions	manage	2026-04-20 12:17:54.615
09f7343f-4c8d-4702-be64-14b9fe968e4e	wallet:charge	Débiter un compte utilisateur	wallet	charge	2026-04-20 12:17:54.524
99745f0d-e293-40a3-9e5b-02734e4f92e8	wallet:view_transactions	Voir les transactions	wallet	view_transactions	2026-04-20 12:17:54.526
dc6e9dbf-1220-477a-b7b5-e83342d7ca1d	pricing:create	Créer des plans tarifaires	pricing	create	2026-04-20 12:17:54.535
8a1fedec-1c20-49cb-9784-fa8916db5105	pricing:update	Modifier la tarification	pricing	update	2026-04-20 12:17:54.536
5b99b3c2-c3e5-454b-8695-96d27348a055	pricing:delete	Supprimer des plans tarifaires	pricing	delete	2026-04-20 12:17:54.538
db464f3d-feb2-4f98-8e10-418ef80fe1b4	incidents:export	Exporter les incidents	incidents	export	2026-04-20 12:17:54.55
b1f03053-8171-4d6f-a7ee-c39ea5ff12ad	incidents:manage	Gestion complète des incidents	incidents	manage	2026-04-20 12:17:54.552
f6dc45f0-1c41-4fbb-9c9e-b4a0d3ad585e	incidents:resolve	Résoudre des incidents	incidents	resolve	2026-04-20 12:17:54.554
dc86105e-75a4-4c9e-9286-9edbf9ffa6e4	reviews:create	Créer des avis	reviews	create	2026-04-20 12:17:54.556
fef9b025-391c-4ddb-ab87-eca4f988bd52	reviews:manage	Gestion complète des avis	reviews	manage	2026-04-20 12:17:54.567
10c719cd-4cd5-487a-81ab-79a0316aae29	reviews:moderate	Modérer les avis (approuver/rejeter)	reviews	moderate	2026-04-20 12:17:54.569
33209b78-5d35-4af6-8f57-b8a67006bb11	logs:read	Voir les journaux d'activité	logs	read	2026-04-20 12:17:54.571
ede92d09-1f1a-4b5f-8315-a3eb8a4bd89e	logs:export	Exporter les journaux d'activité	logs	export	2026-04-20 12:17:54.574
0a713860-c66a-41d5-bd10-bdd4795f7dfb	roles:update	Modifier des rôles	roles	update	2026-04-20 12:17:54.583
ae959be4-1d51-48b1-86d8-b544366001d6	roles:delete	Supprimer des rôles	roles	delete	2026-04-20 12:17:54.585
56994afb-caaa-44e1-8c37-72830c5355eb	permissions:manage	Gérer les permissions	permissions	manage	2026-04-20 12:17:54.592
91487a93-abc4-4c6b-9ed8-a7c230984c76	employees:create	Créer des employés	employees	create	2026-04-20 12:17:54.594
7cf9e44c-4f45-485a-811a-85dc59d6b49d	employees:read	Voir les employés	employees	read	2026-04-20 12:17:54.595
1fabde2c-0576-4b5e-b2b3-a8f1b099fc0c	employees:update	Modifier des employés	employees	update	2026-04-20 12:17:54.597
93c3b968-6731-485f-9c99-88c2e8f7d72d	subscriptions:read	Voir les abonnements	subscriptions	read	2026-04-20 12:17:54.605
2ac82ffa-e6ce-4997-a839-6390b28cd379	subscriptions:create	Créer des abonnements	subscriptions	create	2026-04-20 12:17:54.607
4449a13a-30e9-43ce-90ce-4f38b5363f98	subscriptions:update	Modifier des abonnements	subscriptions	update	2026-04-20 12:17:54.609
88d54507-c1b7-4588-b0ef-041cc246cd47	monitoring:read	Voir le monitoring de sécurité	monitoring	read	2026-04-20 12:17:54.616
68863697-d26f-4986-87da-aca103b1a492	monitoring:manage	Gérer le monitoring de sécurité	monitoring	manage	2026-04-20 12:17:54.618
0fc6dec2-b729-40d9-991a-4cd646350eea	documents:read	Voir les documents	documents	read	2026-04-20 12:17:54.62
ef09154e-ee87-4e85-93b5-f92c8804284b	documents:update	Modifier les documents	documents	update	2026-04-20 12:17:54.622
6a76985c-7779-4b2f-9688-3fd4106f522c	documents:delete	Supprimer des documents	documents	delete	2026-04-20 12:17:54.624
cad4919b-f281-4faf-8518-db2a8b793f72	documents:manage	Gestion complète des documents	documents	manage	2026-04-20 12:17:54.625
bac1b82c-9e17-4a0a-bfa0-2b859cbf40ca	documents:validate	Valider des documents	documents	validate	2026-04-20 12:17:54.627
\.


--
-- Data for Name: plan_overrides; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.plan_overrides (id, "planId", "overTimeType", "overTimeValue", "hourlyStartHour", "hourlyEndHour", "dailyStartHour", "dailyEndHour", "weeklyStartHour", "weeklyEndHour", "monthlyStartHour", "monthlyEndHour", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: pricing_configs; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.pricing_configs (id, "unlockFee", "baseHourlyRate", "isActive", "createdAt", "updatedAt") FROM stdin;
31c654aa-ee98-4247-a65b-7dcaa1816008	100	250	t	2026-04-20 12:17:55.421	2026-04-20 19:07:36.74
\.


--
-- Data for Name: pricing_plans; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.pricing_plans (id, "pricingConfigId", name, type, "hourlyRate", "dailyRate", "weeklyRate", "monthlyRate", "minimumHours", discount, "isActive", conditions, "createdAt", "updatedAt") FROM stdin;
54ab1f70-a574-4041-8d56-13b40493f017	31c654aa-ee98-4247-a65b-7dcaa1816008	Standard	HOURLY	200	3000	18000	60000	1	0	t	{}	2026-04-20 12:17:55.425	2026-04-20 12:17:55.425
\.


--
-- Data for Name: pricing_rules; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.pricing_rules (id, "pricingConfigId", name, "dayOfWeek", "startHour", "endHour", multiplier, "isActive", priority, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: pricing_tiers; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.pricing_tiers (id, name, "durationMinutes", price, "dayStartHour", "dayEndHour", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: promotion_package_relations; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.promotion_package_relations (id, "promotionId", "packageId", "formulaId", "createdAt") FROM stdin;
\.


--
-- Data for Name: promotion_plans; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.promotion_plans (id, "promotionId", "planId") FROM stdin;
\.


--
-- Data for Name: promotions; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.promotions (id, "pricingConfigId", name, description, "discountType", "discountValue", "startDate", "endDate", "isActive", "usageLimit", "usageCount", conditions, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: push_tokens; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.push_tokens (id, "userId", token, device, platform, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: reservations; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.reservations (id, "userId", "bikeId", "planId", "packageType", "startDate", "endDate", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: residence_proofs; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.residence_proofs (id, "userId", "proofType", "documentFile", latitude, longitude, address, details, status, "rejectionReason", "reviewedBy", "reviewedAt", "submittedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.reviews (id, "userId", "firstName", "lastName", "socialStatus", photo, rating, comment, status, "reviewedBy", "reviewedAt", "moderatorComment", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: rides; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.rides (id, "userId", "bikeId", "planId", "startTime", "endTime", "startLatitude", "startLongitude", "endLatitude", "endLongitude", distance, duration, cost, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.role_permissions (id, "roleId", "permissionId") FROM stdin;
49b15307-4892-4fb8-a63d-f1af63797a0e	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	e90306f5-1cea-4f02-a5f0-8087701beba8
c2eb51b2-8c16-4350-bfa9-0e80962a6962	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	70082da0-8d02-47e0-be8d-31faad192327
2d7005d1-2ef0-4679-a905-bbcb2275dac6	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	2be46795-9ba0-487d-bf5b-9a29e525a6a8
4b8bb580-8e9e-418c-8289-964deb8e93bb	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	8dba1e5f-30bb-4bb2-896c-3c75450eb6cd
bab2ed4d-1f49-44c3-bac4-8b4dc34a33d0	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	4ae6333c-4717-4acd-a3cd-804d27952130
f08797df-d241-4f9a-9561-2bf71f77e518	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	229d5946-e702-4e4a-8cad-f1b5737d1100
b017b2ba-be49-464d-af0a-01491d3e9228	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	a7b7d5c1-8323-48b1-bfc7-75e8efe24b53
beb62144-7662-4e1d-aa04-f1f71b7c0e87	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	0dc4d5f7-ffa7-4e52-a793-14b42596aaa6
6a25b3eb-23b0-4ee3-bd7e-8666d95a86f6	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	19930b34-2ffc-4e78-aaa1-ef78c22a2e80
7b317385-272d-4aa6-8152-d522ff1e6f9f	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	be1b4cfe-2e01-4d1d-b32c-8f0ba45b722e
89ee9ab7-b119-485e-87cd-59c7344fb1b5	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	d99dceb7-6a22-41cb-a07d-a560d193c69e
842f28d3-ecfe-49c5-959c-1988f13231f0	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	d2febc18-728e-4f2a-8905-8bc00ac447a9
70d5ae8f-fa7c-4572-b69b-766b46cad593	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	23c778ff-1a41-4432-961f-a90839e303e1
4ab62df6-bd32-486f-814a-e57d6e693cae	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	6c59eff4-42b4-46ec-ae76-0070ccaec418
547bd240-82fb-4bc9-aa33-90ac4e659858	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	4b779cd3-4db2-4695-8453-1e7300416766
4724658e-28c1-4688-84b7-ce5055593e28	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	e4559a8c-eee1-4971-961b-e55e322fb135
85783c39-ec82-4ade-ae7c-b1f5cb7421bf	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	51ec93f4-66d5-4be5-879b-1de32036e158
1c922d90-65d5-4d84-9032-4dc30335a207	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	2d8d33db-a727-49c3-9307-577a5e7b4ac0
89995ac7-4ac3-4f8a-8e88-e08799529b30	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	2c9cf870-d095-465d-ba17-fe74c609f7a2
3223e61c-66ee-429e-a75b-bec1fa604f1b	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	6dd21728-b753-45c8-af5d-c2befd51d0a5
9d132a3b-28b8-43cf-8151-f8af79917ab7	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	2b9ba887-8885-4bed-9729-f97ed5a0ea02
d2dfbe95-20c7-4be3-a666-f92884dc6204	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	e74e008d-333a-482e-928d-8503c0e713d4
9d8da5f2-64c7-4f26-8d55-e9f34037bf92	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	830d561c-7432-471d-92d0-97a232d0ee6f
495604aa-f741-48c2-9b47-1b7289d30b7f	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	cc5e2b7f-7541-4ca4-9714-8d00a829327c
56b1936b-88fe-4bb5-92d3-0887dd2795f2	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	90be9fa2-d1b3-4dcc-82e8-fe0307dcf8f9
ad04a1bd-2ec3-4463-a77b-2a8985b83713	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	99fb24ff-2bcd-4223-b7fa-f4b519cff00f
c181290f-aed2-4891-986a-6ea8f382ff82	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	20a011a0-04bd-4fa0-aa2d-f4740bd73521
b338248e-d7c2-47d9-a59f-1459a149a72b	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	5d129409-ca34-48c6-ac52-701bbd21208b
7ad1e2b0-4ae1-4341-9d02-a07ec09d70ed	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	083b77a5-1ffa-4050-838b-f42914d89065
7d37d852-edcd-4757-a544-994e23f55a31	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	51e3a6eb-327a-485c-90ba-7e654cc053d5
93901de9-089c-4a22-915f-042523d24967	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	7a579421-7f3c-4b9a-b810-7e0d2e83a334
6fe2d6a4-3ce0-43cf-a087-a0d753e3086c	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	17682675-df4e-45d5-9cdc-509753dfcc2e
9b535f22-71bb-49e5-a872-ac72345fc2e2	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	2bb35ec3-a2d3-4dda-95ea-689dea22035c
192a8535-ad0e-47a5-9102-fa1df263c621	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	66eb7524-9698-4a5a-bc48-c36d126ea4b2
6c4aaef2-f732-491a-837e-98287573afd8	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	c420b87e-0661-4cff-aa68-58fc059344f5
f6490149-77d6-4104-9ba2-02e3fc747b69	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	6d03a79c-c4cc-4d8a-bc4c-d1be1c535d80
e265bfc5-05b5-4171-b61b-c9cf8cbbccb9	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	5e1d4ff5-caa8-4538-8dcf-d728d7ca3e35
fa7e63cf-b810-41a6-bede-82cfcd79c924	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	c2c34670-6111-4ec8-9cf9-84673e9997d9
6b4f047c-5baf-43aa-bbd8-e0f39934674c	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	b8473518-39f6-40a5-8406-98fa89f799ec
f5fd16fa-08e5-4c0c-8458-cbc172473ea5	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	7da7861e-29c3-48f2-9489-665c7e49b01e
c1822f62-71aa-4211-a30e-215a2f08c45d	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	00b2f75d-d19e-4da8-8e49-e53bf8d46855
20be6cac-4c1e-4317-96e7-e63125378d16	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	05337d2e-eeb6-4ed5-956f-c5ddb2c0ec71
b2fe2822-c24c-4c04-8c78-725bac41cf90	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	39216aaa-e0f1-48ea-abf6-b14b6cb318e5
e9157ed6-7c11-4154-9088-2ac46928afa6	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	5d6c1e3d-09a4-4c87-9298-64348369f083
10dce6a0-d6e1-4b73-9e38-b1485e49582b	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	c7f545ca-32e8-4d7b-aeea-503bd85d3169
e7619275-2ae8-47c1-a713-d8b7eadde3d5	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	f5319a0a-c232-4735-afae-948b2524809d
7d3f96f7-1596-4727-8039-45c97904c1ec	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	8293ce8b-cec8-42bd-8525-928c03e74722
4bdbc86b-42d4-4ef1-8c68-71076b78d733	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	64008f4b-8813-48aa-9051-c8c8d4b4b432
df611f12-1dec-45d4-9cdd-4154c398aa1f	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	b521a061-5b91-4019-9e83-97096a64e8c6
c9412572-9ed2-4348-9807-0d8b7235a956	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	c56b5357-26a7-40f8-8a46-d1f752fc8d2b
f43bd4e0-2e11-41ac-a1f0-07a5dca9608c	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	cad9589d-1d1e-4a33-876c-1526e5c50fbb
245e2904-0bf8-4aa7-9add-a5ab19d9798e	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	6874f17f-7205-4cdf-b792-05ec400edd8d
d47412c9-f392-47f6-a189-44f59e7f4608	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	03888d29-f94b-4a4c-bfaf-834d91b63ef0
54af44e1-29d6-4fd0-8c06-891fb124a8e5	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	87ca1092-4971-4f8a-acee-ed0241d48783
b68f869a-e436-4bc6-be4a-3ed52713b708	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	13d1312b-7e85-4cb6-803f-58327040286f
76aaf4f1-5e34-4ddc-b9e2-aac6b2280553	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	7367ce47-5a0b-4224-b391-fe5836bb846f
87cb827e-ee4b-43b1-bb5a-c6923da6902d	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	14fc6541-160c-416f-981e-fbd7886fbd2c
ab632c07-5631-4162-8d6a-5c44962cb9f9	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	587903e3-82fb-4949-9c98-e754158281bc
aa3070b7-1a88-41fb-b22e-8d001c9c0fb3	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	7cb75df8-5fac-4965-b00c-03266b59de27
f558060b-c9d0-4c77-829e-b948a675345a	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	548af476-8964-4475-8a0c-c21c2a7603e9
7c1f071f-23d5-4fdc-b9cf-eb7e6b3c64a9	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	ffed896d-2121-4620-8c47-801a2b43fff5
e9d065bb-6215-47b0-b00e-5f84559c4710	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	707249e6-2004-4ae6-89fc-27435a4aa27e
0e8ca407-5e10-4eb0-bc86-b7b6b4456b50	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	f0b6ba70-900d-4f3c-b154-a2121889062b
4d68b1bc-8f4f-4116-9df8-da6f4c341067	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	28e95a59-9aac-49e8-9b1f-a0176c4c9936
f2c7400f-4dc1-45a8-a917-c8cadc5b2b2a	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	915bc18a-b23d-4f3f-8a13-8470f2a3672e
86c1a162-7dbd-44d3-b5e2-0fcd97c9ea82	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	58c65f24-7166-4881-b5da-09669e8f59a7
64b18ec3-8b50-4177-adea-dc931779921b	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	f3597cf4-e7b9-43b7-b4b9-6aaec6178bde
488a0b07-0150-4cea-9ae6-0a94b09f3a74	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	77ae9a94-c90d-4dba-b378-f19d8259cab7
30fddf25-f1d4-4800-a316-725477587da5	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	c7481421-8254-40f7-a992-10eb6f03147a
0bd3c9a4-372f-4e0c-8055-2a0e2f9c36ea	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	e0294030-091d-4bf7-9497-834f29a46920
488e4fc7-072e-409e-8424-5406f5a3af94	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	7ed35511-c647-421b-b2be-4f50e503b527
3c4e9381-99db-4a60-ba66-33684df13b40	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	ec331e9d-a228-49d0-a01f-c05444bc0ffd
e0caab54-b2f0-4800-a412-d379e0ec121a	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	01f5ec9f-bea8-49b2-9ce4-75c1847c6027
d1916ab2-d065-49a7-9cc9-478957cd8ab0	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	3dad357b-9749-4478-835d-9eb59a1c0d7c
773b9e73-fb3a-454c-814a-94ce3332797a	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	8a1fedec-1c20-49cb-9784-fa8916db5105
258b6613-3591-4fd4-8e4d-1e11c9b67035	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	5b99b3c2-c3e5-454b-8695-96d27348a055
e08b4f22-216c-4cdc-a6dc-3201a4d7d3e6	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	dc86105e-75a4-4c9e-9286-9edbf9ffa6e4
639befc2-0657-4247-8c11-73e38be866df	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	33209b78-5d35-4af6-8f57-b8a67006bb11
d655d43b-543d-4574-98f9-eec841e57530	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	ede92d09-1f1a-4b5f-8315-a3eb8a4bd89e
5bf95d50-3034-4dd2-bf96-17d5ae2c4c88	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	0a713860-c66a-41d5-bd10-bdd4795f7dfb
5ee25eec-b795-4305-9668-a2c44f503e0d	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	ae959be4-1d51-48b1-86d8-b544366001d6
746bc7bc-f5b8-40e8-95cc-bc12e5e56749	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	56994afb-caaa-44e1-8c37-72830c5355eb
53631985-bc81-4f50-a8c2-4516eafa8316	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	93c3b968-6731-485f-9c99-88c2e8f7d72d
be8767e3-7fce-4296-9ce1-0d0ce3f17c43	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	2ac82ffa-e6ce-4997-a839-6390b28cd379
fa5a03f4-8d59-4289-8eb3-a0fbcac29e24	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	4449a13a-30e9-43ce-90ce-4f38b5363f98
33bd6101-b6f3-4a0a-b350-48262d996dfe	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	88d54507-c1b7-4588-b0ef-041cc246cd47
acae4e1e-6657-47bb-b29c-afc25dcd78bf	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	6a76985c-7779-4b2f-9688-3fd4106f522c
a63fcacb-a07e-49f9-a707-ad30a3efc9d7	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	cad4919b-f281-4faf-8518-db2a8b793f72
eca7e8b7-a49d-4a2d-956c-7eb60339d664	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	bac1b82c-9e17-4a0a-bfa0-2b859cbf40ca
324aa5a8-330d-4aa8-a3b7-8573394fe2f9	68df64e1-2f59-47dd-b7ad-8a035a04caeb	70082da0-8d02-47e0-be8d-31faad192327
2684bac2-6dac-43cb-8e10-21ebc29ea536	68df64e1-2f59-47dd-b7ad-8a035a04caeb	8dba1e5f-30bb-4bb2-896c-3c75450eb6cd
702ce91c-4875-42da-86aa-329ae418d032	68df64e1-2f59-47dd-b7ad-8a035a04caeb	a7b7d5c1-8323-48b1-bfc7-75e8efe24b53
cd5f2d8c-08be-4db4-aeff-82ae603f9e85	68df64e1-2f59-47dd-b7ad-8a035a04caeb	19930b34-2ffc-4e78-aaa1-ef78c22a2e80
73f5e2ef-8745-4756-a230-f378c8001ece	68df64e1-2f59-47dd-b7ad-8a035a04caeb	d99dceb7-6a22-41cb-a07d-a560d193c69e
1d30d856-2045-479e-a525-9b3ffb94641a	68df64e1-2f59-47dd-b7ad-8a035a04caeb	6c59eff4-42b4-46ec-ae76-0070ccaec418
19d945fa-3886-4957-b660-00efcb0ffdee	68df64e1-2f59-47dd-b7ad-8a035a04caeb	2c9cf870-d095-465d-ba17-fe74c609f7a2
8c1d332d-8e16-479c-9dd7-b5b4c0fee22e	68df64e1-2f59-47dd-b7ad-8a035a04caeb	cc5e2b7f-7541-4ca4-9714-8d00a829327c
b85aa933-9dff-42c6-b9f7-4532cec55c5f	68df64e1-2f59-47dd-b7ad-8a035a04caeb	90be9fa2-d1b3-4dcc-82e8-fe0307dcf8f9
d92d9bce-83ca-4482-98ff-dcde15a50e7c	68df64e1-2f59-47dd-b7ad-8a035a04caeb	083b77a5-1ffa-4050-838b-f42914d89065
4c55244a-b9aa-4352-9639-5dbbc80137a4	68df64e1-2f59-47dd-b7ad-8a035a04caeb	51e3a6eb-327a-485c-90ba-7e654cc053d5
5a450c71-b5d5-4e05-a2c7-923b1367fc05	68df64e1-2f59-47dd-b7ad-8a035a04caeb	66eb7524-9698-4a5a-bc48-c36d126ea4b2
9f8b49f8-35ce-4774-8521-9b01b2fce951	68df64e1-2f59-47dd-b7ad-8a035a04caeb	6d03a79c-c4cc-4d8a-bc4c-d1be1c535d80
0b41ecbc-47cf-42ec-82cd-c1fb125dca24	68df64e1-2f59-47dd-b7ad-8a035a04caeb	00b2f75d-d19e-4da8-8e49-e53bf8d46855
54effd0f-0146-4e49-89ff-3b94d12cf7c5	68df64e1-2f59-47dd-b7ad-8a035a04caeb	05337d2e-eeb6-4ed5-956f-c5ddb2c0ec71
5d513a1e-78e9-4a88-85a7-10383a82ede8	68df64e1-2f59-47dd-b7ad-8a035a04caeb	c7f545ca-32e8-4d7b-aeea-503bd85d3169
8f896b59-5688-4852-86a2-cc1789f7dbfb	68df64e1-2f59-47dd-b7ad-8a035a04caeb	915bc18a-b23d-4f3f-8a13-8470f2a3672e
53177e4e-75db-4d24-80ca-b1bdd8126449	68df64e1-2f59-47dd-b7ad-8a035a04caeb	db464f3d-feb2-4f98-8e10-418ef80fe1b4
7b76bbed-b7a5-46a9-883a-d9f9f232e5c4	68df64e1-2f59-47dd-b7ad-8a035a04caeb	dc86105e-75a4-4c9e-9286-9edbf9ffa6e4
6ac86ed8-5c5d-41ce-9a53-726b1bb73dfa	68df64e1-2f59-47dd-b7ad-8a035a04caeb	8badfc21-fe68-48fe-9306-3e2934be8b30
0665277c-0b5b-4140-a864-b1f2e8a2ce1a	68df64e1-2f59-47dd-b7ad-8a035a04caeb	215a1771-bb90-48f1-9bc3-b3bde0958365
236a9e6b-e10a-4504-adce-dedcc6daffe8	68df64e1-2f59-47dd-b7ad-8a035a04caeb	7cb75df8-5fac-4965-b00c-03266b59de27
546d5a37-cb80-4b33-9ced-a8d99b1fba5e	68df64e1-2f59-47dd-b7ad-8a035a04caeb	99745f0d-e293-40a3-9e5b-02734e4f92e8
9af03c18-36c0-4466-9b5a-b0854e767a5b	68df64e1-2f59-47dd-b7ad-8a035a04caeb	64008f4b-8813-48aa-9051-c8c8d4b4b432
d83457f5-7b8b-4dad-aac8-25b9512c886d	68df64e1-2f59-47dd-b7ad-8a035a04caeb	8293ce8b-cec8-42bd-8525-928c03e74722
e5f500d7-122c-42ac-8605-fd059d8b1cd7	68df64e1-2f59-47dd-b7ad-8a035a04caeb	6874f17f-7205-4cdf-b792-05ec400edd8d
a316e913-827d-45c7-8cd5-7106773334de	68df64e1-2f59-47dd-b7ad-8a035a04caeb	14fc6541-160c-416f-981e-fbd7886fbd2c
7d3ad41c-703b-417c-8c21-28a498de16f2	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	8a626b06-8f8d-4180-88ab-1e19be97af21
483a644c-0c3d-40df-aeca-2b56ce8f95b3	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	3474eb73-6a6b-4bcd-8975-c475ddbcd933
b1a2bf2c-445c-4065-af7d-d3467bb52cad	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	d1ff14bb-9c3b-496e-9980-6d1cb1b0ed78
43ce9b4c-3557-40e3-a16b-3ebc44e97099	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	1ab9e7a0-911f-419e-87eb-98536b53ca8f
920f0d38-09b4-411d-9726-54f401739ea2	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	ed71c96a-5158-4e13-8108-2e0a7f206483
17becff5-9477-41ce-8291-3ddacb1d0e8b	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	27b4c560-bcc8-41f4-a220-b3eb97dee4cc
de2257bc-1f0b-4110-af6b-860433f719af	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	7228042d-6603-4c0b-b6f9-2472140dab78
21750c70-77d7-4eb3-8599-5ad37bc87b28	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	8badfc21-fe68-48fe-9306-3e2934be8b30
5507249f-8c99-4bd0-83c2-43a128b8b2da	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	2c9670f1-21c4-4375-8606-e2c966271e03
dd618a9b-dbb0-4d2a-a6ed-6c51565e0c83	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	215a1771-bb90-48f1-9bc3-b3bde0958365
07761166-2d63-4944-9069-ec3f92ff309c	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	642cdb6a-51b1-482b-aa3e-6c1e0da69188
67077095-2fb2-41d4-9041-069772529031	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	77524300-6b79-4bce-8b22-17e10a8cc170
ef1bd238-14d7-48e1-8764-2ef9d36a09ac	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	7280ee3e-dbac-40fd-bfa1-3cf50643df08
a2977d17-f551-4361-a186-678d9420fc8c	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	392fc6c0-d4ba-4c68-b777-1cc38e03bc11
dc192ce3-657c-466a-b766-8e8aadd1ec0e	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	6062988c-d8ed-484e-bb85-df3621ca7c96
07673864-0295-4f69-b837-8395ea3ff53a	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	09f7343f-4c8d-4702-be64-14b9fe968e4e
cb9f56cc-6e36-44c2-b405-20b141d2a785	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	99745f0d-e293-40a3-9e5b-02734e4f92e8
dfb00630-983b-4136-b19f-5649c5f10b45	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	dc6e9dbf-1220-477a-b7b5-e83342d7ca1d
1f7cc495-05f9-4ab7-91c3-7fb93a7e4c1e	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	db464f3d-feb2-4f98-8e10-418ef80fe1b4
648aca1e-9616-4c93-9a1c-38c432334884	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	b1f03053-8171-4d6f-a7ee-c39ea5ff12ad
f7d51a58-bb6f-42c8-a080-3dc5895bc7cf	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	f6dc45f0-1c41-4fbb-9c9e-b4a0d3ad585e
7265b08c-b06d-412b-b4db-d182367170a4	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	fef9b025-391c-4ddb-ab87-eca4f988bd52
48b9abb9-d8f5-4a95-b8fe-afbbfa2c7846	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	10c719cd-4cd5-487a-81ab-79a0316aae29
faebac4f-c5f4-41fa-a52a-cf9c2dfa700b	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	91487a93-abc4-4c6b-9ed8-a7c230984c76
3342c5c7-e496-4374-ab9f-98dff731fe8d	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	7cf9e44c-4f45-485a-811a-85dc59d6b49d
4b16a9fe-5404-4c2d-a51e-3f9df6f8e594	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	1fabde2c-0576-4b5e-b2b3-a8f1b099fc0c
0043cbde-7333-4f63-af4e-edbb9782bf75	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	68863697-d26f-4986-87da-aca103b1a492
8499e28e-7eed-42bd-862d-37135d5679a9	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	0fc6dec2-b729-40d9-991a-4cd646350eea
32eb3e87-c31e-4075-8194-52d95e13c205	60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	ef09154e-ee87-4e85-93b5-f92c8804284b
509fc493-43ef-4e5e-9ec1-3cc09ee5d20c	68df64e1-2f59-47dd-b7ad-8a035a04caeb	2be46795-9ba0-487d-bf5b-9a29e525a6a8
931ee13c-a125-49a9-a535-a1b1741ff580	68df64e1-2f59-47dd-b7ad-8a035a04caeb	4ae6333c-4717-4acd-a3cd-804d27952130
4c6fc9f3-0427-4fbf-9555-57919afd4918	68df64e1-2f59-47dd-b7ad-8a035a04caeb	229d5946-e702-4e4a-8cad-f1b5737d1100
0860d9af-5a4c-40b3-804d-ff6295730fbb	68df64e1-2f59-47dd-b7ad-8a035a04caeb	d2febc18-728e-4f2a-8905-8bc00ac447a9
331bc260-e03c-4a57-9ff0-db044147726e	68df64e1-2f59-47dd-b7ad-8a035a04caeb	23c778ff-1a41-4432-961f-a90839e303e1
baeb495a-85a1-46c6-842c-a0a774566062	68df64e1-2f59-47dd-b7ad-8a035a04caeb	4b779cd3-4db2-4695-8453-1e7300416766
e6d3c2ba-1991-4c17-bb9e-083059237974	68df64e1-2f59-47dd-b7ad-8a035a04caeb	e4559a8c-eee1-4971-961b-e55e322fb135
ec5c114b-ca99-4b64-b614-0943ed743090	68df64e1-2f59-47dd-b7ad-8a035a04caeb	51ec93f4-66d5-4be5-879b-1de32036e158
02a0b1d8-1808-4a47-be00-b3026b6fed9f	68df64e1-2f59-47dd-b7ad-8a035a04caeb	2d8d33db-a727-49c3-9307-577a5e7b4ac0
4c7640d5-ea06-406e-a23b-4520fb01630c	68df64e1-2f59-47dd-b7ad-8a035a04caeb	6dd21728-b753-45c8-af5d-c2befd51d0a5
c983f2cf-1c3c-47c2-8d81-284d4c0e3fa5	68df64e1-2f59-47dd-b7ad-8a035a04caeb	2b9ba887-8885-4bed-9729-f97ed5a0ea02
2814430d-1b58-4249-af8b-905da9c08041	68df64e1-2f59-47dd-b7ad-8a035a04caeb	e74e008d-333a-482e-928d-8503c0e713d4
bcdf67eb-01e4-438f-a6d8-bc91ecf8e569	68df64e1-2f59-47dd-b7ad-8a035a04caeb	99fb24ff-2bcd-4223-b7fa-f4b519cff00f
caeecbd6-8555-43c3-9f84-bf9d115a83e9	68df64e1-2f59-47dd-b7ad-8a035a04caeb	20a011a0-04bd-4fa0-aa2d-f4740bd73521
6871c2de-27a9-4950-974a-b86546c6e016	68df64e1-2f59-47dd-b7ad-8a035a04caeb	17682675-df4e-45d5-9cdc-509753dfcc2e
515ac9ee-b445-4f93-b3a4-ebf50fa9083a	68df64e1-2f59-47dd-b7ad-8a035a04caeb	b8473518-39f6-40a5-8406-98fa89f799ec
8dce15ce-da5b-440b-a97e-c8fde95b10e6	68df64e1-2f59-47dd-b7ad-8a035a04caeb	39216aaa-e0f1-48ea-abf6-b14b6cb318e5
41db8f82-8699-41f6-8cce-4d4d91bfe114	68df64e1-2f59-47dd-b7ad-8a035a04caeb	5d6c1e3d-09a4-4c87-9298-64348369f083
78566081-2d63-4421-a827-fba35df34f2e	68df64e1-2f59-47dd-b7ad-8a035a04caeb	ed71c96a-5158-4e13-8108-2e0a7f206483
105ffb1c-be38-4fc8-8753-2b0c8123af29	68df64e1-2f59-47dd-b7ad-8a035a04caeb	27b4c560-bcc8-41f4-a220-b3eb97dee4cc
4a1354dc-d54b-4000-8feb-80dbf3fa57d8	68df64e1-2f59-47dd-b7ad-8a035a04caeb	7228042d-6603-4c0b-b6f9-2472140dab78
467fc7dc-e2cc-4e5b-908f-876e6799faf1	68df64e1-2f59-47dd-b7ad-8a035a04caeb	f6dc45f0-1c41-4fbb-9c9e-b4a0d3ad585e
934d18ba-7e20-4067-9a63-0cc5f533e020	68df64e1-2f59-47dd-b7ad-8a035a04caeb	58c65f24-7166-4881-b5da-09669e8f59a7
e7746af5-f3ea-43ea-8702-f6e9428ecd44	68df64e1-2f59-47dd-b7ad-8a035a04caeb	2c9670f1-21c4-4375-8606-e2c966271e03
680a8e75-5659-42c0-87ee-a01416161cca	68df64e1-2f59-47dd-b7ad-8a035a04caeb	10c719cd-4cd5-487a-81ab-79a0316aae29
e6c158ca-ffb1-443c-9632-ea1751f38482	68df64e1-2f59-47dd-b7ad-8a035a04caeb	587903e3-82fb-4949-9c98-e754158281bc
117e037b-2b63-42b8-8e26-ede52a77a98f	68df64e1-2f59-47dd-b7ad-8a035a04caeb	3474eb73-6a6b-4bcd-8975-c475ddbcd933
594decab-e704-4da1-aa1f-cac28463d950	68df64e1-2f59-47dd-b7ad-8a035a04caeb	d1ff14bb-9c3b-496e-9980-6d1cb1b0ed78
b8a15384-b416-4bbf-87af-6969ed7a0307	68df64e1-2f59-47dd-b7ad-8a035a04caeb	09f7343f-4c8d-4702-be64-14b9fe968e4e
b6ac3fa6-2980-4c4f-95fc-fea6ea294688	68df64e1-2f59-47dd-b7ad-8a035a04caeb	c56b5357-26a7-40f8-8a46-d1f752fc8d2b
c533575f-ebe5-4b0a-9e75-4c96ea6dae2e	68df64e1-2f59-47dd-b7ad-8a035a04caeb	03888d29-f94b-4a4c-bfaf-834d91b63ef0
d9433f43-d60a-4a2d-a298-5c01c94c8c4d	68df64e1-2f59-47dd-b7ad-8a035a04caeb	13d1312b-7e85-4cb6-803f-58327040286f
89918e79-bf7f-4f58-8eb6-f9236003e323	68df64e1-2f59-47dd-b7ad-8a035a04caeb	33209b78-5d35-4af6-8f57-b8a67006bb11
b019780a-6232-41b5-bb15-ffe92b471bca	68df64e1-2f59-47dd-b7ad-8a035a04caeb	642cdb6a-51b1-482b-aa3e-6c1e0da69188
026f2e1e-9cbc-4541-8d96-ecac86a32fd4	68df64e1-2f59-47dd-b7ad-8a035a04caeb	f3597cf4-e7b9-43b7-b4b9-6aaec6178bde
88399a3a-7c85-4bfe-8469-602a0f274d44	68df64e1-2f59-47dd-b7ad-8a035a04caeb	77ae9a94-c90d-4dba-b378-f19d8259cab7
f3f87ff0-4bad-46fb-8c3b-edf1d21152a6	68df64e1-2f59-47dd-b7ad-8a035a04caeb	0a713860-c66a-41d5-bd10-bdd4795f7dfb
c46bc9e5-c463-403e-9672-c0d2c9387529	68df64e1-2f59-47dd-b7ad-8a035a04caeb	56994afb-caaa-44e1-8c37-72830c5355eb
be298e96-27ae-4113-85e4-15717354b5be	68df64e1-2f59-47dd-b7ad-8a035a04caeb	91487a93-abc4-4c6b-9ed8-a7c230984c76
f9665bdd-fb06-4de2-8906-94e3c2437d79	68df64e1-2f59-47dd-b7ad-8a035a04caeb	7cf9e44c-4f45-485a-811a-85dc59d6b49d
9fe72e3a-c285-406b-b9e7-2c5677e662bb	68df64e1-2f59-47dd-b7ad-8a035a04caeb	7280ee3e-dbac-40fd-bfa1-3cf50643df08
d5819b19-b5f7-4267-9404-9e6ba13d8edf	68df64e1-2f59-47dd-b7ad-8a035a04caeb	7ed35511-c647-421b-b2be-4f50e503b527
ab1ea97a-b4f3-40c0-b414-d86d1ae3cb1f	68df64e1-2f59-47dd-b7ad-8a035a04caeb	4449a13a-30e9-43ce-90ce-4f38b5363f98
ac6be14f-bb72-4c28-b429-b0dca5b5c7bf	68df64e1-2f59-47dd-b7ad-8a035a04caeb	3dad357b-9749-4478-835d-9eb59a1c0d7c
ac47eeef-4bf8-426b-979c-856ceb67fd47	68df64e1-2f59-47dd-b7ad-8a035a04caeb	0fc6dec2-b729-40d9-991a-4cd646350eea
b71c69b2-41f6-475a-aa86-84b365f2af55	68df64e1-2f59-47dd-b7ad-8a035a04caeb	ef09154e-ee87-4e85-93b5-f92c8804284b
4c5bf940-6a92-411b-b404-f6aaef7f172a	68df64e1-2f59-47dd-b7ad-8a035a04caeb	bac1b82c-9e17-4a0a-bfa0-2b859cbf40ca
ef64231f-5a7e-4497-96ce-5a03c60727af	68df64e1-2f59-47dd-b7ad-8a035a04caeb	88d54507-c1b7-4588-b0ef-041cc246cd47
8c999c7f-1822-4558-84e7-1dae800288a9	68df64e1-2f59-47dd-b7ad-8a035a04caeb	68863697-d26f-4986-87da-aca103b1a492
bd2b10c6-7558-486c-babd-ee86ddd5a49f	68df64e1-2f59-47dd-b7ad-8a035a04caeb	28e95a59-9aac-49e8-9b1f-a0176c4c9936
75d019f3-0c33-4274-8fa7-1f3984b24993	a1ecd7bd-1754-4abc-9151-90790208fcb6	2be46795-9ba0-487d-bf5b-9a29e525a6a8
8a0f16d1-8918-42e0-8b8f-14301a6e8d51	a1ecd7bd-1754-4abc-9151-90790208fcb6	229d5946-e702-4e4a-8cad-f1b5737d1100
3d1b9fb3-7b0f-4fc9-be33-06a4bdb2995b	a1ecd7bd-1754-4abc-9151-90790208fcb6	6dd21728-b753-45c8-af5d-c2befd51d0a5
48342a96-9a17-4730-ad7b-1e7212d91e7c	a1ecd7bd-1754-4abc-9151-90790208fcb6	cc5e2b7f-7541-4ca4-9714-8d00a829327c
85244594-7cc0-43ce-b491-5814dee9908b	a1ecd7bd-1754-4abc-9151-90790208fcb6	90be9fa2-d1b3-4dcc-82e8-fe0307dcf8f9
407de8d8-8d36-49bf-ac9d-e120bffaf287	a1ecd7bd-1754-4abc-9151-90790208fcb6	6d03a79c-c4cc-4d8a-bc4c-d1be1c535d80
bb64cbe4-fd6c-4762-add5-18066432ed8c	a1ecd7bd-1754-4abc-9151-90790208fcb6	00b2f75d-d19e-4da8-8e49-e53bf8d46855
4dade260-26bf-4854-8dd9-65467661b951	a1ecd7bd-1754-4abc-9151-90790208fcb6	27b4c560-bcc8-41f4-a220-b3eb97dee4cc
933df521-ed91-4b72-8ddc-1bc45dfbc035	a1ecd7bd-1754-4abc-9151-90790208fcb6	f6dc45f0-1c41-4fbb-9c9e-b4a0d3ad585e
055e690f-5ed6-4926-81e8-9d03596fe033	a1ecd7bd-1754-4abc-9151-90790208fcb6	8badfc21-fe68-48fe-9306-3e2934be8b30
6fd4c05f-f7fa-4127-9984-d60db6701345	11009ed5-29cf-4766-8ba0-4942cb92b46d	6d03a79c-c4cc-4d8a-bc4c-d1be1c535d80
b0d0d263-976e-4db0-b058-63793a016b1c	11009ed5-29cf-4766-8ba0-4942cb92b46d	587903e3-82fb-4949-9c98-e754158281bc
cbe9bedb-b23a-40f6-8c80-5256dcc50efa	68df64e1-2f59-47dd-b7ad-8a035a04caeb	ede92d09-1f1a-4b5f-8315-a3eb8a4bd89e
bf7b7a2f-3299-466b-9e63-e1bc85f8390c	68df64e1-2f59-47dd-b7ad-8a035a04caeb	ae959be4-1d51-48b1-86d8-b544366001d6
07493b1e-6c10-4c4c-8980-1816f8ccf795	68df64e1-2f59-47dd-b7ad-8a035a04caeb	e0294030-091d-4bf7-9497-834f29a46920
fc0fc144-a7d5-4dc7-87b1-65fd4827ac73	68df64e1-2f59-47dd-b7ad-8a035a04caeb	77524300-6b79-4bce-8b22-17e10a8cc170
105ccbf8-dc08-45fd-a016-cf5eb61038bf	68df64e1-2f59-47dd-b7ad-8a035a04caeb	1fabde2c-0576-4b5e-b2b3-a8f1b099fc0c
cd8b6180-eb41-4ba4-9e74-4c29ca00aacc	68df64e1-2f59-47dd-b7ad-8a035a04caeb	01f5ec9f-bea8-49b2-9ce4-75c1847c6027
a092653d-0499-4fbf-a8b5-c712667090c2	68df64e1-2f59-47dd-b7ad-8a035a04caeb	2ac82ffa-e6ce-4997-a839-6390b28cd379
fcf8e60b-820d-431f-8577-1166bc0199fc	68df64e1-2f59-47dd-b7ad-8a035a04caeb	93c3b968-6731-485f-9c99-88c2e8f7d72d
7554eccd-0beb-496b-b4e6-819cef32b837	68df64e1-2f59-47dd-b7ad-8a035a04caeb	392fc6c0-d4ba-4c68-b777-1cc38e03bc11
067955e2-2dd7-43c7-ba48-e9b0c3172864	68df64e1-2f59-47dd-b7ad-8a035a04caeb	6a76985c-7779-4b2f-9688-3fd4106f522c
3967d9f6-500e-41a8-b930-04c256351618	68df64e1-2f59-47dd-b7ad-8a035a04caeb	707249e6-2004-4ae6-89fc-27435a4aa27e
8b1c157c-3f40-4c68-a4a4-fcae61ac876b	68df64e1-2f59-47dd-b7ad-8a035a04caeb	dc6e9dbf-1220-477a-b7b5-e83342d7ca1d
d126ff8f-5cbe-4813-bf83-7890ed1a6732	68df64e1-2f59-47dd-b7ad-8a035a04caeb	8a1fedec-1c20-49cb-9784-fa8916db5105
e6add807-8acd-41f2-99d4-75f085a3d41a	68df64e1-2f59-47dd-b7ad-8a035a04caeb	5b99b3c2-c3e5-454b-8695-96d27348a055
4362f63a-5d86-4c92-8e53-32533c2ee773	68df64e1-2f59-47dd-b7ad-8a035a04caeb	548af476-8964-4475-8a0c-c21c2a7603e9
e33e433e-6804-407d-aa95-20bbb692e3a9	68df64e1-2f59-47dd-b7ad-8a035a04caeb	ffed896d-2121-4620-8c47-801a2b43fff5
1a214597-63b3-45c9-86bc-fb5e0588ac78	a1ecd7bd-1754-4abc-9151-90790208fcb6	70082da0-8d02-47e0-be8d-31faad192327
e2247531-a698-47b4-be6d-3e1766d3694f	a1ecd7bd-1754-4abc-9151-90790208fcb6	2c9cf870-d095-465d-ba17-fe74c609f7a2
d0df7c26-bfc2-4bcb-a83b-b91c21adca8d	a1ecd7bd-1754-4abc-9151-90790208fcb6	99fb24ff-2bcd-4223-b7fa-f4b519cff00f
dd7059b9-8cf6-4f4c-b860-7fd7a236408c	a1ecd7bd-1754-4abc-9151-90790208fcb6	20a011a0-04bd-4fa0-aa2d-f4740bd73521
caa3e74c-d82a-492a-b0c5-f82d1f75f700	a1ecd7bd-1754-4abc-9151-90790208fcb6	083b77a5-1ffa-4050-838b-f42914d89065
1c905d80-9621-407f-b155-9945a822335f	a1ecd7bd-1754-4abc-9151-90790208fcb6	05337d2e-eeb6-4ed5-956f-c5ddb2c0ec71
db82d460-eb8c-4e1f-9969-cad9ad04e1b8	a1ecd7bd-1754-4abc-9151-90790208fcb6	39216aaa-e0f1-48ea-abf6-b14b6cb318e5
ff54a0be-c4e8-45da-aca0-71ac15b4b414	a1ecd7bd-1754-4abc-9151-90790208fcb6	ed71c96a-5158-4e13-8108-2e0a7f206483
fbbf02ec-dddf-4580-ae4d-2e015c3c8d0b	a1ecd7bd-1754-4abc-9151-90790208fcb6	64008f4b-8813-48aa-9051-c8c8d4b4b432
22650dc7-30f0-451a-8d78-c8d3411a045a	a1ecd7bd-1754-4abc-9151-90790208fcb6	8293ce8b-cec8-42bd-8525-928c03e74722
fb027616-e499-40d8-b0d5-29368efefe61	a1ecd7bd-1754-4abc-9151-90790208fcb6	03888d29-f94b-4a4c-bfaf-834d91b63ef0
ed8358d7-e1fc-4889-8ea6-e43d0c22bf9b	a1ecd7bd-1754-4abc-9151-90790208fcb6	0fc6dec2-b729-40d9-991a-4cd646350eea
be7d51a2-fef3-42d0-96c9-a5bd3d70941c	a1ecd7bd-1754-4abc-9151-90790208fcb6	707249e6-2004-4ae6-89fc-27435a4aa27e
6c9ddda2-cd6e-46b4-a632-9b7d9afadb2e	a1ecd7bd-1754-4abc-9151-90790208fcb6	93c3b968-6731-485f-9c99-88c2e8f7d72d
a547c8d8-0068-4951-9d58-2f646dae20c0	11009ed5-29cf-4766-8ba0-4942cb92b46d	2c9cf870-d095-465d-ba17-fe74c609f7a2
10c606ed-f427-4572-8776-f77f9aa1388c	11009ed5-29cf-4766-8ba0-4942cb92b46d	c420b87e-0661-4cff-aa68-58fc059344f5
ba836c08-e61d-4dbb-943c-7164e4d492af	11009ed5-29cf-4766-8ba0-4942cb92b46d	915bc18a-b23d-4f3f-8a13-8470f2a3672e
3a4e2ee2-9391-4d28-9a2b-b04343005ef9	11009ed5-29cf-4766-8ba0-4942cb92b46d	8293ce8b-cec8-42bd-8525-928c03e74722
a5f8c8b6-99d0-4188-9946-513f56554b83	11009ed5-29cf-4766-8ba0-4942cb92b46d	03888d29-f94b-4a4c-bfaf-834d91b63ef0
82ff3765-a1f4-4a32-a2ec-3d3a97fe3ae6	11009ed5-29cf-4766-8ba0-4942cb92b46d	548af476-8964-4475-8a0c-c21c2a7603e9
6041bae7-3b32-4826-920a-da26325dfa59	11009ed5-29cf-4766-8ba0-4942cb92b46d	707249e6-2004-4ae6-89fc-27435a4aa27e
eaa451b5-157e-4038-9adf-53b29e1e1513	11009ed5-29cf-4766-8ba0-4942cb92b46d	dc86105e-75a4-4c9e-9286-9edbf9ffa6e4
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.roles (id, name, description, "isDefault", "createdAt", "updatedAt") FROM stdin;
60fb3ce9-c481-4ee1-9ae0-9dc32115d33c	SUPER_ADMIN	Super Administrator with full access	f	2026-04-20 12:17:54.372	2026-04-20 12:17:54.372
68df64e1-2f59-47dd-b7ad-8a035a04caeb	ADMIN	Administrator with limited access	f	2026-04-20 12:17:54.38	2026-04-20 12:17:54.38
a1ecd7bd-1754-4abc-9151-90790208fcb6	EMPLOYEE	Employee with basic management access	f	2026-04-20 12:17:54.382	2026-04-20 12:17:54.382
11009ed5-29cf-4766-8ba0-4942cb92b46d	USER	Regular user with basic access	t	2026-04-20 12:17:54.385	2026-04-20 12:17:54.385
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.sessions (id, "userId", token, device, location, "ipAddress", "userAgent", "isActive", "expiresAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.settings (id, key, value, "createdAt", "updatedAt") FROM stdin;
e78f8014-1385-4c2f-adae-79b7e35ea37d	companyName	FreeBike	2026-04-20 12:17:55.388	2026-04-20 12:17:55.388
dd649082-c74c-473b-a350-f90763cd7f0e	description	Service de location de vélos électriques écologique et moderne	2026-04-20 12:17:55.391	2026-04-20 12:17:55.391
96a1cede-1a57-4b60-8f35-c95bcb0278c3	email	contact@freebike.cm	2026-04-20 12:17:55.393	2026-04-20 12:17:55.393
f86c7b35-4c9a-4e38-a7f1-0ee6f45d6a55	phone	+237 690 60 11 86	2026-04-20 12:17:55.396	2026-04-20 12:17:55.396
0debe6ae-d18b-4ad2-899d-e31cbf53acc8	address	Boulevard de la Liberté	2026-04-20 12:17:55.402	2026-04-20 12:17:55.402
3fe7c508-164e-467d-9481-48021d567de5	city	Douala	2026-04-20 12:17:55.405	2026-04-20 12:17:55.405
864c7496-5077-4f7a-a656-bff3095ab6e9	country	Cameroun	2026-04-20 12:17:55.407	2026-04-20 12:17:55.407
4bc9e7bd-2bd9-460e-91c4-dd093d4728c3	orangeMoneyNumber	+237 690 60 11 86	2026-04-20 12:17:55.409	2026-04-20 12:17:55.409
6837487b-b029-4d94-93bd-852b794527ca	mobileMoneyNumber	+237 677 123 456	2026-04-20 12:17:55.411	2026-04-20 12:17:55.411
918696e5-d510-430e-80b1-f63241537ba4	facebook	https://facebook.com/freebike	2026-04-20 12:17:55.414	2026-04-20 12:17:55.414
f4a04a59-4793-4b42-aae9-eb982678ad35	instagram	https://instagram.com/freebike	2026-04-20 12:17:55.416	2026-04-20 12:17:55.416
45e95931-e1e7-4ba6-8e28-222e5b94b3b8	website	https://freebike.cm	2026-04-20 12:17:55.417	2026-04-20 12:17:55.417
\.


--
-- Data for Name: subscription_formulas; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.subscription_formulas (id, "packageId", name, description, "formulaType", "numberOfDays", "dayStartHour", "dayEndHour", "chargeAfterHours", "afterHoursPrice", "afterHoursType", "maxRideDurationHours", price, "isActive", "createdAt", "updatedAt") FROM stdin;
b87d1a57-2d42-433c-bb5b-2b8c0c32bf47	88e15336-0115-4ae6-950a-34862fe36ddf	Forfait Jour		TIME_WINDOW	1	8	19	f	0	FIXED_PRICE	\N	1000	t	2026-04-20 19:10:00.318	2026-04-20 19:10:00.318
\.


--
-- Data for Name: subscription_packages; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.subscription_packages (id, name, description, "isActive", "createdAt", "updatedAt") FROM stdin;
88e15336-0115-4ae6-950a-34862fe36ddf	Standard		t	2026-04-20 19:07:53.479	2026-04-20 19:07:53.479
\.


--
-- Data for Name: subscription_promotion_rules; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.subscription_promotion_rules (id, name, description, "discountType", "discountValue", "startDate", "endDate", "usageLimit", "usageCount", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.subscriptions (id, "userId", "packageId", "formulaId", "planId", type, "isActive", "startDate", "endDate", "dayResetTime", "currentDay", "usedRideMinutes", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.transactions (id, "walletId", type, amount, fees, "totalAmount", status, "paymentMethod", "paymentProvider", "externalId", metadata, "requestedBy", "validatedBy", "validatedAt", "rejectionReason", "canModify", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: unlock_requests; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.unlock_requests (id, "userId", "bikeId", "reservationId", status, "requestedAt", "validatedAt", "rejectedAt", "validatedBy", "adminNote", "rejectionReason", metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: user_preferences; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.user_preferences (id, "userId", "rideNotifications", "promotionalNotifications", "securityNotifications", "systemNotifications", "emailNotifications", "pushNotifications", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.users (id, email, password, "firstName", "lastName", phone, address, avatar, role, status, "isActive", "emailVerified", "emailVerificationToken", "emailVerificationExpires", "phoneVerified", "phoneVerificationCode", "phoneVerificationExpires", "phoneVerifiedBy", "phoneVerifiedAt", "accountVerified", "accountVerifiedAt", "accountVerifiedBy", language, "depositBalance", "depositExemptionUntil", "depositExemptionGrantedBy", "depositExemptionGrantedAt", "createdAt", "updatedAt", "roleId") FROM stdin;
785bee33-2547-460e-abc6-1030d8f36ab4	xybronix@xybronix.cm	$2a$10$ub45DwhPbm2ucNB069K6ue4SpFf2Q4h7cCr5NAhRtD6mnjiS2D28u	Admin	Mask	+237600000000	\N	\N	SUPER_ADMIN	active	t	t	\N	\N	f	\N	\N	\N	\N	f	\N	\N	fr	0	\N	\N	\N	2026-04-20 12:17:55.363	2026-04-20 12:17:55.363	\N
3c695091-d0de-4f35-a124-de6079a518d0	admin@freebike.cm	$2a$10$dVKXaqcpK.IZIX97drpu9eUUvj9i/ShvQ3U9FpxcTw6Qhls3R0J6G	Admin	FreeBike	+237600000001	\N	\N	SUPER_ADMIN	active	t	t	\N	\N	f	\N	\N	\N	\N	f	\N	\N	fr	0	\N	\N	\N	2026-04-20 12:17:55.37	2026-04-20 12:17:55.37	\N
095101a3-7295-4cb9-a394-44c3a9373bc5	manager@freebike.cm	$2a$10$dVKXaqcpK.IZIX97drpu9eUUvj9i/ShvQ3U9FpxcTw6Qhls3R0J6G	Manager	System	+237600000002	\N	\N	ADMIN	active	t	t	\N	\N	f	\N	\N	\N	\N	f	\N	\N	fr	0	\N	\N	\N	2026-04-20 12:17:55.373	2026-04-20 12:17:55.373	\N
21366214-3c3d-432f-ae8a-42e4eeb164a3	user@freebike.cm	$2a$10$0ga9Big.w7unMZfh2hRbvuwtINUq4pD4JwU.jul3NdwowW8Fzgao6	Jean	Dupont	+237600000003	\N	\N	USER	active	t	t	\N	\N	f	\N	\N	\N	\N	f	\N	\N	fr	0	\N	\N	\N	2026-04-20 12:17:55.379	2026-04-20 12:17:55.379	\N
eba02bdf-8caf-4538-96d2-ca6d9ab33251	marie@freebike.cm	$2a$10$0ga9Big.w7unMZfh2hRbvuwtINUq4pD4JwU.jul3NdwowW8Fzgao6	Marie	Martin	+237600000004	\N	\N	USER	active	t	t	\N	\N	f	\N	\N	\N	\N	f	\N	\N	fr	0	\N	\N	\N	2026-04-20 12:17:55.382	2026-04-20 12:17:55.382	\N
662bc466-fc42-4b06-bbf7-64a22609a847	support@freebike.cm	$2a$10$dVKXaqcpK.IZIX97drpu9eUUvj9i/ShvQ3U9FpxcTw6Qhls3R0J6G	Support	Team	+237600000005	\N	\N	EMPLOYEE	active	t	t	\N	\N	f	\N	\N	\N	\N	f	\N	\N	fr	0	\N	\N	\N	2026-04-20 12:17:55.385	2026-04-20 12:17:55.385	\N
\.


--
-- Data for Name: wallets; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.wallets (id, "userId", balance, deposit, "negativeBalance", "createdAt", "updatedAt") FROM stdin;
a36c3b2f-1412-4ead-91be-5347b0dfd627	21366214-3c3d-432f-ae8a-42e4eeb164a3	0	0	0	2026-04-20 12:17:55.435	2026-04-20 12:17:55.435
2fb80929-1560-4b5a-abce-bc94cf2a2b52	eba02bdf-8caf-4538-96d2-ca6d9ab33251	0	0	0	2026-04-20 12:17:55.438	2026-04-20 12:17:55.438
d937f9f3-45d4-4e59-8e9b-3a57b880f29f	3c695091-d0de-4f35-a124-de6079a518d0	0	0	0	2026-04-20 12:17:55.441	2026-04-20 12:17:55.441
\.


--
-- Name: activity_location_proofs activity_location_proofs_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.activity_location_proofs
    ADD CONSTRAINT activity_location_proofs_pkey PRIMARY KEY (id);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: bikes bikes_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.bikes
    ADD CONSTRAINT bikes_pkey PRIMARY KEY (id);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: free_days_beneficiaries free_days_beneficiaries_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.free_days_beneficiaries
    ADD CONSTRAINT free_days_beneficiaries_pkey PRIMARY KEY (id);


--
-- Name: free_days_rules free_days_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.free_days_rules
    ADD CONSTRAINT free_days_rules_pkey PRIMARY KEY (id);


--
-- Name: identity_documents identity_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.identity_documents
    ADD CONSTRAINT identity_documents_pkey PRIMARY KEY (id);


--
-- Name: incidents incidents_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.incidents
    ADD CONSTRAINT incidents_pkey PRIMARY KEY (id);


--
-- Name: lock_requests lock_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.lock_requests
    ADD CONSTRAINT lock_requests_pkey PRIMARY KEY (id);


--
-- Name: maintenance_logs maintenance_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.maintenance_logs
    ADD CONSTRAINT maintenance_logs_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: plan_overrides plan_overrides_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.plan_overrides
    ADD CONSTRAINT plan_overrides_pkey PRIMARY KEY (id);


--
-- Name: pricing_configs pricing_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.pricing_configs
    ADD CONSTRAINT pricing_configs_pkey PRIMARY KEY (id);


--
-- Name: pricing_plans pricing_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.pricing_plans
    ADD CONSTRAINT pricing_plans_pkey PRIMARY KEY (id);


--
-- Name: pricing_rules pricing_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.pricing_rules
    ADD CONSTRAINT pricing_rules_pkey PRIMARY KEY (id);


--
-- Name: pricing_tiers pricing_tiers_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.pricing_tiers
    ADD CONSTRAINT pricing_tiers_pkey PRIMARY KEY (id);


--
-- Name: promotion_package_relations promotion_package_relations_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.promotion_package_relations
    ADD CONSTRAINT promotion_package_relations_pkey PRIMARY KEY (id);


--
-- Name: promotion_plans promotion_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.promotion_plans
    ADD CONSTRAINT promotion_plans_pkey PRIMARY KEY (id);


--
-- Name: promotions promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_pkey PRIMARY KEY (id);


--
-- Name: push_tokens push_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.push_tokens
    ADD CONSTRAINT push_tokens_pkey PRIMARY KEY (id);


--
-- Name: reservations reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (id);


--
-- Name: residence_proofs residence_proofs_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.residence_proofs
    ADD CONSTRAINT residence_proofs_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: rides rides_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.rides
    ADD CONSTRAINT rides_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: subscription_formulas subscription_formulas_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.subscription_formulas
    ADD CONSTRAINT subscription_formulas_pkey PRIMARY KEY (id);


--
-- Name: subscription_packages subscription_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.subscription_packages
    ADD CONSTRAINT subscription_packages_pkey PRIMARY KEY (id);


--
-- Name: subscription_promotion_rules subscription_promotion_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.subscription_promotion_rules
    ADD CONSTRAINT subscription_promotion_rules_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: unlock_requests unlock_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.unlock_requests
    ADD CONSTRAINT unlock_requests_pkey PRIMARY KEY (id);


--
-- Name: user_preferences user_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: wallets wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_pkey PRIMARY KEY (id);


--
-- Name: activity_location_proofs_status_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX activity_location_proofs_status_idx ON public.activity_location_proofs USING btree (status);


--
-- Name: activity_location_proofs_userId_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "activity_location_proofs_userId_idx" ON public.activity_location_proofs USING btree ("userId");


--
-- Name: bikes_code_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX bikes_code_key ON public.bikes USING btree (code);


--
-- Name: bikes_gpsDeviceId_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX "bikes_gpsDeviceId_key" ON public.bikes USING btree ("gpsDeviceId");


--
-- Name: bikes_qrCode_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX "bikes_qrCode_key" ON public.bikes USING btree ("qrCode");


--
-- Name: free_days_beneficiaries_ruleId_userId_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX "free_days_beneficiaries_ruleId_userId_key" ON public.free_days_beneficiaries USING btree ("ruleId", "userId");


--
-- Name: identity_documents_status_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX identity_documents_status_idx ON public.identity_documents USING btree (status);


--
-- Name: identity_documents_userId_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "identity_documents_userId_idx" ON public.identity_documents USING btree ("userId");


--
-- Name: permissions_name_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX permissions_name_key ON public.permissions USING btree (name);


--
-- Name: promotion_package_relations_promotionId_packageId_formulaId_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX "promotion_package_relations_promotionId_packageId_formulaId_key" ON public.promotion_package_relations USING btree ("promotionId", "packageId", "formulaId");


--
-- Name: promotion_plans_promotionId_planId_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX "promotion_plans_promotionId_planId_key" ON public.promotion_plans USING btree ("promotionId", "planId");


--
-- Name: push_tokens_isActive_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "push_tokens_isActive_idx" ON public.push_tokens USING btree ("isActive");


--
-- Name: push_tokens_token_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX push_tokens_token_key ON public.push_tokens USING btree (token);


--
-- Name: push_tokens_userId_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "push_tokens_userId_idx" ON public.push_tokens USING btree ("userId");


--
-- Name: residence_proofs_status_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX residence_proofs_status_idx ON public.residence_proofs USING btree (status);


--
-- Name: residence_proofs_userId_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "residence_proofs_userId_idx" ON public.residence_proofs USING btree ("userId");


--
-- Name: reviews_rating_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX reviews_rating_idx ON public.reviews USING btree (rating);


--
-- Name: reviews_status_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX reviews_status_idx ON public.reviews USING btree (status);


--
-- Name: role_permissions_roleId_permissionId_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX "role_permissions_roleId_permissionId_key" ON public.role_permissions USING btree ("roleId", "permissionId");


--
-- Name: roles_name_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);


--
-- Name: sessions_expiresAt_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "sessions_expiresAt_idx" ON public.sessions USING btree ("expiresAt");


--
-- Name: sessions_isActive_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "sessions_isActive_idx" ON public.sessions USING btree ("isActive");


--
-- Name: sessions_token_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX sessions_token_key ON public.sessions USING btree (token);


--
-- Name: sessions_userId_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "sessions_userId_idx" ON public.sessions USING btree ("userId");


--
-- Name: settings_key_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX settings_key_key ON public.settings USING btree (key);


--
-- Name: user_preferences_userId_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX "user_preferences_userId_key" ON public.user_preferences USING btree ("userId");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: wallets_userId_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX "wallets_userId_key" ON public.wallets USING btree ("userId");


--
-- PostgreSQL database dump complete
--

\unrestrict 6eMoev4sIjnhDnfA16WhTbyEWvAcMyRk3WThkAQIm71kVaFc1th8CbqapADeDA5

